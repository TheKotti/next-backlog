import { test, expect } from '@playwright/test'
import { getYears, getStats, getDevelopers, getTags } from '../utils/stats'

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
    const rows = await tbody.getByRole('row')
    await expect(rows).toHaveCount(10)

    const expected = ['date', 'game', 'rating', 'comments', 'finished', 'vods']
    const headers = await page.locator('css=th').all()

    for (let index = 0; index < headers.length; index++) {
        await expect(headers[index]).toContainText(expected[index], {
            ignoreCase: true,
        })
    }
})

test('should change table pagination', async ({ page }) => {
    await page.goto('/')
    await page.locator('text=Show 30').click()
    const tbody = await page.locator('css=tbody')
    const rows = await tbody.getByRole('row')

    await expect(rows).toHaveCount(30)
})

test('should filter by title', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Search').fill('asghan')
    const tbody = await page.locator('css=tbody')
    const rows = await tbody.getByRole('row')

    await expect(rows).toHaveCount(1)
    await expect(tbody).toContainText('Asghan')
    await expect(page).toHaveURL('/?title=asghan')

    await page.getByPlaceholder('Search').clear()

    await expect(rows).toHaveCount(10)
    await expect(tbody).toContainText('Silent Hill f')
    await expect(page).toHaveURL('/')
})

test('should filter by tag', async ({ page }) => {
    await page.goto('/')
    await page.locator('css=#tag-select').click()
    await page.click('text=action')
    const tbody = await page.locator('css=tbody')
    const rows = await tbody.getByRole('row')
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
    await expect(tbody).toContainText('FTL: Faster Than Light')
    await expect(page).toHaveURL('/?sortDesc=false')

    await thead.locator('text=Date').click()
    await expect(tbody).toContainText('Silent Hill f')
    await expect(page).toHaveURL('/')

    await thead.locator('text=Date').click()
    await expect(tbody).toContainText('FTL: Faster Than Light')
    await expect(page).toHaveURL('/?sortDesc=false')
})

test('should sort by title', async ({ page }) => {
    await page.goto('/')
    const tbody = await page.locator('css=tbody')
    const thead = await page.locator('css=thead')

    await thead.locator('text=Game').click()
    await expect(tbody).toContainText('20 Minutes Till Dawn')
    await expect(page).toHaveURL('/?sortBy=title')

    await thead.locator('text=Game').click()
    await expect(tbody).toContainText('Yono')
    await expect(page).toHaveURL('/?sortBy=title&sortDesc=false')

    await thead.locator('text=Game').click()
    await expect(tbody).toContainText('20 Minutes Till Dawn')
    await expect(page).toHaveURL('/?sortBy=title')
})

test('should sort by rating', async ({ page }) => {
    await page.goto('/')
    const tbody = await page.locator('css=tbody')
    const thead = await page.locator('css=thead')

    await thead.locator('text=Rating').click()
    await expect(tbody).toContainText('Amnesia')
    await expect(page).toHaveURL('/?sortBy=rating')

    await thead.locator('text=Rating').click()
    await expect(tbody).toContainText('Worshippers')
    await expect(page).toHaveURL('/?sortBy=rating&sortDesc=false')

    await thead.locator('text=Rating').click()
    await expect(tbody).toContainText('Amnesia')
    await expect(page).toHaveURL('/?sortBy=rating')
})

test('should sort by time spent', async ({ page }) => {
    await page.goto('/')
    const tbody = await page.locator('css=tbody')
    const thead = await page.locator('css=thead')

    await thead.locator('text=Finished').click()
    await expect(tbody).toContainText('Hexcells')
    await expect(page).toHaveURL('/?sortBy=timeSpent')

    await thead.locator('text=Finished').click()
    await expect(tbody).toContainText('Chornobyl')
    await expect(page).toHaveURL('/?sortBy=timeSpent&sortDesc=false')

    await thead.locator('text=Finished').click()
    await expect(tbody).toContainText('Hexcells')
    await expect(page).toHaveURL('/?sortBy=timeSpent')
})

const dupGames = [
    {
        title: 'Duplicate Example',
        releaseYear: 2020,
        finishedDate: '2020-01-01T00:00:00.000Z',
        rating: 5,
    },
    {
        title: 'Duplicate Example',
        releaseYear: 2020,
        finishedDate: '2021-01-01T00:00:00.000Z',
        rating: 6,
    },
]

