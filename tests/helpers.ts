import { Page } from "@playwright/test"

export const login = async (page: Page, redirectUrl: 'admin' | 'playedGame' | 'backlogGame' = 'admin') => {
    await page.goto('/api/auth/signin')
    await page.click('text=Sign in with Credentials')

    if (redirectUrl == 'playedGame') {
        await page.goto('/recap?id=68d2d38d01d68f79f3a5ec0e') // Silent Hill f
    } else if (redirectUrl == 'backlogGame') {
        await page.goto('/recap?id=626802c49b0c3c337466cd8e') // Yakuza 0
    } else {
        await page.goto('/admin')
    }
}