import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import Nav from '../components/Nav'

type GameOptions = {
  id: number
  title: string
  year: number
  url: string
}

export default function AddGame({ ADMIN_USER_ID }) {
  const { data: session, status } = useSession()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [pollEligible, setPollEligible] = useState<boolean>(false)
  const [options, setOptions] = useState<GameOptions[]>([])
  const [igdbToken, setIgdbToken] = useState<string>('')

  const isAdmin = session?.userId === ADMIN_USER_ID

  useEffect(() => {
    if (!isAdmin) return

    axios
      .get('api/igdb/token')
      .then((res) => {
        setIgdbToken(res.data.token)
      })
      .catch(() => {
        console.log('error')
      })
  }, [])

  const getGamesByTitle = (title: string) => {
    axios.post(`api/igdb/find-games`, { token: igdbToken, searchTerm: title }).then((response) => {
      console.log('games', response, igdbToken)
      const modifiedOptions: GameOptions[] = response.data.map((x) => {
        return {
          id: x.id,
          title: x.name,
          year: x.release_dates ? Math.min(...x.release_dates.map((x) => x.y).filter((x) => x)) : null,
          url: x.url,
        }
      })
      setOptions(modifiedOptions)
    })
  }

  const addGameById = (id: number) => {
    axios.post(`api/igdb/add-game`, { token: igdbToken, pollEligible, id }).then((res) => {
      console.log('SUCCESSFULLY ADDED GAME WITH ID ' + id)
    })
  }

  if (status === 'loading') {
    return null
  }

  if (!isAdmin) {
    return (
      <>
        <Nav />
        <h1>YOURE NOT ADMIN</h1>
      </>
    )
  }

  return (
    <div>
      <Nav />
      <div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => getGamesByTitle(searchTerm)}>get gaem</button>
          <input type='checkbox' checked={pollEligible} onChange={(e) => setPollEligible(e.target.checked)} />
        </div>

        <div>
          {options.map((x, i) => {
            return (
              <div key={i}>
                <a href={x.url} target='_blank' rel='noreferrer'>{`${x.title} (${x.year})`}</a>
                <button onClick={() => addGameById(x.id)}>Add to db</button>
              </div>
            )
          })}
        </div>
      </div>
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
