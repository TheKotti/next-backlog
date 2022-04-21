import { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import router from 'next/router'

import { Recap } from '../components/Recap'
import { useAdminStatus } from '../lib/hooks'

export default function Home({ ADMIN_USER_ID }) {
  const [game, setGame] = useState<Game>()
  const adminStatus = useAdminStatus(ADMIN_USER_ID)

  useEffect(() => {
    if (adminStatus === 'notAdmin') {
      router.push('/')
      return
    }

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const id = urlParams.get('id')

    if (adminStatus === 'admin') {
      axios
        .get('api/games', {
          params: {
            id,
          },
        })
        .then((res) => {
          setGame(res.data.message)
        })
        .catch((err) => {
          console.log('ERROR: ', err)
        })
    }
  }, [adminStatus])

  const updateGame = (game: Game) => {
    axios
      .put('api/games', { game })
      .then((res) => {
        console.log(res.data.message)
      })
      .catch((err) => {
        console.log('ERROR: ', err)
      })
  }

  if (!game || adminStatus !== 'admin') {
    return null
  }

  return (
    <div>
      <Head>
        <title>Recap</title>
      </Head>

      <Recap game={game} setGame={setGame} updateGame={updateGame} />
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      ADMIN_USER_ID: process.env.ADMIN_USER_ID,
    },
  }
}
