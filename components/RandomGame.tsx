import { useState } from 'react'

import styles from '../styles/RandomGame.module.css'

type Props = {
  game: Game
  vetoGame: (id: string) => void
}

export default function RandomGame(props: Props) {
  const { game, vetoGame } = props
  const [hidden, setHidden] = useState(false)

  return (
    <div className={styles.gameContainer}>
      <img
        src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.jpg`}
        alt={game.title}
        className={styles.gameCover}
      />
      <h1 className={styles.gameTitle} onClick={() => window.open(game.igdbUrl, '_blank')}>
        {game.title} ({game.releaseYear})
      </h1>
      <p className={styles.gameDeveloper}>{game.developers.join(', ')}</p>
      <p className={styles.gameGenres}>{game.keywords.join(', ')}</p>

      <button onClick={() => vetoGame(game._id!)} className={`btn btn-light ${styles.gameButton}`}>
        Veto
      </button>
    </div>
  )
}
