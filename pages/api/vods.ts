import { Session, getServerSession } from 'next-auth'
import authOptions from './auth/[...nextauth]'

const { connectToDatabase } = require('../../lib/mongo')
const ObjectId = require('mongodb').ObjectId

export default async function handler(req, res) {
  return addVodsToGame(req, res)
}

async function addVodsToGame(req, res) {
  try {
    const session: Session | null = await getServerSession(req, res, authOptions)

    if (session?.user?.name !== process.env.ADMIN_USER_NAME) {
      res.status(401).json({ error: 'Unauthorized' })
    }

    const id = new ObjectId(req.body.id)
    const vods = req.body.vods

    // connect to the database
    let { db } = await connectToDatabase()

    // update the vod list of the post
    await db.collection('games').updateOne({ _id: id }, { $set: { vods } })

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
