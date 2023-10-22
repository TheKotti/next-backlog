import { useMemo, useState } from 'react'
import Head from 'next/head'

import styles from '../styles/Home.module.css'
import { GameTable } from '../components/GameTable'
import { BacklogTable } from '../components/BacklogTable'
import { connectToDatabase } from '../lib/mongo'
import { StatsDialog } from '../components/StatsDialog'
import { Icon } from '../components/Icon'

type Props = {
  games: Game[]
}

export default function Home({ games }: Props) {
  const [viewBacklog, setViewBacklog] = useState(false)

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

      <main>
        <div className={styles.container}>
          <div className='d-flex justify-content-between'>
            <h1>Kotti's bad takes on games</h1>

            <div className='row gx-3'>
              <a href='https://www.youtube.com/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='youtube' size={32} />
              </a>
              <a href='https://www.twitch.tv/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='twitch' size={32} />
              </a>
              <a href='https://bsky.app/profile/thekotti.bsky.social' target='_blank' rel='noreferrer' className='col'>
                <Icon type='twitter' size={32} />
              </a>
              <a href='https://discord.gg/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='discord' size={32} />
              </a>
            </div>
          </div>

          <hr />

          <div className={`d-flex justify-content-between mb-3 ${styles.header}`}>
            <h2>{viewBacklog ? 'Backlog' : 'Previously played'}</h2>
            <div>
              <StatsDialog games={games} />

              <button className='btn btn-primary' onClick={() => setViewBacklog(!viewBacklog)}>
                {viewBacklog ? 'Show previously played' : 'Show backlog'}
              </button>
            </div>
          </div>

          {viewBacklog ? (
            <BacklogTable games={backlogGames} isAdmin={false} />
          ) : (
            <GameTable games={playedGames} isAdmin={false} />
          )}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps(ctx) {
  const { db } = await connectToDatabase()
  const games = await db.collection('games').find().toArray()

  return {
    props: {
      games: JSON.parse(JSON.stringify(games)), //What the fuck
    },
  }
}
