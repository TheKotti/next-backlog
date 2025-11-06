import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('should log in to admin view', async ({ page }) => {
  await login(page)

  await page.isVisible('text=Sign Out (testuser)')
  await page.isVisible('text=Game list')
  await page.isVisible('text=Add game')
  await page.isVisible('text=Revalidate')
  await page.isVisible('text=Previously played')
})

test('should show admin played games list', async ({ page }) => {
  await login(page)

  const tbody = await page.locator('css=tbody')
  const rows = await tbody.getByRole("row")
  await expect(rows).toHaveCount(10)

  const expected = ["date", "game", "rating", "comments", "finished", "vods", "admin"]
  const headers = await page.locator("css=th").all()

  for (let index = 0; index < headers.length; index++) {
    await expect(headers[index]).toContainText(expected[index], { ignoreCase: true })
  }
})

test('should navigate to recap', async ({ page }) => {
  await login(page)

  await page.getByPlaceholder('Search').fill("asghan")
  const tbody = await page.locator('css=tbody')
  const rows = await tbody.getByRole("row")

  await expect(rows).toHaveCount(1)
  await expect(tbody).toContainText("Asghan")
  await page.click('text=Recap')
  await expect(page.locator('h1')).toContainText('Asghan: The Dragon Slayer')
})

test('should add vods', async ({ page }) => {

  const vodTextInput = `url1
url2;custom text`

  await login(page)

  const firstRow = await page.locator('css=tbody>tr').locator("nth=0")
  firstRow.locator("text=Add vods").click()

  await page.locator('css=#vodsArea').fill(vodTextInput)
  await page.locator('css=#vodDialog').locator('text=Save').click()
  await page.waitForLoadState('networkidle')
  await page.reload()

  await expect(firstRow.locator('td').locator("nth=-2")).toContainText('Part 1')
  await expect(firstRow.locator('td').locator("nth=-2")).toContainText('custom text')
})