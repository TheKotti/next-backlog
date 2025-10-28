import { Recap } from 'components/Recap'
import { connectToDatabase } from 'lib/mongo'
import { auth } from 'app/auth'
import { ObjectId } from 'mongodb'
import { Metadata } from 'next'

async function getGame(id: string) {
    const authState = await auth()
    const username = authState?.user?.name ?? ""
    const isAdmin = process.env.ADMIN_USER_NAME === username

    if (isAdmin) {
        const { db } = await connectToDatabase()
        const game: Game = await db.collection('games').findOne({ _id: new ObjectId(id) })

        // Only plain objects can be passed to Client Components from Server Components.
        const simpleGame: Game = JSON.parse(JSON.stringify(game))

        return simpleGame
    }
    return null
}

export const metadata: Metadata = {
    title: 'Recap | YAME! YAME!'
}

export default async function RecapPage({
    params,
    searchParams,
}: {
    params: Promise<any>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const sp = await searchParams;
    var game = await getGame(sp.id as string)

    return (
        <>
            {game ? <Recap fetchedGame={game} /> : null}
        </>
    )
}