test('getYears dedupes games correctly', () => {
    const years = getYears(dupGames as Game[])
    const year2020 = years.find((y) => y.year === 2020)
    expect(year2020).toBeDefined()
    expect(year2020!.games.length).toBe(1)
    expect(year2020!.games[0].rating).toBe(6)
})

const statsGames = [
    {
        title: 'Game 1',
        rating: 8,
        timeSpent: 10,
        additionalTimeSpent: 5,
        streamed: true,
        finished: 'Yes',
        finishedDate: '2023-01-01T00:00:00.000Z',
    },
    {
        title: 'Game 2',
        rating: 7,
        timeSpent: 15,
        additionalTimeSpent: 0,
        streamed: false,
        finished: 'Yes',
        finishedDate: '2023-02-01T00:00:00.000Z',
    },
    {
        title: 'Game 3',
        rating: 9,
        timeSpent: 20,
        additionalTimeSpent: 10,
        streamed: true,
        finished: 'Nope',
        finishedDate: null,
    },
] as Game[]

test('getStats calculates correct statistics', () => {
    const stats = getStats(statsGames)
    expect(stats).toHaveLength(8)
    expect(stats.find((s) => s.key === 'Average rating')?.value).toBe('8.00')
    expect(stats.find((s) => s.key === 'Average game length')?.value).toBe(
        '12.00 hours'
    )
    expect(stats.find((s) => s.key === 'Total time spent')?.value).toBe(
        '60 hours'
    )
    expect(stats.find((s) => s.key === 'Streamed games')?.value).toBe('2')
    expect(stats.find((s) => s.key === 'Finishing rate')?.value).toBe('100%')
    expect(stats.find((s) => s.key === 'Played games')?.value).toBe('2')
    expect(stats.find((s) => s.key === 'Games in backlog')?.value).toBe('1')
    expect(stats.find((s) => s.key === 'Backlog time estimate')?.value).toBe(
        '0 hours'
    )
})

const devGames = [
    {
        title: 'Game A',
        developers: ['Dev1'],
        rating: 9,
        finishedDate: '2023-01-01T00:00:00.000Z',
        tags: ['action'],
    },
    {
        title: 'Game B',
        developers: ['Dev1'],
        rating: 8,
        finishedDate: '2023-02-01T00:00:00.000Z',
        tags: ['action'],
    },
    {
        title: 'Game C',
        developers: ['Dev1'],
        rating: 7,
        finishedDate: '2023-03-01T00:00:00.000Z',
        tags: ['action'],
    },
    {
        title: 'Game D',
        developers: ['Dev1'],
        rating: 6,
        finishedDate: '2023-04-01T00:00:00.000Z',
        tags: ['action'],
    },
    {
        title: 'Game E',
        developers: ['Dev2'],
        rating: 10,
        finishedDate: '2023-05-01T00:00:00.000Z',
        tags: ['puzzle'],
    },
] as Game[]

test('getDevelopers groups and sorts correctly', () => {
    const developers = getDevelopers(devGames)
    expect(developers).toHaveLength(1) // Only Dev1 has 4+ games
    expect(developers[0].name).toBe('Dev1')
    expect(developers[0].games).toHaveLength(4)
    expect(developers[0].games[0].rating).toBe(9) // Sorted by rating desc
})

const tagGames = [
    {
        title: 'Game A',
        tags: ['action'],
        rating: 9,
        finishedDate: '2023-01-01T00:00:00.000Z',
    },
    {
        title: 'Game B',
        tags: ['action'],
        rating: 8,
        finishedDate: '2023-02-01T00:00:00.000Z',
    },
    {
        title: 'Game C',
        tags: ['action'],
        rating: 7,
        finishedDate: '2023-03-01T00:00:00.000Z',
    },
    {
        title: 'Game D',
        tags: ['action'],
        rating: 6,
        finishedDate: '2023-04-01T00:00:00.000Z',
    },
    {
        title: 'Game E',
        tags: ['puzzle'],
        rating: 10,
        finishedDate: '2023-05-01T00:00:00.000Z',
    },
] as Game[]

test('getTags groups and sorts correctly', () => {
    const tags = getTags(tagGames)
    expect(tags).toHaveLength(1) // Only action has 4+ games
    expect(tags[0].name).toBe('action')
    expect(tags[0].games).toHaveLength(4)
    expect(tags[0].games[0].rating).toBe(9) // Sorted by rating desc
})
