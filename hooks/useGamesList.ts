import axios from 'axios'
import { useEffect, useState } from 'react'

export const useGamesList = () => {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    axios
      .get('/api/games')
      .then((x) => {
        setGames(x.data)
      })
      .catch((err) => {
        console.log('err', err)
      })
  }, [])

  return games
}
