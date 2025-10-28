import { auth } from "app/auth"
import type { Metadata } from 'next'
import { connectToDatabase } from "lib/mongo"
import styles from 'styles/Home.module.css'
import { Tables } from "components/Tables"
import NavWrapper from "components/NavWrapper"
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

export const metadata: Metadata = {
    title: 'Admin panel | YAME! YAME!'
}

export default async function Admin() {
    const authState = await auth()
    const username = authState?.user?.name ?? ""
    const isAdmin = process.env.ADMIN_USER_NAME === username

    const games = await getGames()

    return (
        <main className={styles.container}>
            <NavWrapper />
            <Suspense>
                {isAdmin ? <Tables games={games} isAdmin={isAdmin} /> : null}
            </Suspense>

        </main>
    )
}