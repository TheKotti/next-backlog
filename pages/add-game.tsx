import axios from 'axios'
import { getSession } from 'next-auth/react'
import router from 'next/router'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'

import Nav from '../components/Nav'

export default function AddGame({ isAdmin, username }) {
  const [igdbToken, setIgdbToken] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [options, setOptions] = useState<GameOptions[]>([])

  const [notPollable, setNotPollable] = useState<string>('')

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }

    if (isAdmin) {
      axios
        .get('api/igdb/token')
        .then((res) => {
          setIgdbToken(res.data.token)
        })
        .catch(() => {
          console.log('error')
        })
    }
  }, [isAdmin])

  const getGamesByTitle = (title: string) => {
    axios.post(`api/igdb/find-games`, { token: igdbToken, searchTerm: title }).then((response) => {
      const modifiedOptions: GameOptions[] = response.data?.map((x) => {
        return {
          id: x.id,
          title: x.name,
          year: x.release_dates ? Math.min(...x.release_dates.map((x) => x.y).filter((x) => x)) : null,
          url: x.url,
        }
      })
      setOptions(modifiedOptions)
    })

    // TODO: Do a thing with this, when adding game do this search and add to IGDB data
    // and do the same for everything already in the db.
    // And try some shit with puppeteer-core and chrome-aws-lambda or something,
    // this implementation doesn't work on Vercel
    /* axios.post('api/hltb', { searchTerm: title }).then((resp) => {
      console.log('HLTB data', resp.data)
    }) */
  }

  const addGameById = (id: number) => {
    axios
      .post(`api/games`, {
        token: igdbToken,
        notPollable,
        comment: '',
        finished: '',
        rating: null,
        stealth: false,
        tss: false,
        streamed: false,
        platform: '',
        timeSpent: null,
        finishedDate: null,
        id,
      })
      .then((res) => {
        if (res.data.success) {
          toast.success('Game saved 👌')
          console.log('SUCCESSFULLY ADDED GAME WITH ID ' + id)
        } else {
          toast.error("IT'S BROKEN")
          console.error('OH NO IT FAIOLED ' + id)
        }
      })
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div>
      <Nav isAdmin={isAdmin} username={username} />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <div style={{ marginTop: '2em' }}>
            <div>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button onClick={() => getGamesByTitle(searchTerm)}>Search gaems</button>
            </div>

            {options.map((x, i) => {
              return (
                <div key={i}>
                  <a
                    href={x.url}
                    target='_blank'
                    rel='noreferrer'
                    style={{ marginRight: '0.5em' }}
                  >{`${x.title} (${x.year})`}</a>
                  <button onClick={() => addGameById(x.id)}>Add to db</button>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              <label style={{ marginRight: '0.5em', marginTop: '2em' }}>Ban from polls</label>
              <input value={notPollable} onChange={(e) => setNotPollable(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_NAME === session?.user?.name
  const username = session?.user?.name ?? ''

  return {
    props: {
      isAdmin,
      username,
    },
  }
}
