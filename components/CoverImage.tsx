import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { Cloudinary } from '@cloudinary/url-gen'

import styles from '../styles/CoverImage.module.css'
import { ScoreIndicator } from './ScoreIndicator'
import { getHltbString } from 'utils/utils'

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_IMG_CLOUD_NAME,
  },
})

type Props = {
  game: Game
  showScore?: boolean
  showHltb?: boolean
}

const CoverImage = ({ game, showScore, showHltb }: Props) => {
  const myImage = cld.image(`covers/${game.coverImageId}`).resize(fill().width(150).height(200))

  const formattedTitle = game.title.startsWith("The ") ? game.title.substring(4) + ", The" : game.title

  const title = `${formattedTitle}${game.releaseYear ? ' (' + game.releaseYear + ')' : ''}`

  return (
    <div className={styles.imageContainer}>
      <AdvancedImage cldImg={myImage} />

      <div className={`d-flex flex-column justify-content-center align-items-center text-center gap-1 ${styles.overlay}`}>
        <a href={game.igdbUrl} target='_blank' rel='noreferrer' className={styles.titleText}>
          {title}
        </a>

        {showHltb && (
          <span>
            {getHltbString(game)}
          </span>
        )}

        {showScore && (
          <div className={styles.scoreIndicator}>
            <ScoreIndicator rating={game.rating} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CoverImage