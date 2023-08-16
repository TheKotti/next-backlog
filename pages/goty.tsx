import Head from 'next/head'

import styles from '../styles/Home.module.css'
import { connectToDatabase } from '../lib/mongo'
import { Icon } from '../components/Icon'

type Props = {
  games: Game[]
}

export default function Goty({ games }: Props) {
  return (
    <div>
      <Head>
        <title>YAME! YAME!</title>
      </Head>

      <main>
        <div className={styles.container}>
          <div className='d-flex justify-content-between'>
            <h1>Kotti's Game of the Year list</h1>

            <div className='row gx-3'>
              <a href='https://www.youtube.com/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='youtube' size={32} />
              </a>
              <a href='https://www.twitch.tv/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='twitch' size={32} />
              </a>
              <a href='https://twitter.com/TheKotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='twitter' size={32} />
              </a>
              <a href='https://discord.gg/thekotti' target='_blank' rel='noreferrer' className='col'>
                <Icon type='discord' size={32} />
              </a>
            </div>
          </div>

          <hr />

          <div className={`d-flex justify-content-between mb-3 ${styles.header}`}>
            <h2>{'Best games by year'}</h2>
          </div>

          {Object.keys(games).map((x) => {
            return games[x].map((y) => {
              return (
                <div key={y.title}>
                  {y.releaseYear} {y.title} ({y.rating})
                </div>
              )
            })
          })}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps(ctx) {
  const { db } = await connectToDatabase()
  const games: Game[] = await db.collection('games').find().toArray()

  const ratedGames = games.filter((x) => x.rating && x.releaseYear)

  const gamesByYear: { [key: number]: Game[] } = ratedGames.reduce((acc, current) => {
    const currentList = acc[current.releaseYear as number] ? acc[current.releaseYear as number] : []
    return { ...acc, [current.releaseYear as number]: [...currentList, current] }
  }, {})

  const bestByYear = {}
  Object.keys(gamesByYear).forEach((key) => {
    const maxRating = gamesByYear[key].reduce(function (prev, current) {
      return prev.rating > current.rating ? prev : current
    }, 0).rating

    bestByYear[key] = gamesByYear[key].filter((x) => x.rating === maxRating)
  })

  return {
    props: {
      games: JSON.parse(JSON.stringify(bestByYear)), //What the fuck
    },
  }
}
