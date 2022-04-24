/* eslint-disable react/jsx-key */
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'

import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'
import { connectToDatabase } from '../lib/mongo'
import { GameTable } from '../components/GameTable'
import router from 'next/router'
import axios from 'axios'

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

  const pickRandomGame = () => {
    const notSelected = gameOptions.filter((x) => !x.selected)
    if (!notSelected.length) return
    const selectedId = notSelected[Math.floor(Math.random() * notSelected.length)]._id
    const selectedIndex = gameOptions.findIndex((x) => x._id === selectedId)
    const updatedOptions = [...gameOptions]
    updatedOptions[selectedIndex].selected = !updatedOptions[selectedIndex].selected
    setGameOptions(updatedOptions)
  }

  const poll = () => {
    const options = gameOptions
      .filter((x) => x.selected)
      .map((x) => x.title)
      .slice(0, 4)
    axios
      .post('api/twitch/create-poll', { options })
      .then((res) => {
        console.log('Poll created')
      })
      .catch((err) => {
        console.log('ERROR: ', err)
      })
  }

  return (
    <div>
      <Head>
        <title>Randomize</title>
      </Head>

      <Nav isAdmin={isAdmin} />

      <main>
        <button onClick={() => pickRandomGame()}>randomize</button>
        <button onClick={() => poll()}>poll</button>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <pre>
            {JSON.stringify(
              gameOptions.filter((x) => !x.selected),
              null,
              2
            )}
          </pre>
          <pre>
            {JSON.stringify(
              gameOptions.filter((x) => x.selected),
              null,
              2
            )}
          </pre>
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
  const games = await db.collection('games').find({ finished: '' }).toArray()

  return {
    props: {
      isAdmin,
      games: JSON.parse(JSON.stringify(games)), //What the fuck
    },
  }
}
