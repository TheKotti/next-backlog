/* eslint-disable react/jsx-key */
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { getSession, signIn } from 'next-auth/react'
import Modal from 'react-bootstrap/Modal'

import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'
import { connectToDatabase } from '../lib/mongo'
import { GameTable } from '../components/GameTable'
import { BacklogTable } from '../components/BacklogTable'

type Props = {
  isAdmin: boolean
  games: Array<Game>
}

export default function Home({ isAdmin, games = [] }: Props) {
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
  const backlogGames = useMemo(
    () => games.filter((x) => !x.finishedDate && x.notPollable !== 'Ehh...' && x.finished !== 'Happening'),
    [games]
  )

  useEffect(() => {
    window.addEventListener('keypress', (e) => {
      if (e.key === 'å') signIn()
    }) // Should clean this up but fuck next is doing a thing so fuck it for now
  }, [])

  // It's a disaster but whatever, clean up when drunk or something
  const stats = useMemo(() => {
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
        value: `${averageTime.toFixed(2)}h`,
      },
      {
        key: 'Total time spent',
        value: `${totalTime}h)`,
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

      <Nav isAdmin={isAdmin} />

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
              <BacklogTable games={backlogGames} isAdmin={isAdmin} />
            )
          ) : playedGames.length === 0 ? (
            <h2></h2>
          ) : (
            <GameTable games={playedGames} isAdmin={isAdmin} />
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
              {stats.map(({ key, value }) => {
                return (
                  <tr className='border-bottom lh-lg'>
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

export async function getServerSideProps(ctx) {
  const { res } = ctx
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=0')
  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId
  const { db } = await connectToDatabase()
  const games = await db
    .collection('games')
    .find({
      /* finishedDate: { $ne: null } */
    })
    .toArray()

  return {
    props: {
      isAdmin,
      games: JSON.parse(JSON.stringify(games)), //What the fuck
    },
  }
}
