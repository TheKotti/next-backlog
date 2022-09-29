import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import styles from '../styles/Recap.module.css'
import { Rating } from './Rating'

type Props = {
  game: Game
  setGame: (game: Game) => void
  updateGame: (game: Game) => void
}

export const Recap = (props: Props) => {
  const { game, setGame, updateGame } = props

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textSize, setTextSize] = useState<'large' | 'x-large' | 'xx-large'>('xx-large')

  useEffect(() => {
    const clientHeight = textareaRef.current?.clientHeight || 0
    const scrollHeight = textareaRef.current?.scrollHeight || 0

    if (scrollHeight > clientHeight) {
      if (textSize === 'xx-large') setTextSize('x-large')
      if (textSize === 'x-large') setTextSize('large')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.comment])

  return (
    <div className={styles.root}>
      <div className={styles.gameMeta}>
        <img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.png`} alt='cover' />
        <h1>{game.title}</h1>
        <div className={styles.webcam}></div>
      </div>

      <div className={styles.gameForm}>
        <div className={`d-flex justify-content-between align-items-end ${styles.topRow}`}>
          <div className={styles.formFinished}>
            <label>Finished</label>
            <textarea
              rows={1}
              value={game?.finished || ''}
              onChange={(e) => setGame({ ...game, finished: e.target.value })}
              className='p-2'
            ></textarea>
          </div>

          <div className={styles.formTimeSpent}>
            <label>Time spent</label>
            <textarea
              rows={1}
              value={game?.timeSpent || ''}
              onChange={(e) => setGame({ ...game, timeSpent: parseFloat(e.target.value) })}
              className='p-2'
            ></textarea>
          </div>

          <div className={styles.feltSneaky}>
            <label>Felt sneaky</label>
            <div className={`${styles.checkbox}`} onClick={() => setGame({ ...game, stealth: !game.stealth })}>
              {!!game?.stealth ? (
                <div className={`d-flex align-items-center justify-content-center ${styles.checked}`} />
              ) : (
                <div className={styles.unchecked} />
              )}
            </div>
          </div>
        </div>

        <div className={styles.comment}>
          <label>Comment</label>
          <textarea
            ref={textareaRef}
            value={game?.comment || ''}
            onChange={(e) => setGame({ ...game, comment: e.target.value })}
            className='p-2'
            style={{ fontSize: textSize }}
          ></textarea>
        </div>

        <Rating rating={game.rating} setRating={(r) => setGame({ ...game, rating: r })} />
      </div>

      <div className={styles.saveControls}>
        <button>
          <Link href='/'>Back</Link>
        </button>

        <button onClick={() => updateGame(game)}>Save</button>
      </div>
    </div>
  )
}
