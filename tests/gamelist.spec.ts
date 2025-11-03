import { test, expect } from '@playwright/test';

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
  const table = await page.locator('xpath=/html/body/main/table/tbody');
  const rows = await table.getByRole("row")

  await expect(rows).toHaveCount(10)
})

test('should change table pagination', async ({ page }) => {
  await page.goto('/')
  await page.locator('text=Show 30').click();
  const table = await page.locator('xpath=/html/body/main/table/tbody');
  const rows = await table.getByRole("row")

  await expect(rows).toHaveCount(30)
})

test('should filter by title', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('Search').fill("asghan");
  const table = await page.locator('xpath=/html/body/main/table/tbody');
  const rows = await table.getByRole("row")

  await expect(rows).toHaveCount(1)
  await expect(table).toContainText("Asghan")
})

test('should filter by tag', async ({ page }) => {
  await page.goto('/')
  await page.locator("css=#tag-select").click()
  await page.click('text=action')
  const table = await page.locator('xpath=/html/body/main/table/tbody');
  const rows = await table.getByRole("row")
  const rowCount = await rows.count()

  for (let index = 0; index < rowCount; index++) {
    const row = rows.nth(index)
    await expect(row).toContainText('action')

  }
})