import { Session, getServerSession } from 'next-auth'
import authOptions from './auth/[...nextauth]'
import { HowLongToBeatService } from 'howlongtobeat'

let hltbService = new HowLongToBeatService()

export default async function handler(req, res) {
  const session: Session | null = await getServerSession(req, res, authOptions)

  if (session?.user?.name !== process.env.ADMIN_USER_NAME) {
    return res.status(401).json({ errorType: 'hltbAuthError', error: 'Unauthorized' })
  }

  const searchTerm = req.body.searchTerm

  return hltbService.search(searchTerm).then((result) => {
    if (result.length > 0) {
      const selectedRes = result.filter((x) => x.similarity === 1).sort((a, b) => Number(a.id) - Number(b.id))?.[0]
      if (selectedRes) {
        return res.send(selectedRes)
      }
    }

    return res.status(404)
  })
}
