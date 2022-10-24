import axios from 'axios'
import { getSession } from 'next-auth/react'
import router from 'next/router'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'

import Nav from '../components/Nav'

export default function AddGame({ isAdmin }) {
  const [igdbToken, setIgdbToken] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [options, setOptions] = useState<GameOptions[]>([])

  const [notPollable, setNotPollable] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [finished, setFinished] = useState<string>('')
  const [rating, setRating] = useState<number>()
  const [stealth, setStealth] = useState<boolean>(false)
  const [tss, setTss] = useState<boolean>(false)
  const [streamed, setStreamed] = useState<boolean>(false)
  const [platform, setPlatform] = useState<string>('')
  const [timeSpent, setTimeSpent] = useState<number>()
  const [finishedDate, setFinishedDate] = useState<Date | null>(null)

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
    axios
      .post(`api/games`, {
        token: igdbToken,
        notPollable,
        comment,
        finished,
        rating,
        stealth,
        tss,
        streamed,
        platform,
        timeSpent,
        finishedDate,
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
      <Nav isAdmin={isAdmin} />
      <div className='App' style={{ display: 'flex', flexDirection: 'row' }}>
        <div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <div>
              <label>Ban from polls</label>
              <input value={notPollable} onChange={(e) => setNotPollable(e.target.value)} />
            </div>
          </div>

          <div>
            <label>Comment</label>
            <textarea value={comment || ''} onChange={(e) => setComment(e.target.value)}></textarea>
          </div>

          <div>
            <label>Finished</label>
            <input value={finished || ''} onChange={(e) => setFinished(e.target.value)}></input>
          </div>

          <div>
            <label>Finished date</label>
            <DatePicker selected={finishedDate} onChange={(date: Date) => setFinishedDate(date)} />
          </div>

          <div>
            <label>Platform</label>
            <input value={platform || ''} onChange={(e) => setPlatform(e.target.value)}></input>
          </div>

          <div>
            <label>Rating</label>
            <input
              type='number'
              min={1}
              max={10}
              value={rating || ''}
              onChange={(e) => setRating(parseInt(e.target.value))}
            ></input>
          </div>

          <div>
            <label>Stealth?</label>
            <input type='checkbox' checked={!!stealth} onChange={(e) => setStealth(e.target.checked)}></input>
          </div>

          <div>
            <label>TSS?</label>
            <input type='checkbox' checked={!!tss} onChange={(e) => setTss(e.target.checked)}></input>
          </div>

          <div>
            <label>Streamed?</label>
            <input type='checkbox' checked={!!streamed} onChange={(e) => setStreamed(e.target.checked)}></input>
          </div>

          <div>
            <label>Time spent</label>
            <input
              type='number'
              step={0.5}
              value={timeSpent || ''}
              onChange={(e) => setTimeSpent(parseFloat(e.target.value))}
            ></input>
          </div>
        </div>

        <div>
          <div>
            <div>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button onClick={() => getGamesByTitle(searchTerm)}>get gaem</button>
            </div>

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
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const session: ExtendedSession = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId

  return {
    props: {
      isAdmin,
    },
  }
}
