import { getSession } from 'next-auth/react'

const { connectToDatabase } = require('../../lib/mongo')
const ObjectId = require('mongodb').ObjectId

export default async function handler(req, res) {
  return setUpcoming(req, res)
}

async function setUpcoming(req, res) {
  try {
    const session = (await getSession({ req })) as ExtendedSession

    if (session?.userId !== process.env.ADMIN_USER_ID) {
      res.status(401).json({ error: 'Unauthorized' })
    }

    const id = new ObjectId(req.body.id)

    // connect to the database
    let { db } = await connectToDatabase()

    // update the finished status
    await db.collection('games').updateOne({ _id: id }, { $set: { finished: 'Happening', streamed: true } })

    // return a message
    return res.json({
      message: 'Game updated successfully',
      success: true,
    })
  } catch (error: any) {
    // TODO: CONSIDER DOING SOMETHING WITH THIS SO YOU ACTUALLY KNOW WHEN AN ERROR OCCURS
    // return an error
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}
