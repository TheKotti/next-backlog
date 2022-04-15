import axios from 'axios'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })

  if (session?.userId !== process.env.ADMIN_USER_ID) {
    res.status(401).json({ error: 'Unauthorized' })
  }

  const gameId = req.body.id
  const authToken = req.body.token
  const notPollable = !!req.body.notPollable

  axios({
    url: 'https://api.igdb.com/v4/games',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${authToken}`,
    },
    data: `
    where id = ${gameId};
    fields name, id, genres.name, themes.name, cover.image_id, release_dates.y, url, involved_companies.company.name, involved_companies.developer;`,
  })
    .then((getGameResponse) => {
      if (getGameResponse.data.length < 1) {
        res.status(404).json({ error: 'Not found' })
      }

      const g = getGameResponse.data[0]
      const keywords = [...g.genres.map((x) => x.name), ...g.themes.map((x) => x.name)]
      const developers = g.involved_companies.filter((x) => x.developer).map((x) => x.company.name)
      const releaseYear = g.release_dates ? Math.min(...g.release_dates.map((x) => x.y).filter((x) => x)) : null

      const game = {
        title: g.name,
        igdbId: g.id,
        coverImageId: g.cover.image_id,
        keywords,
        developers,
        releaseYear,
        igdbUrl: g.url,
        notPollable,
        finishedDate: null,
        comment: null,
        timeSpent: null,
        finished: null,
        stealth: null,
        tss: null,
        rating: null,
        platform: null,
      }

      axios.post(process.env.APP_URL + '/api/games', game).then((postGameResponse) => {
        res.status(200).send(postGameResponse.data)
      })
    })
    .catch((err) => {
      res.send(err)
    })
}
