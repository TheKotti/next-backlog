import axios from 'axios'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Recap } from '../components/Recap'

export default function Home() {
  const [game, setGame] = useState<Game>()

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const id = urlParams.get('id') // 6252d3ee276d78b3f366bfc0

    axios
      .get('api/games', {
        params: {
          id,
        },
      })
      .then((res) => {
        console.log(res.data.message)
        setGame(res.data.message)
      })
      .catch((err) => {
        console.log('ERROR: ', err)
      })
  }, [])

  if (!game) {
    return null
  }

  return (
    <div>
      <Head>
        <title>Recap</title>
      </Head>

      <div>{JSON.stringify(game)}</div>

      <Recap game={game} setGame={setGame} />
    </div>
  )
}
