import { auth, signIn } from "app/auth"
import { SignIn, SignOut } from "components/AuthComponents"
import { GameTable } from "components/GameTable"
import Nav from "components/Nav"
import { connectToDatabase } from "lib/mongo"
import { getSession } from "next-auth/react"
import { Suspense } from "react"

async function getGames() {
    const authState = await auth()
    const username = authState?.user?.name ?? ""
    const isAdmin = process.env.ADMIN_USER_NAME === username

    if (isAdmin) {
        const { db } = await connectToDatabase()
        const res: Game[] = await db.collection('games')
            .find()
            .toArray()
        const games = res.map((x) => {
            // Hacky shit because I fucked up the initial date insertions
            return { ...x, finishedDate: x.finishedDate ? new Date(x.finishedDate).toISOString() : null }
        })

        // Only plain objects can be passed to Client Components from Server Components.
        const simpleGames = JSON.parse(JSON.stringify(games))

        return simpleGames
    }
    return []
}

export default async function Admin() {
    const authState = await auth()
    const username = authState?.user?.name ?? ""
    const isAdmin = process.env.ADMIN_USER_NAME === username

    const games = await getGames()

    console.log('authState', games)

    return (
        <>
            <Nav />
            {isAdmin ? <GameTable games={games} isAdmin /> : null}

        </>
    )
}