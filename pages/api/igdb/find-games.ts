import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import authOptions from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session: Session | null = await getServerSession(req, res, authOptions)

  if (session?.user?.name !== process.env.ADMIN_USER_NAME) {
    return res.status(401).json({ errorType: 'findGamesSessionError', error: 'Unauthorized' })
  }

  const authToken = req.body.token
  const searchTerm = req.body.searchTerm

  axios({
    url: 'https://api.igdb.com/v4/games',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${authToken}`,
    },
    data: `
    search "${searchTerm}";
    fields name, id, release_dates.y, url;
    limit 20;`,
  })
    .then((response) => {
      console.log('find-games success')
      res.send(response.data)
    })
    .catch((error) => {
      return res.status(500).json({ errorType: 'findGamesError', error })
    })
}
