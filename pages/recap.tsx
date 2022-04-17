import axios from 'axios'
import Head from 'next/head'
import { useEffect, useState } from 'react'

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
      <div>
        <div>
          <label>Comment</label>
          <textarea
            value={game?.comment || ''}
            onChange={(e) => setGame({ ...game, comment: e.target.value })}
          ></textarea>
        </div>

        <div>
          <label>Finished</label>
          <input value={game?.finished || ''} onChange={(e) => setGame({ ...game, finished: e.target.value })}></input>
        </div>

        <div>
          <label>Rating</label>
          <input
            type='number'
            min={1}
            max={10}
            value={game?.rating || ''}
            onChange={(e) => setGame({ ...game, rating: parseInt(e.target.value) })}
          ></input>
        </div>

        <div>
          <label>Stealöth?</label>
          <input
            type='checkbox'
            checked={!!game?.stealth}
            onChange={(e) => setGame({ ...game, stealth: e.target.checked })}
          ></input>
        </div>
      </div>
    </div>
  )
}
