import { test, expect } from '@playwright/test'

test('should navigate to the backlog', async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto('/')
  // Find an element with the text 'Show backlog' and click on it
  await page.click('text=Show backlog')
  // The new URL should be "/?showBacklog=true" (baseURL is used there)
  await expect(page).toHaveURL('/?showBacklog=true')
  // The new page should contain an h2 with "Backlog"
  await expect(page.locator('h2')).toContainText('Backlog')
})

test('should show played games list', async ({ page }) => {
  await page.goto('/')
  const tbody = await page.locator('css=tbody')
  const rows = await tbody.getByRole("row")
  await expect(rows).toHaveCount(10)

  const expected = ["date", "game", "rating", "comments", "finished", "vods"]
  const headers = await page.locator("css=th").all()

  for (let index = 0; index < headers.length; index++) {
    await expect(headers[index]).toContainText(expected[index], { ignoreCase: true })
  }
})

test('should change table pagination', async ({ page }) => {
  await page.goto('/')
  await page.locator('text=Show 30').click()
  const tbody = await page.locator('css=tbody')
  const rows = await tbody.getByRole("row")

  await expect(rows).toHaveCount(30)
})

test('should filter by title', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('Search').fill("asghan")
  const tbody = await page.locator('css=tbody')
  const rows = await tbody.getByRole("row")

  await expect(rows).toHaveCount(1)
  await expect(tbody).toContainText("Asghan")
  await expect(page).toHaveURL('/?title=asghan')

  await page.getByPlaceholder('Search').clear()

  await expect(rows).toHaveCount(10)
  await expect(tbody).toContainText("Silent Hill f")
  await expect(page).toHaveURL('/')
})

test('should filter by tag', async ({ page }) => {
  await page.goto('/')
  await page.locator("css=#tag-select").click()
  await page.click('text=action')
  const tbody = await page.locator('css=tbody')
  const rows = await tbody.getByRole("row")
  const rowCount = await rows.count()

  for (let index = 0; index < rowCount; index++) {
    const row = rows.nth(index)
    await expect(row).toContainText('action')
  }
  await expect(page).toHaveURL('/?tag=action')
})

test('should sort by date', async ({ page }) => {
  await page.goto('/')
  const tbody = await page.locator('css=tbody')
  const thead = await page.locator('css=thead')

  await thead.locator('text=Date').click()
  await expect(tbody).toContainText("FTL: Faster Than Light")
  await expect(page).toHaveURL('/?sortDesc=false')

  await thead.locator('text=Date').click()
  await expect(tbody).toContainText("Silent Hill f")
  await expect(page).toHaveURL('/')

  await thead.locator('text=Date').click()
  await expect(tbody).toContainText("FTL: Faster Than Light")
  await expect(page).toHaveURL('/?sortDesc=false')
})

test('should sort by title', async ({ page }) => {
  await page.goto('/')
  const tbody = await page.locator('css=tbody')
  const thead = await page.locator('css=thead')

  await thead.locator('text=Game').click()
  await expect(tbody).toContainText("20 Minutes Till Dawn")
  await expect(page).toHaveURL('/?sortBy=title')

  await thead.locator('text=Game').click()
  await expect(tbody).toContainText("Yono")
  await expect(page).toHaveURL('/?sortBy=title&sortDesc=false')

  await thead.locator('text=Game').click()
  await expect(tbody).toContainText("20 Minutes Till Dawn")
  await expect(page).toHaveURL('/?sortBy=title')
})

test('should sort by rating', async ({ page }) => {
  await page.goto('/')
  const tbody = await page.locator('css=tbody')
  const thead = await page.locator('css=thead')

  await thead.locator('text=Rating').click()
  await expect(tbody).toContainText("Amnesia")
  await expect(page).toHaveURL('/?sortBy=rating')

  await thead.locator('text=Rating').click()
  await expect(tbody).toContainText("Worshippers")
  await expect(page).toHaveURL('/?sortBy=rating&sortDesc=false')

  await thead.locator('text=Rating').click()
  await expect(tbody).toContainText("Amnesia")
  await expect(page).toHaveURL('/?sortBy=rating')
})

test('should sort by time spent', async ({ page }) => {
  await page.goto('/')
  const tbody = await page.locator('css=tbody')
  const thead = await page.locator('css=thead')

  await thead.locator('text=Finished').click()
  await expect(tbody).toContainText("Hexcells")
  await expect(page).toHaveURL('/?sortBy=timeSpent')

  await thead.locator('text=Finished').click()
  await expect(tbody).toContainText("Chornobyl")
  await expect(page).toHaveURL('/?sortBy=timeSpent&sortDesc=false')

  await thead.locator('text=Finished').click()
  await expect(tbody).toContainText("Hexcells")
  await expect(page).toHaveURL('/?sortBy=timeSpent')
})