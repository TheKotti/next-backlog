import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import authOptions from './auth/[...nextauth]'
import { v2 as cloudinary } from 'cloudinary'

const { connectToDatabase } = require('../../lib/mongo')
const ObjectId = require('mongodb').ObjectId

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_IMG_CLOUD_NAME,
  api_key: process.env.IMG_API_KEY,
  api_secret: process.env.IMG_API_SECRET,
})

export default async function handler(req, res) {
  if (!req.body && !req.query.id) {
    return getGames(req, res)
  }

  // switch the methods
  switch (req.method) {
    case 'GET': {
      return getGame(req, res)
    }

    case 'POST': {
      return addGame(req, res)
    }

    case 'PUT': {
      return updateGame(req, res)
    }
  }
}

async function getGames(req, res) {
  try {
    // connect to the database
    const { db } = await connectToDatabase()
    // fetch the games
    const games = await db.collection('games').find({}).sort({ published: -1 }).toArray()
    // return the games
    const parsedGames = JSON.parse(JSON.stringify(games))
    return res.json(parsedGames)
  } catch (error: any) {
    // return the error
    console.log('EEEEE', error)
    return res.status(501).json({ errorType: 'getGamesError', error })
  }
}

async function getGame(req, res) {
  try {
    // connect to the database
    const { db } = await connectToDatabase()
    // fetch the posts
    const game = await db.collection('games').findOne({ _id: ObjectId(req.query.id) })
    // return the games
    return res.json(game)
  } catch (error: any) {
    // return the error
    return res.status(500).json({ errorType: 'getOneGameError', error })
  }
}

async function addGame(req, res) {
  try {
    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session?.user?.name !== process.env.ADMIN_USER_NAME) {
      res.status(401).json({ errorType: 'addGameSessionError', session, error: 'Unauthorized' })
    }

    const gameId = req.body.id
    const authToken = req.body.token
    const notPollable = req.body.notPollable
    const comment = req.body.comment
    const timeSpent = req.body.timeSpent
    const finished = req.body.finished
    const finishedDate = req.body.finished ? req.body.finishedDate : null
    const stealth = req.body.stealth
    const tss = req.body.tss
    const streamed = req.body.streamed
    const rating = req.body.rating
    const platform = req.body.platform

    axios({
      url: 'https://api.igdb.com/v4/games',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${authToken}`,
      },
      data: `
      where id = ${gameId};
      fields name, id, genres.name, themes.name, cover.image_id, release_dates.y, url, involved_companies.company.name, involved_companies.developer;`,
    })
      .then(async (getGameResponse) => {
        if (getGameResponse.data.length < 1) {
          res.status(404).json({ error: 'Not found' })
        }

        const fetchedGame = getGameResponse.data[0]

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
          notPollable,
          finishedDate,
          comment,
          timeSpent: timeSpent || null,
          finished,
          stealth,
          tss,
          rating: rating || null,
          platform,
          streamed,
          vods: null,
        }
        // connect to the database
        let { db } = await connectToDatabase()
        // add the game
        await db.collection('games').insertOne(game)

        // Add cover image
        cloudinary.uploader.upload(
          `https://images.igdb.com/igdb/image/upload/t_cover_big/${fetchedGame.cover.image_id}.png`,
          { public_id: fetchedGame.cover.image_id, folder: 'covers', format: 'jpg' },
          function (error, result) {
            console.error('cover image error', error)
          }
        )

        // return a message
        res.json({
          message: 'Game added successfully',
          success: true,
        })
      })
      .catch((error) => {
        return res.status(500).json({ errorType: 'addGameError', error })
      })
  } catch (error: any) {
    // return an error
    res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function updateGame(req, res) {
  try {
    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session?.user?.name !== process.env.ADMIN_USER_NAME) {
      res.status(401).json({ errorType: 'updateGameSessionError', session, error: 'Unauthorized' })
    }

    const game: Game = req.body.game
    game.finishedDate = game.finished ? game.finishedDate ?? new Date().toISOString() : null
    game._id = new ObjectId(game._id)

    // connect to the database
    let { db } = await connectToDatabase()

    // update the game data
    await db.collection('games').replaceOne(
      {
        _id: game._id,
      },
      game
    )

    // return a message
    return res.json({
      message: 'Game updated successfully',
      success: true,
    })
  } catch (error: any) {
    // return an error
    return res.status(500).json({ errorType: 'updateGameError', error })
  }
}
