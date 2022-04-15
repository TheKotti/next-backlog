import axios from 'axios'
import Head from 'next/head'
import { useEffect, useState } from 'react'

export default function Home() {
  const [game, setGame] = useState<Game>()

  useEffect(() => {
    axios
      .get('api/games', {
        params: {
          id: 134595,
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

  return (
    <div>
      <Head>
        <title>Recap</title>
      </Head>

      <div>{JSON.stringify(game)}</div>
    </div>
  )
}
