import axios from 'axios'
import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })
  const token = await getToken({ req })

  /* axios
    .post(
      'https://api.twitch.tv/helix/polls',
      {
        broadcaster_id: user.id,
        title: 'Next game?',
        choices: options,
        duration: 60,
      },
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req.session?.passport?.user?.accessToken}`,
        },
      }
    )
    .then(() => {
      res.send('poll updated')
    })
    .catch(() => {
      res.send('poll update failed')
    }) */
}
