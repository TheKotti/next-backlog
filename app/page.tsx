import { Suspense } from 'react'
import Head from 'next/head'

import styles from '../styles/Home.module.css'
import { GameTable } from '../components/GameTable'
import { BacklogTable } from '../components/BacklogTable'
import { StatsDialog } from '../components/StatsDialog'
import { Icon } from '../components/Icon'
import { connectToDatabase } from 'lib/mongo'

async function getFinishedGames(): Promise<Game[]> {
  const { db } = await connectToDatabase()
  const res: Game[] = await db.collection('games')
    .find({
      $or: [
        { finishedDate: { $exists: true, $ne: null } },
        { finished: "Happening" }]
    })
    .toArray()
  const games = res.map((x) => {
    // Hacky shit because I fucked up the initial date insertions
    return { ...x, finishedDate: x.finishedDate ? new Date(x.finishedDate).toISOString() : null }
  })

  // Only plain objects can be passed to Client Components from Server Components.
  const simpleGames = JSON.parse(JSON.stringify(games))

  return simpleGames
}

export default async function Home() {

  const games = await getFinishedGames()
  /* 
  const backlogGames = useMemo(() => games.filter((x) => !x.finishedDate && x.finished !== 'Happening'), [games])
 */
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
                <Icon type='bluesky' size={32} />
              </a>
              <a href='https://discord.gg/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='discord' size={32} />
              </a>
            </div>
          </div>

          <hr />

          <div className={`d-flex justify-content-between mb-3 ${styles.header}`}>
            <h2>{'Previously played'}</h2>
            <div>
              <Suspense>
                <StatsDialog games={JSON.parse(JSON.stringify(games))} />
              </Suspense>
            </div>
          </div>

          <Suspense>
            <GameTable games={games} isAdmin={false} />
          </Suspense>

        </div>
      </main>
    </div>
  )
}