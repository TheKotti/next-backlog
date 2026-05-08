import { connectToDatabase } from 'lib/mongo'

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
