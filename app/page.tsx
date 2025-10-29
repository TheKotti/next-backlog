import type { Metadata } from 'next'
import styles from '../styles/Home.module.css'
import { Icon } from '../components/Icon'
import { connectToDatabase } from 'lib/mongo'
import { Tables } from 'components/Tables'
import { Suspense } from 'react'

async function getGames(): Promise<Game[]> {
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

export const metadata: Metadata = {
  title: 'YAME! YAME!'
}

export default async function Home() {
  const games = await getGames()

  return (
    <main className={styles.container}>
      <div className='d-flex justify-content-between'>
        <h1>{process.env.ADMIN_USER_NAME}&apos;s bad takes on games</h1>

        <div className='row gx-3'>
          {(process.env.ADMIN_USER_NAME == "TheKotti") && (
            <>
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
            </>
          )}

        </div>
      </div>

      <hr />

      <Suspense>
        <Tables games={games} isAdmin={false} />
      </Suspense>
    </main>
  )
}