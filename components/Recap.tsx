import React, { useState } from 'react'

import styles from '../styles/Recap.module.css'
import { Rating } from './Rating'

type Props = {
  game: Game
  setGame: (game: Game) => void
  updateGame: (game: Game) => void
}

export const Recap = (props: Props) => {
  const { game, setGame, updateGame } = props

  return (
    <div className={styles.root}>
      <div className={styles.gameMeta}>
        <img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.png`} alt='cover' />
        <h1>{game.title}</h1>
        <div className={styles.webcam}></div>
      </div>

      <div className={styles.gameForm}>
        <div className={styles.formFinished}>
          <div className={styles.formInput}>
            <label>Finished</label>
            <input
              value={game?.finished || ''}
              onChange={(e) => setGame({ ...game, finished: e.target.value })}
            ></input>
          </div>

          <div className={styles.formInput}>
            <label>Time spent</label>
            <input
              value={game?.timeSpent || ''}
              onChange={(e) => setGame({ ...game, timeSpent: parseInt(e.target.value) })}
            ></input>
          </div>

          <div className={styles.formInput}>
            <label>Felt sneaky</label>
            <div className={styles.checkbox} onClick={() => setGame({ ...game, stealth: !game.stealth })}>
              {!!game?.stealth ? <div className={styles.checked} /> : <div className={styles.unchecked} />}
            </div>
          </div>
        </div>

        <div className={styles.comment}>
          <label>Comment</label>
          <textarea
            value={game?.comment || ''}
            onChange={(e) => setGame({ ...game, comment: e.target.value })}
          ></textarea>
        </div>

        <Rating rating={game.rating} setRating={(r) => setGame({ ...game, rating: r })} />
      </div>

      <button className={styles.saveButton} onClick={() => updateGame(game)}>
        Save
      </button>
    </div>
  )
}
