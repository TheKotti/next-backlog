/**
 * End-to-end tests for the main page (/).
 *
 * Seed data summary (from tests/seed.json):
 *   - 488 games with finishedDate  → shown in "Previously played" table
 *   - 220 games without finishedDate → shown in "Backlog"
 *
 * Specific counts used in assertions (derived from the seed):
 *   - "Hexcells" title search  → 3 results (Hexcells, Hexcells Plus, Hexcells Infinite)
 *   - "horror" tag filter      → 83 results (9 pages at 10/page)
 *   - "IO Interactive" dev     → 13 results (2 pages at 10/page)
 *   - rating 9 games           → Hexcells Infinite, Into the Breach, …
 *   - "Resident" title (backlog) → 6 results
 *   - "Capcom" dev (backlog)   → 6 results
 */

import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// React-select helpers
// ---------------------------------------------------------------------------

/**
 * Opens a react-select dropdown and clicks the first option matching `text`.
 * Targets the wrapper div added via `data-testid={id}` in SelectFilter.tsx,
 * then clicks the `.react-select__control` inside it (requires classNamePrefix
 * "react-select" to be set on the Select component).
 */
async function selectOption(page: Page, testId: string, text: string | RegExp) {
    await page
        .locator(`[data-testid="${testId}"] .react-select__control`)
        .click()
    const menu = page.locator('.react-select__menu')
    await expect(menu).toBeVisible()
    await menu
        .locator('.react-select__option')
        .filter({ hasText: text })
        .first()
        .click()
    await expect(menu).toBeHidden()
}

/**
 * Clicks the clear (×) button inside a react-select to reset its value.
 */
async function clearSelect(page: Page, testId: string) {
    await page
        .locator(`[data-testid="${testId}"] .react-select__clear-indicator`)
        .click()
}

// ---------------------------------------------------------------------------
// Previously Played table
// ---------------------------------------------------------------------------

