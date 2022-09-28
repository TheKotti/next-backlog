/* eslint-disable react/jsx-key */
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import router from 'next/router'

import styles from '../styles/random.module.css'
import { connectToDatabase } from '../lib/mongo'
import RandomGame from '../components/RandomGame'

type Props = {
  isAdmin: boolean
  games: Array<Game>
}

export default function Home({ isAdmin, games = [] }: Props) {
  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
    }
  }, [isAdmin])

  const [gameOptions, setGameOptions] = useState<Array<RandomGame>>(games)
  const selectedGames = useMemo(() => {
    return gameOptions.filter((x) => x.selected)
  }, [gameOptions])

  const pickRandomGame = () => {
    const notSelected = gameOptions.filter((x) => !x.selected)
    if (!notSelected.length) return
    const selectedId = notSelected[Math.floor(Math.random() * notSelected.length)]._id
    const selectedIndex = gameOptions.findIndex((x) => x._id === selectedId)
    const updatedOptions = [...gameOptions]
    updatedOptions[selectedIndex].selected = selectedGames.length + 1
    setGameOptions(updatedOptions)
  }

  const vetoGame = (id: string) => {
    const updatedOptions = [...gameOptions]
    const targetGame = updatedOptions.find((x) => x._id === id)
    if (!targetGame) return
    const targetIndex = updatedOptions.indexOf(targetGame)
    updatedOptions[targetIndex].selected = 0
    setGameOptions(updatedOptions)
  }

  return (
    <div>
      <Head>
        <title>Randomize</title>
      </Head>

      <div className={styles.main}>
        <div className={styles.gameRow}>
          {selectedGames
            .sort((a, b) => a.selected! - b.selected!)
            .map((x) => (
              <RandomGame key={x._id} game={x} vetoGame={vetoGame} />
            ))}
        </div>
        <div className={styles.buttonRow}>
          <div className={styles.buttons} />
          <div className={styles.buttons}>
            <button className='btn btn-light' onClick={() => pickRandomGame()}>
              Randomize
            </button>
          </div>
          <div className={styles.buttons}></div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { res } = ctx
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=0')
  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId
  const { db } = await connectToDatabase()
  const games = await db.collection('games').find({ finishedDate: null, notPollable: '' }).toArray()

  return {
    props: {
      isAdmin,
      games: JSON.parse(JSON.stringify(games)), //What the fuck
    },
  }
}
