/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
import Head from 'next/head'
import Modal from 'react-bootstrap/Modal'

import styles from '../styles/Home.module.css'
import { GameTable } from '../components/GameTable'
import { BacklogTable } from '../components/BacklogTable'
import { connectToDatabase } from '../lib/mongo'

type Props = {
  games: Game[]
}

export default function Home({ games }: Props) {
  const [viewBacklog, setViewBacklog] = useState(false)
  const [show, setShow] = useState(false)

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

  // It's a disaster but whatever, clean up when drunk or something
  const stats = useMemo(() => {
    if (games.length === 0) return []
    // This filter crap shouldn't be necessary but fuck it
    const ratings = games.map((x) => x.rating).filter((x): x is number => x !== null)
    const times = games.map((x) => x.timeSpent).filter((x): x is number => x !== null)

    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
    const totalTime = times.reduce((a, b) => a + b, 0)
    const averageTime = totalTime / times.length
    const sneakyGames = games.filter((x) => x.stealth).length
    const streamedGames = games.filter((x) => x.streamed).length
    const finishedGames = games.filter((x) => x.finished && x.finished !== 'Nope').length
    const droppedGames = games.filter((x) => x.finished && x.finished === 'Nope').length
    const backlogLength = games.filter((x) => !x.finishedDate).length
    const pollOptions = games.filter((x) => !x.notPollable && !x.finishedDate).length

    const gamesByYear = games
      .filter((x) => x.rating)
      .reduce((acc, obj) => {
        const key = obj.releaseYear || 0
        const curGroup = acc[key] ?? []

        if (key === 0) return { ...acc }
        return { ...acc, [key]: [...curGroup, obj] }
      }, {})
    const yearlyAvg = Object.entries(gamesByYear).map(([key, value]) => {
      const yearlyRatings = (value as Game[]).map((x) => x.rating)
      const avg =
        yearlyRatings.length >= 5 ? (yearlyRatings as number[]).reduce((a, b) => a + b, 0) / yearlyRatings.length : 0
      return { key, avg }
    })
    const bestYear = yearlyAvg.reduce((prev, current) => {
      return prev.avg > current.avg ? prev : current
    }).key
    const bestYearGames = games
      .filter((x) => x.rating && x.rating >= 7 && x.releaseYear?.toString() === bestYear)
      .map((x) => x.title)
      .join(', ')

    return [
      {
        key: 'Average rating',
        value: averageRating.toFixed(2),
      },
      {
        key: 'Average time spent',
        value: `${averageTime.toFixed(2)} hours`,
      },
      {
        key: 'Total time spent',
        value: `${totalTime} hours`,
      },
      {
        key: 'Streamed games',
        value: streamedGames,
      },
      {
        key: 'Finished games',
        value: finishedGames,
      },
      {
        key: 'Dropped games',
        value: droppedGames,
      },
      {
        key: 'Sneaky games',
        value: sneakyGames,
      },
      {
        key: 'Games in backlog',
        value: backlogLength,
      },
      {
        key: 'Possible poll options',
        value: pollOptions,
      },
      {
        key: 'Best year for games, objectively',
        value: `${bestYear} (${bestYearGames})`,
      },
    ]
  }, [games])

  return (
    <div>
      <Head>
        <title>YAME! YAME!</title>
      </Head>

      <main>
        <div className={styles.container}>
          <div className={`d-flex justify-content-between mb-3 ${styles.header}`}>
            <h1>{viewBacklog ? 'Backlog' : 'Previously played'}</h1>

            <button className='btn btn-primary' onClick={() => setShow(true)}>
              Stats for nerds
            </button>

            <button className='btn btn-primary' onClick={() => setViewBacklog(!viewBacklog)}>
              {viewBacklog ? 'Show previously played' : 'Show backlog'}
            </button>
          </div>

          {viewBacklog ? ( // TODO: Clean up this mess
            playedGames.length === 0 ? (
              <h2></h2>
            ) : (
              <BacklogTable games={backlogGames} isAdmin={false} />
            )
          ) : playedGames.length === 0 ? (
            <h2></h2>
          ) : (
            <GameTable games={playedGames} isAdmin={false} />
          )}
        </div>
      </main>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Stats for nerds</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className='w-100'>
            <tbody>
              {stats.map(({ key, value }, i) => {
                return (
                  <tr key={key} className={`lh-lg ${i !== stats.length - 1 ? 'border-bottom' : ''}`}>
                    <td className='w-50'>{key}</td>
                    <td>{value}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-light' onClick={() => setShow(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
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
