import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { Cloudinary } from '@cloudinary/url-gen'

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_IMG_CLOUD_NAME,
  },
})

type Props = {
  id: string
}

const Img = ({ id }: Props) => {
  const myImage = cld.image(id).resize(fill().width(150))

  return <AdvancedImage cldImg={myImage} />
}

export default Img
