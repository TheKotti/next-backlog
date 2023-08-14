import axios from 'axios'
import getServerSession, { Session } from 'next-auth'
import authOptions from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session: Session | null = await getServerSession(req, res, authOptions)

  if (session) {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`

    const response = await axios.post(url)
    if (response?.data?.access_token) {
      return res.status(200).json({ token: response.data.access_token })
    } else {
      res.status(500).json({ error: 'Something went wrong' })
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