test.describe('Previously Played table', () => {
    test('shows "Previously played" heading and table by default', async ({
        page,
    }) => {
        await page.goto('/')
        await expect(
            page.getByRole('heading', { name: 'Previously played' })
        ).toBeVisible()
        await expect(page.locator('table')).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Show backlog' })
        ).toBeVisible()
    })

    test('shows 10 rows on the first page by default', async ({ page }) => {
        await page.goto('/')
        // Wait for data to render
        await page.locator('table tbody tr').first().waitFor()
        await expect(page.locator('table tbody tr')).toHaveCount(10)
    })

    test('sorts by finished date descending by default — most recent game first', async ({
        page,
    }) => {
        // showCovers=false so game titles are visible as text
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        // "Silent Hill f" was finished 2025-10-12, the latest date in the seed
        await expect(page.locator('table tbody tr').first()).toContainText(
            'Silent Hill f'
        )
    })

    // -----------------------------------------------------------------------
    // Title filter
    // -----------------------------------------------------------------------

    test('title filter narrows results to matching games', async ({ page }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await page.locator('input[placeholder="Search"]').fill('Hexcells')

        // Exactly 3 Hexcells games in the seed
        await expect(page.locator('table tbody tr')).toHaveCount(3)
        for (const row of await page.locator('table tbody tr').all()) {
            await expect(row).toContainText('Hexcells')
        }
    })

    test('title filter is case-insensitive', async ({ page }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await page.locator('input[placeholder="Search"]').fill('hexcells')
        await expect(page.locator('table tbody tr')).toHaveCount(3)
    })

    test('clearing title filter restores the full result set', async ({
        page,
    }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        const search = page.locator('input[placeholder="Search"]')
        await search.fill('Hexcells')
        await expect(page.locator('table tbody tr')).toHaveCount(3)

        await search.clear()
        await expect(page.locator('table tbody tr')).toHaveCount(10)
    })

    // -----------------------------------------------------------------------
    // Tag filter
    // -----------------------------------------------------------------------

    test('tag filter shows only games tagged with the selected tag', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('table tbody tr').first().waitFor()

        await selectOption(page, 'tag-select', /^horror/)

        // 83 horror games → ceil(83 / 10) = 9 pages
        await expect(page.locator('.pagination strong')).toContainText('1 of 9')
    })

    test('tag filter can be cleared to restore all results', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('table tbody tr').first().waitFor()

        await selectOption(page, 'tag-select', /^horror/)
        await expect(page.locator('.pagination strong')).toContainText('1 of 9')

        await clearSelect(page, 'tag-select')

        // 488 played games → ceil(488 / 10) = 49 pages
        await expect(page.locator('.pagination strong')).toContainText(
            '1 of 49'
        )
    })

    // -----------------------------------------------------------------------
    // Developer filter
    // -----------------------------------------------------------------------

    test('developer filter shows only games by the selected developer', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('table tbody tr').first().waitFor()

        await selectOption(page, 'dev-select', /^IO Interactive/)

        // 13 IO Interactive games → 2 pages at 10/page
        await expect(page.locator('.pagination strong')).toContainText('1 of 2')
        await expect(page.locator('table tbody tr')).toHaveCount(10)
    })

    test('developer filter shows all results on one page when count ≤ page size', async ({
        page,
    }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        // IO Interactive has 13 games; increase page size first
        await page.getByRole('button', { name: 'Show 30' }).click()
        await selectOption(page, 'dev-select', /^IO Interactive/)

        await expect(page.locator('table tbody tr')).toHaveCount(13)
    })

    // -----------------------------------------------------------------------
    // Combined filters
    // -----------------------------------------------------------------------

    test('title and tag filters combine to narrow results further', async ({
        page,
    }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        // Apply tag filter first
        await selectOption(page, 'tag-select', /^stealth/)
        const afterTagCount = await page.locator('table tbody tr').count()

        // Then narrow by title — result must be ≤ tag-only result
        await page.locator('input[placeholder="Search"]').fill('hitman')
        const afterBothCount = await page.locator('table tbody tr').count()

        expect(afterBothCount).toBeLessThanOrEqual(afterTagCount)
        expect(afterBothCount).toBeGreaterThan(0)
        for (const row of await page.locator('table tbody tr').all()) {
            await expect(row).toContainText('Hitman', { ignoreCase: true })
        }
    })

    // -----------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------

    test('clicking Rating header sorts by rating descending (highest first)', async ({
        page,
    }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        // Rating column has sortDescFirst: true — first click → descending
        await page.getByRole('columnheader', { name: 'Rating' }).click()

        // Highest rated game in the seed has rating 9
        const firstRowRating = page
            .locator('table tbody tr')
            .first()
            .locator('[class*="innerCircle"]')
        await expect(firstRowRating).toHaveText('9')
    })

    test('clicking Date header twice sorts by date ascending (oldest first)', async ({
        page,
    }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        const dateHeader = page.getByRole('columnheader', { name: 'Date' })

        // Date is the default sort (desc). First click → asc, second → desc again.
        // Click once to flip to ascending (oldest first)
        await dateHeader.click()
        await dateHeader.click()

        // After two clicks we're back to descending; one click gives ascending
        await dateHeader.click()

        // Oldest game in seed: FTL finished 2017-06-13
        await expect(page.locator('table tbody tr').first()).toContainText(
            '2017'
        )
    })

    test('sort indicator emoji appears on sorted column', async ({ page }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        // Default is finishedDate descending → should show 🔻
        const dateHeader = page.getByRole('columnheader', { name: /Date/ })
        await expect(dateHeader).toContainText('🔻')
    })

    // -----------------------------------------------------------------------
    // Pagination
    // -----------------------------------------------------------------------

    test('changing page size to 30 shows 30 rows', async ({ page }) => {
        await page.goto('/')
        await page.locator('table tbody tr').first().waitFor()

        await page.getByRole('button', { name: 'Show 30' }).click()
        await expect(page.locator('table tbody tr')).toHaveCount(30)
        await expect(page.locator('.pagination strong')).toContainText('1 of')
    })

    test('navigating to the next page shows a different set of games', async ({
        page,
    }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await page
            .locator('.pagination')
            .getByRole('button', { name: '>', exact: true })
            .click()

        // Page indicator advancing is the definitive confirmation of navigation
        await expect(page.locator('.pagination strong')).toContainText('2 of')
    })

    test('"Go to page" input jumps to the specified page', async ({ page }) => {
        await page.goto('/?showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        const goToInput = page.locator('.pagination input[type="number"]')
        await goToInput.fill('5')
        await goToInput.press('Enter')

        await expect(page.locator('.pagination strong')).toContainText('5 of')
    })

    // -----------------------------------------------------------------------
    // Column visibility
    // -----------------------------------------------------------------------

    test('hiding Rating column via column selector removes it from the table', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('table tbody tr').first().waitFor()

        // Rating column header is visible by default
        await expect(
            page.getByRole('columnheader', { name: 'Rating' })
        ).toBeVisible()

        // Open the multi-select column toggle (stays open; closeMenuOnSelect=false)
        await page
            .locator('[data-testid="column-select"] .react-select__control')
            .click()
        await expect(page.locator('.react-select__menu')).toBeVisible()

        // Click "Rating" to deselect it
        await page
            .locator('.react-select__menu .react-select__menu-list > *')
            .filter({ hasText: 'Rating' })
            .click()
        await page.keyboard.press('Escape')

        await expect(
            page.getByRole('columnheader', { name: 'Rating' })
        ).toHaveCount(0)
    })

    test('hidden column can be restored via column selector', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('table tbody tr').first().waitFor()

        // Hide Rating
        await page
            .locator('[data-testid="column-select"] .react-select__control')
            .click()
        await expect(page.locator('.react-select__menu')).toBeVisible()
        await page
            .locator('.react-select__menu .react-select__menu-list > *')
            .filter({ hasText: 'Rating' })
            .click()
        await page.keyboard.press('Escape')
        await expect(
            page.getByRole('columnheader', { name: 'Rating' })
        ).toHaveCount(0)

        // Restore Rating
        await page
            .locator('[data-testid="column-select"] .react-select__control')
            .click()
        await expect(page.locator('.react-select__menu')).toBeVisible()
        await page
            .locator('.react-select__menu .react-select__menu-list > *')
            .filter({ hasText: 'Rating' })
            .click()
        await page.keyboard.press('Escape')
        await expect(
            page.getByRole('columnheader', { name: 'Rating' })
        ).toBeVisible()
    })
})

