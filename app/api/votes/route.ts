import { auth } from 'app/auth'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'lib/mongo'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { db } = await connectToDatabase()
    const games = await db
        .collection('games')
        .find({}, { projection: { _id: 1, votes: 1 } })
        .toArray()

    const votes: Record<string, string[]> = {}
    for (const game of games) {
        votes[game._id.toString()] = game.votes ?? []
    }

    return Response.json(votes)
}

export async function POST(request: Request) {
    const authState = await auth()
    const username = authState?.user?.name
    if (!username) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gameId } = await request.json()
    if (!gameId) {
        return Response.json({ error: 'Missing gameId' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const mongoId = new ObjectId(gameId)
    const game = await db.collection('games').findOne({ _id: mongoId })
    if (!game) {
        return Response.json({ error: 'Game not found' }, { status: 404 })
    }

    const hasVoted = (game.votes ?? []).includes(username)
    if (hasVoted) {
        await db
            .collection('games')
            .updateOne({ _id: mongoId }, { $pull: { votes: username } })
    } else {
        await db
            .collection('games')
            .updateOne({ _id: mongoId }, { $addToSet: { votes: username } })
    }

    return Response.json({ voted: !hasVoted })
}
