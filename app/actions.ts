'use server'

import { revalidatePath } from 'next/cache'
import { ObjectId } from "mongodb"
import { v2 as cloudinary } from 'cloudinary'
import { auth } from "./auth"
const { connectToDatabase } = require('lib/mongo')

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_IMG_CLOUD_NAME,
    api_key: process.env.IMG_API_KEY,
    api_secret: process.env.IMG_API_SECRET,
})

export async function revalidateAction() {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username
        if (isAdmin) {
            await revalidatePath('/')
            return true
        }
    } catch (error) {
        console.log('Error revalidating:', error)
        return false
    }
}

export async function updateGameAction(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username
        if (isAdmin) {
            const id = String(formData.get('id'))
            const gameText = String(formData.get('game'))

            const mongoId = new ObjectId(id)
            const game: Game = JSON.parse(gameText)
            game.tags = game.tags?.map(t => t.trim().toLowerCase()).filter(t => !!t) || null

            if (!game.finishedDate) {
                game.finishedDate = (!game.finished || game.finished == 'Happening') ? null : new Date().toISOString();
            }

            // Update data
            const { db } = await connectToDatabase()
            await db.collection('games')
                .replaceOne(
                    { _id: mongoId },
                    { ...game, _id: mongoId }
                )

            return true
        }
    } catch (error) {
        console.log('Error in update game action:', error)
        return false
    }
}

export async function updateVodsAction(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username
        if (isAdmin) {
            const id = String(formData.get('id'))
            const vodsText = String(formData.get('vods'))

            const mongoId = new ObjectId(id)
            const vods = vodsText ? vodsText.split('\n') : null

            // Update data
            const { db } = await connectToDatabase()
            await db.collection('games').updateOne({ _id: mongoId }, { $set: { vods } })

            return true
        }
    } catch (error) {
        console.log('Error in update vods action:', error)
        return false
    }
}

export async function getIgdbToken(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username

        if (isAdmin) {
            const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
            const res = await fetch(url, { method: 'POST' })
            const json = await res.json()
            return json.access_token
        }

        return true
    } catch (error) {
        console.log('Error in get igdb token action:', error)
        return false
    }
}

export async function searchIgdbAction(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username

        if (isAdmin) {
            const authToken = String(formData.get('authToken'))
            const searchTerm = String(formData.get('searchTerm'))

            const url = `https://api.igdb.com/v4/games`
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Client-ID': process.env.TWITCH_CLIENT_ID!,
                    Authorization: `Bearer ${authToken}`,
                },
                body: `
                    search "${searchTerm}";
                    fields name, id, release_dates.y, url;
                    limit 50;`
            })
            const foundGames = await res.json()
            return foundGames
        }

        return false
    } catch (error) {
        console.log('Error in search igdb action:', error)
        return false
    }
}

export async function addNewGameAction(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username
        if (isAdmin) {
            const authToken = String(formData.get('authToken'))
            const gameId = String(formData.get('gameId'))

            const url = `https://api.igdb.com/v4/games`
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Client-ID': process.env.TWITCH_CLIENT_ID!,
                    Authorization: `Bearer ${authToken}`,
                },
                body: `
                    where id = ${gameId};
                    fields name, id, genres.name, themes.name, cover.image_id, release_dates.y, url, involved_companies.company.name, involved_companies.developer;`
            })
            const json = await res.json()

            const fetchedGame = json[0]

            const keywords: Array<string> = []

            if (fetchedGame.genres) {
                const genres = fetchedGame.genres.map((x) => x.name)
                keywords.push(...genres)
            }

            if (fetchedGame.themes) {
                const themes = fetchedGame.themes.map((x) => x.name)
                keywords.push(...themes)
            }
            const developers = fetchedGame.involved_companies?.filter((x) => x.developer)?.map((x) => x.company.name) || []
            const releaseYear = fetchedGame.release_dates
                ? Math.min(...fetchedGame.release_dates.map((x) => x.y).filter((x) => x))
                : null

            const game: Game = {
                title: fetchedGame.name,
                igdbId: fetchedGame.id,
                coverImageId: fetchedGame.cover.image_id,
                keywords,
                developers,
                releaseYear,
                igdbUrl: fetchedGame.url,
                finishedDate: null,
                comment: "",
                timeSpent: null,
                finished: "",
                rating: null,
                platform: "",
                streamed: false,
                vods: null,
                hltbMain: null,
                hltbExtra: null,
                hltbCompletionist: null,
                tags: null,
                additionalTimeSpent: null,
                addedDate: new Date().toISOString()
            }

            // Add cover image
            cloudinary.uploader.upload(
                `https://images.igdb.com/igdb/image/upload/t_cover_big/${fetchedGame.cover.image_id}.png`,
                { public_id: fetchedGame.cover.image_id, folder: 'covers', format: 'jpg', overwrite: false },
                function (error, result) {
                    console.error('cover image error', error)
                }
            )

            // connect to the database
            let { db } = await connectToDatabase()
            // add the game
            await db.collection('games').insertOne(game)

            return true
        }

        return true
    } catch (error) {
        console.log('Error in add new game action:', error)
        return false
    }
}

export async function getTwitchUserAction(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username

        if (isAdmin) {
            const authToken = await getIgdbToken(formData)
            const username = 'TheKotti'
            const url = `https://api.twitch.tv/helix/users?login=${username}`
            const res = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'Client-ID': process.env.TWITCH_CLIENT_ID!,
                    Authorization: `Bearer ${authToken}`,
                },
            })
            const json = await res.json()
            console.log('twitch user json', json)
        }

        return true
    } catch (error) {
        console.log('Error in get user action:', error)
        return false
    }
}