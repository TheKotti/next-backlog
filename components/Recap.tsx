/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import styles from '../styles/Recap.module.css'
import { Rating } from './Rating'
import { DetailsDialog } from './DetailsDialog'
import { useTextareaScaling } from 'hooks/useTextareaScaling'
import { updateGameAction } from 'app/actions'
import { toast } from 'react-toastify'

type Props = {
  fetchedGame: Game
}

const formatTimeToBeat = (time?: number | null, additionalTime?: number | null) => {
  if (additionalTime) {
    return `${time}+${additionalTime}`
  }
  return time?.toString() || ''
}

export const Recap = ({ fetchedGame }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const finishedRef = useRef<HTMLTextAreaElement>(null)
  const tagsRef = useRef<HTMLTextAreaElement>(null)
  const [game, setGame] = useState<Game>(fetchedGame)
  const [timeToBeat, setTimeToBeat] = useState(formatTimeToBeat(fetchedGame.timeSpent, fetchedGame.additionalTimeSpent))

  useTextareaScaling(textareaRef, game?.comment || '')
  useTextareaScaling(finishedRef, game?.finished || '')
  useTextareaScaling(tagsRef, game?.tags?.join(', ') || '')

  const updateGame = async () => {
    const formData = new FormData()
    formData.append('id', game._id!)
    formData.append('game', JSON.stringify(game))
    var res = await updateGameAction(formData)
    if (res) {
      toast.success('Game updated')
    } else {
      toast.error('Failed to update game')
    }
  }

  const handleTagChange = (value: string) => {
    const tags = value.split(',')
    setGame({ ...game, tags })
  }

  const handleTimeChange = (value: string) => {
    const [timeString, additionalTimeString] = value.split('+')
    const time = timeString ? parseInt(timeString) : null
    const additionalTime = additionalTimeString ? parseInt(additionalTimeString) : null

    setGame({
      ...game,
      timeSpent: time,
      additionalTimeSpent: additionalTime,
    })
    setTimeToBeat(value)
  }

  return (
    <div className={styles.root}>
      <div className={styles.gameMeta}>
        <img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.png`} alt='cover' />
        <h1>{game.title}</h1>
        <div className={styles.webcam}></div>
      </div>

      <div className={styles.gameForm}>
        <div className={`${styles.topRow}`}>
          <div className={styles.formFinished}>
            <label>Finished</label>
            <textarea
              ref={finishedRef}
              value={game?.finished || ''}
              onChange={(e) => setGame({ ...game, finished: e.target.value })}
              className='p-2'
            ></textarea>
          </div>

          <div className={styles.formTags}>
            <label>Tags</label>
            <textarea
              ref={tagsRef}
              value={game?.tags || ''}
              onChange={(e) => handleTagChange(e.target.value)}
              className='p-2'
            ></textarea>
          </div>

          <div className={styles.formTimeSpent}>
            <label>Time spent</label>
            <textarea
              value={timeToBeat || ''}
              onChange={(e) => handleTimeChange(e.target.value)}
              className='p-2'
            ></textarea>
          </div>
        </div>

        <div className={styles.comment}>
          <label>Comments</label>
          <textarea
            ref={textareaRef}
            value={game?.comment || ''}
            onChange={(e) => setGame({ ...game, comment: e.target.value })}
            className='p-2'
          ></textarea>
        </div>

        <Rating rating={game.rating} setRating={(r) => setGame({ ...game, rating: r })} />
      </div>

      <div className={styles.saveControls}>
        <button>
          <Link href='/admin'>Back</Link>
        </button>

        <DetailsDialog game={game} setGame={setGame} />

        <button onClick={() => updateGame()}>Save</button>
      </div>
    </div>
  )
}
