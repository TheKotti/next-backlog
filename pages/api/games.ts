import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'

const { connectToDatabase } = require('../../lib/mongo')
const ObjectId = require('mongodb').ObjectId

export default async function handler(req, res) {
  if (!req.body.id && !req.query.id) {
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
      return updatePost(req, res)
    }

    case 'DELETE': {
      return deletePost(req, res)
    }
  }
}

async function getGames(req, res) {
  const s = await getSession({ req })
  const t = await getToken({ req })
  console.log('s', s)
  console.log('t', t)
  try {
    // connect to the database
    const { db } = await connectToDatabase()
    // fetch the posts
    const games = await db.collection('games').find({}).sort({ published: -1 }).toArray()
    // return the posts
    return res.json({
      message: JSON.parse(JSON.stringify(games)),
      success: true,
    })
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
    return res.json({
      message: JSON.parse(JSON.stringify(game)),
      success: true,
    })
  } catch (error: any) {
    // return the error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

async function addGame(req, res) {
  /*   try {
    // connect to the database
    let { db } = await connectToDatabase()
    // add the post
    await db.collection('games').insertOne(req.body)
    // return a message
    res.json({
      message: 'Post added successfully',
      success: true,
    })
  } catch (error: any) {
    // return an error
    res.json({
      message: new Error(error).message,
      success: false,
    })
  } */
}

async function updatePost(req, res) {
  /*   try {
    // connect to the database
    let { db } = await connectToDatabase()

    // update the published status of the post
    await db.collection('games').updateOne(
      {
        _id: new ObjectId(req.body),
      },
      { $set: { published: true } }
    )

    // return a message
    return res.json({
      message: 'Post updated successfully',
      success: true,
    })
  } catch (error: any) {
    // return an error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  } */
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
