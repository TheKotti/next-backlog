const { connectToDatabase } = require('lib/mongo')

export async function GET(req, res) {
    try {
        // connect to the database
        const { db } = await connectToDatabase()
        // fetch the games
        const games = await db.collection('games').find({}).sort({ published: -1 }).toArray()
        // return the games
        const parsedGames = JSON.parse(JSON.stringify(games))
        return Response.json({ parsedGames })
    } catch (error: any) {
        // return the error
        console.log('EEEEE', error)
        return res.status(501).json({ errorType: 'getGamesError', error })
    }
}