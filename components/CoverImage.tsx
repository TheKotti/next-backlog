import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { Cloudinary } from '@cloudinary/url-gen'

import styles from '../styles/CoverImage.module.css'

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_IMG_CLOUD_NAME,
  },
})

type Props = {
  originalRow: any
}

const CoverImage = ({ originalRow }: Props) => {
  const myImage = cld.image(`covers/${originalRow.coverImageId}`).resize(fill().width(150))

  const title = `${originalRow.title}${originalRow.releaseYear ? ' (' + originalRow.releaseYear + ')' : ''}`

  return (
    <div className={styles.imageContainer}>
      <AdvancedImage cldImg={myImage} />

      <div className={styles.overlay}>
        <a href={originalRow.igdbUrl} target='_blank' rel='noreferrer'>
          <div className={styles.titleText}>{title}</div>
        </a>
      </div>
    </div>
  )
}

export default CoverImage
