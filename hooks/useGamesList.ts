import axios from 'axios'
import { useEffect, useState } from 'react'

export const useGamesList = (isAdmin: boolean) => {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    if (isAdmin && games.length === 0) {
      axios
        .get('/api/games')
        .then((x) => {
          setGames(x.data)
        })
        .catch((err) => {
          console.log('err', err)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  return games
}
