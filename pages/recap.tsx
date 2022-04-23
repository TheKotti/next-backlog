import { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import router from 'next/router'

import { Recap } from '../components/Recap'
import { getSession } from 'next-auth/react'

export default function Home({ isAdmin }) {
  const [game, setGame] = useState<Game>()

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const id = urlParams.get('id')

    if (isAdmin) {
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
  }, [isAdmin])

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

  if (!game || !isAdmin) {
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

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId

  return {
    props: {
      isAdmin,
    },
  }
}
