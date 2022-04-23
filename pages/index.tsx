import { useEffect } from 'react'
import Head from 'next/head'
import router from 'next/router'
import { getSession, signIn } from 'next-auth/react'

import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'
import { connectToDatabase } from '../lib/mongo'

type Props = {
  isAdmin: boolean
  games: Array<Game>
}

export default function Home({ isAdmin, games = [] }: Props) {
  useEffect(() => {
    window.addEventListener('keypress', (e) => {
      if (e.key === 'å') signIn()
    }) // Should clean this up but fuck next is doing a thing so fuck it for now
  }, [])

  const gameClick = (id) => {
    if (isAdmin) {
      router.push('/recap?id=' + id)
    }
  }

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <Nav isAdmin={isAdmin} />

      <main>
        <div className={styles.container}>
          {games.length === 0 ? (
            <h2></h2>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, i) => (
                  <tr key={game._id}>
                    <td
                      onClick={() => {
                        gameClick(game._id)
                      }}
                    >
                      {game.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { res } = ctx
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId
  const { db } = await connectToDatabase()
  const games = await db.collection('games').find({}).sort({ published: -1 }).toArray()

  return {
    props: {
      isAdmin,
      games: JSON.parse(JSON.stringify(games)), //What the fuck
    },
  }
}
