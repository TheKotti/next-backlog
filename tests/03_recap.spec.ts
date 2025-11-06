import { test, expect } from '@playwright/test'
import { login } from './helpers'

const longtext = `The story had a bit of a slow start in the first playthrough, but does get interesting around the halfway mark, is good overall
- The ending sets up NG+ in a really interesting way, but it's a trap that doesn't pay off. The gameplay isn't good enough to warrant going through a nearly identical playthrough of a fairly long and linear game. The story didn't go into a more interesting direction either.
- Especially in some of the town sections, the atmosphere was really nice. But it never reached the heights of the PS2 games as all the low resolution graininess was replaced by UE5 stuttering. Also sadly there were a quite a few jump scares that didn't feel very SH to me.
- It didn't feel like there was a proper vision behind the combat design. On one hand it wanted to be an action game with perfect dodges and counters and focus systems, but some of the mechanics were completely absent on Story difficulty, which clearly is the preferred setting. Feels like there should be some middle ground that makes use of all the mechanics but makes the enemies, especially the titty monsters, have less health.
- Could've used way less combat in general to give room for atmosphere building. The monsters stopped being threatening and the gameplay got dull, especially during NG+.
- Inventory management was an unnecessary system. Most of the items were only there to be used as offerings, which didn't feel that meaningful. Maybe it's more important on Hard combat difficulty, but why would anyone want to play that way?
- Some of the puzzle solutions made no sense, which appears to be a localization issue as at least one of them was easier on a higher difficulty. Bit of a mixed bag in terms of puzzles, some very good (hidden shrine) some very bad (scarecrow).
- The school was the highlight with appropriate mix of combat, puzzles, exploration, and backstory.  I especially liked how the main puzzle tied into the school setting.
`

test('should load existing data', async ({ page }) => {
    await login(page, 'playedGame')

    const commentArea = await page.locator('css=#commentArea')
    await expect(commentArea).toContainText('The story had a bit of a slow start');

    const finishedArea = await page.locator('css=#finishedArea')
    await expect(finishedArea).toContainText('NG and NG+');

    const tagsArea = await page.locator('css=#tagsArea')
    await expect(tagsArea).toContainText('horror');

    const timeArea = await page.locator('css=#timeArea')
    await expect(timeArea).toContainText('12+8');

    const selectedRating = await page.locator('css=.selectedRating')
    await expect(selectedRating).toContainText('6');
})

test('should change comment area font size', async ({ page }) => {
    await login(page, 'playedGame')

    const commentArea = await page.locator('css=#commentArea')
    await expect(commentArea).toHaveCSS('font-size', '16px');
    await commentArea.fill('short text')
    await expect(commentArea).toHaveCSS('font-size', '32px');
    await commentArea.fill(longtext)
    await expect(commentArea).toHaveCSS('font-size', '16px');
})

test('should save changes to played game', async ({ page }) => {
    await login(page, 'playedGame')

    const testComment = "test comment"
    const testFinished = "test finished"
    const testTags = "testTag1,testTag2"
    const testTime = "1.5+8"
    const testScore = "2"

    await page.locator('css=#commentArea').fill(testComment)
    await page.locator('css=#finishedArea').fill(testFinished)
    await page.locator('css=#tagsArea').fill(testTags)
    await page.locator('css=#timeArea').fill(testTime)
    await page.locator(`css=.ratingBox:has-text('${testScore}')`).click()

    await page.locator(`css=button:has-text('Save')`).click()
    await page.waitForLoadState('networkidle')
    await page.reload();

    const commentArea = await page.locator('css=#commentArea')
    const finishedArea = await page.locator('css=#finishedArea')
    const tagsArea = await page.locator('css=#tagsArea')
    const timeArea = await page.locator('css=#timeArea')
    const selectedRating = await page.locator('css=.selectedRating')

    await expect(commentArea).toContainText(testComment);
    await expect(finishedArea).toContainText(testFinished);
    await expect(tagsArea).toContainText(testTags.toLowerCase());
    await expect(timeArea).toContainText(testTime);
    await expect(selectedRating).toContainText(testScore);
})

test('should set game as ongoing', async ({ page }) => {
    await login(page, 'backlogGame')

    await page.locator('css=#finishedArea').fill('Happening')
    await page.locator(`css=button:has-text('Details')`).click()
    const dialog = await page.locator('css=#detailsDialog')
    await dialog.getByRole('checkbox').check();
    await dialog.locator(`css=button:has-text('Close')`).click()

    await page.locator(`css=button:has-text('Save')`).click()
    await page.waitForLoadState('networkidle')
    await page.goto('/admin')

    const firstRow = await page.locator('css=tbody>tr').locator("nth=0")
    await expect(firstRow).toContainText("Ongoing or soon™");
    await expect(firstRow).toContainText("Yakuza 0");
    await expect(firstRow).toContainText("No vods available");
})