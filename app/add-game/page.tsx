import { auth } from 'app/auth'
import { Metadata } from 'next'
import styles from 'styles/Home.module.css'
import NavWrapper from 'components/NavWrapper'
import AddGame from 'components/AddGame'

export const metadata: Metadata = {
    title: 'Add game | YAME! YAME!'
}

export default async function AddGamePage() {
    const authState = await auth()
    const username = authState?.user?.name ?? ""
    const isAdmin = process.env.ADMIN_USER_NAME === username

    if (!isAdmin) {
        return null
    }

    return (
        <main className={styles.container}>
            <NavWrapper />

            <AddGame />

        </main>
    )
}
