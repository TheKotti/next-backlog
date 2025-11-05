import { test, expect, Page } from '@playwright/test'

const login = async (page: Page) => {
  await page.goto('/api/auth/signin')
  await page.click('text=Sign in with Credentials')
  await page.goto('/admin')
}

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