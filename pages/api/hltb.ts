import { Session, getServerSession } from 'next-auth'
import puppeteer from 'puppeteer'
import authOptions from './auth/[...nextauth]'

export default async function handler(req, res) {
  const session: Session | null = await getServerSession(req, res, authOptions)

  if (session?.user?.name !== process.env.ADMIN_USER_NAME) {
    res.status(401).json({ error: 'Unauthorized' })
  }

  const searchTerm: string = req.body.searchTerm

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(`https://howlongtobeat.com/?q=${encodeURIComponent(searchTerm)}`)
  const loadingSelector = '#search-results-header .loading_bar'
  await page.waitForSelector(loadingSelector, { hidden: true })
  const resultList = await page.waitForSelector(`#search-results-header ul`)
  const titlesAndTimes = await resultList?.evaluate((listEl) => {
    return Array.from(listEl.querySelectorAll('li'), (cardEl, index) => {
      const title = cardEl.querySelector('div:nth-child(2) > h3 > a')?.textContent || ''
      const time = cardEl.querySelector('div:nth-child(2) > div > div > div:nth-child(2)')?.textContent || ''
      const timeCategory = cardEl.querySelector('div:nth-child(2) > div > div > div:nth-child(1)')?.textContent || ''
      return { title, time, timeCategory }
    })
  })

  const selectedGame = titlesAndTimes?.filter((x) => x.title?.toLowerCase() === searchTerm.toLowerCase())?.[0] || null

  res.send(selectedGame)
}
