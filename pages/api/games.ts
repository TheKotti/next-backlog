import axios from 'axios'
import { getSession } from 'next-auth/react'

const { connectToDatabase } = require('../../lib/mongo')
const ObjectId = require('mongodb').ObjectId

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

    case 'DELETE': {
      return deletePost(req, res)
    }
  }
}

async function getGames(req, res) {
  try {
    // connect to the database
    const { db } = await connectToDatabase()
    // fetch the posts
    const games = await db.collection('games').find({}).sort({ published: -1 }).toArray()
    // return the posts
    const parsedGames = JSON.parse(JSON.stringify(games))
    return res.json(parsedGames)
  } catch (error: any) {
    // return the error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function getGame(req, res) {
  try {
    // connect to the database
    const { db } = await connectToDatabase()
    // fetch the posts
    const game = await db.collection('games').findOne({ _id: ObjectId(req.query.id) })
    // return the posts
    return res.json(game)
  } catch (error: any) {
    // return the error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function addGame(req, res) {
  try {
    const session = (await getSession({ req })) as ExtendedSession

    if (session?.userId !== process.env.ADMIN_USER_ID) {
      res.status(401).json({ error: 'Unauthorized' })
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
        // add the post
        await db.collection('games').insertOne(game)
        // return a message
        res.json({
          message: 'Game added successfully',
          success: true,
        })
      })
      .catch((err) => {
        res.send(err)
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
    const session = (await getSession({ req })) as ExtendedSession

    if (session?.userId !== process.env.ADMIN_USER_ID) {
      res.status(401).json({ error: 'Unauthorized' })
    }

    const game: Game = req.body.game
    game.finishedDate = game.finishedDate ?? new Date().toISOString()
    game._id = new ObjectId(game._id)

    // connect to the database
    let { db } = await connectToDatabase()

    // update the published status of the post
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
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function deletePost(req, res) {
  /*   try {
    // Connecting to the database
    let { db } = await connectToDatabase()

    // Deleting the post
    await db.collection('games').deleteOne({
      _id: new ObjectId(req.body),
    })

    // returning a message
    return res.json({
      message: 'Post deleted successfully',
      success: true,
    })
  } catch (error: any) {
    // returning an error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  } */
}
