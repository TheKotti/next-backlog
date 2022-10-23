/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'

import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'
import { GameTable } from '../components/GameTable'
import { BacklogTable } from '../components/BacklogTable'
import { useGamesList } from '../hooks/useGamesList'
import { StatsDialog } from '../components/StatsDialog'
import { Session } from 'next-auth'

type Props = {
  isAdmin: boolean
  userId: string
}

export default function Home({ isAdmin, userId }: Props) {
  const [viewBacklog, setViewBacklog] = useState(false)

  const games = useGamesList()

  const playedGames = useMemo(
    () =>
      games
        .filter((x) => x.finishedDate || x.finished === 'Happening')
        .map((x) => {
          // Hacky shit because I fucked up the initial date insertions
          return { ...x, finishedDate: x.finishedDate ? new Date(x.finishedDate).toISOString() : null }
        }),
    [games]
  )
  const backlogGames = useMemo(() => games.filter((x) => !x.finishedDate && x.finished !== 'Happening'), [games])

  return (
    <div>
      <Head>
        <title>YAME! YAME!</title>
      </Head>

      <Nav isAdmin={isAdmin} userId={userId} />

      <main>
        <div className={styles.container}>
          <div className={`d-flex justify-content-between mb-3 ${styles.header}`}>
            <h1>{viewBacklog ? 'Backlog' : 'Previously played'}</h1>

            <StatsDialog games={games} />

            <button className='btn btn-primary' onClick={() => setViewBacklog(!viewBacklog)}>
              {viewBacklog ? 'Show previously played' : 'Show backlog'}
            </button>
          </div>

          {viewBacklog ? (
            <BacklogTable games={backlogGames} isAdmin={isAdmin} />
          ) : (
            <GameTable games={playedGames} isAdmin={isAdmin} />
          )}
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { res } = ctx
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=900')

  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId
  const userId = (session as any)?.userId ?? null // userId doesn't exist in Session etc...

  return {
    props: {
      isAdmin,
      userId,
    },
  }
}
