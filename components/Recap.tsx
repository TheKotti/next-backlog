import React, { useState } from 'react'
import Image from 'next/image'

import styles from '../styles/Recap.module.css'

type Props = {
  game: Game
  setGame: (game: Game) => void
}

export const Recap = (props: Props) => {
  const { game, setGame } = props

  const [rating, setRating] = useState<number | null>(null)
  const [lockedRating, setLockedRating] = useState<number>()

  return (
    <div className={styles.root}>
      <div className={styles.gameMeta}>
        <img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.png`} alt='cover' />
        <h1>{game.title}</h1>
      </div>

      <div className={styles.gameForm}>
        <div className={styles.formFinished}>
          <div>
            <label>Finished</label>
            <input
              value={game?.finished || ''}
              onChange={(e) => setGame({ ...game, finished: e.target.value })}
            ></input>
          </div>

          <div>
            <label>Time spent</label>
            <input
              value={game?.timeSpent || ''}
              onChange={(e) => setGame({ ...game, timeSpent: parseInt(e.target.value) })}
            ></input>
          </div>
        </div>

        <div>
          <input
            type='checkbox'
            checked={!!game?.stealth}
            onChange={(e) => setGame({ ...game, stealth: e.target.checked })}
          ></input>
          <label>Stealth?</label>
        </div>

        <div className={styles.comment}>
          <label>Comment</label>
          <textarea
            value={game?.comment || ''}
            onChange={(e) => setGame({ ...game, comment: e.target.value })}
          ></textarea>
        </div>

        <div className={styles.ratings}>
          <div
            className={styles.ratingBox}
            onClick={() => setLockedRating(1)}
            onMouseEnter={() => setRating(1)}
            onMouseLeave={() => setRating(null)}
          >
            1
          </div>
          <div
            className={styles.ratingBox}
            onClick={() => setLockedRating(2)}
            onMouseEnter={() => setRating(2)}
            onMouseLeave={() => setRating(null)}
          >
            2
          </div>
          <div
            className={styles.ratingBox}
            onClick={() => setLockedRating(3)}
            onMouseEnter={() => setRating(3)}
            onMouseLeave={() => setRating(null)}
          >
            3
          </div>
          <span>{lockedRating || rating}</span>
        </div>
      </div>
    </div>
  )
}