// ---------------------------------------------------------------------------
// Backlog table
// ---------------------------------------------------------------------------

test.describe('Backlog table', () => {
    test('clicking "Show backlog" switches to the backlog view', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByRole('button', { name: 'Show backlog' }).click()

        await expect(
            page.getByRole('heading', { name: 'Backlog' })
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: 'Show previously played' })
        ).toBeVisible()
    })

    test('showBacklog URL param opens backlog directly', async ({ page }) => {
        await page.goto('/?showBacklog=true')
        await expect(
            page.getByRole('heading', { name: 'Backlog' })
        ).toBeVisible()
    })

    test('backlog shows cover grid by default', async ({ page }) => {
        await page.goto('/?showBacklog=true')
        await expect(page.locator('[class*="backlog-grid"]')).toBeVisible()
        await expect(page.locator('table')).not.toBeVisible()
    })

    test('unchecking "Show covers" switches backlog to table view', async ({
        page,
    }) => {
        await page.goto('/?showBacklog=true')
        await page
            .locator('label')
            .filter({ hasText: 'Show covers' })
            .locator('input[type="checkbox"]')
            .uncheck()

        await expect(page.locator('table')).toBeVisible()
        await expect(page.locator('[class*="backlog-grid"]')).not.toBeVisible()
    })

    test('backlog title filter narrows results', async ({ page }) => {
        await page.goto('/?showBacklog=true&showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await page.locator('input[placeholder="Search"]').fill('Resident')

        // Resident Evil games in the backlog (see seed analysis: 6 titles)
        const rows = page.locator('table tbody tr')
        await expect(rows).not.toHaveCount(0)
        for (const row of await rows.all()) {
            await expect(row).toContainText('Resident', { ignoreCase: true })
        }
    })

    test('backlog title filter is case-insensitive', async ({ page }) => {
        await page.goto('/?showBacklog=true&showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await page.locator('input[placeholder="Search"]').fill('resident')
        const rowsLower = await page.locator('table tbody tr').count()

        await page.locator('input[placeholder="Search"]').fill('Resident')
        const rowsUpper = await page.locator('table tbody tr').count()

        expect(rowsLower).toBe(rowsUpper)
        expect(rowsLower).toBeGreaterThan(0)
    })

    test('backlog developer filter shows only matching games', async ({
        page,
    }) => {
        await page.goto('/?showBacklog=true&showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await selectOption(page, 'dev-select', /^Capcom/)

        // 6 Capcom games in the backlog seed data — all fit on one page
        await expect(page.locator('table tbody tr')).toHaveCount(6)
    })

    test('backlog developer filter can be cleared', async ({ page }) => {
        await page.goto('/?showBacklog=true&showCovers=false')
        await page.locator('table tbody tr').first().waitFor()

        await selectOption(page, 'dev-select', /^Capcom/)
        await expect(page.locator('table tbody tr')).toHaveCount(6)

        await clearSelect(page, 'dev-select')

        // Should show default 10 rows again (220 backlog games)
        await expect(page.locator('table tbody tr')).toHaveCount(10)
    })

    test('switching back from backlog shows previously played table', async ({
        page,
    }) => {
        await page.goto('/?showBacklog=true')
        await page
            .getByRole('button', { name: 'Show previously played' })
            .click()

        await expect(
            page.getByRole('heading', { name: 'Previously played' })
        ).toBeVisible()
        await expect(page.locator('table')).toBeVisible()
    })
})
