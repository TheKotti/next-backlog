import axios from 'axios'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const token = await getToken({ req })

  if (!token) {
    res.send('poll update failed, no token')
    return
  }

  const choices = req.body.options.map((x: string) => {
    const title = x.length > 25 ? x.substring(0, 22) + '...' : x
    return { title }
  })

  axios
    .post(
      'https://api.twitch.tv/helix/polls',
      {
        broadcaster_id: token.sub,
        title: 'Next game?',
        choices: choices,
        duration: 300,
      },
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID!,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    )
    .then(() => {
      res.send('poll updated')
    })
    .catch((e) => {
      res.send('poll update failed, ', e)
    })
}
