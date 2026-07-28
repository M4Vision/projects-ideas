import { test, expect } from '@playwright/test';

test.describe('Guide learning path — test runner categories', () => {

  test('runTests without filter returns all categories', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const { runTests } = await import('/protask/api/tester.js')
      const r = await runTests('http://localhost:3001/api')
      return { count: r.categories.length, names: r.categories.map(c => c.name) }
    })
    expect(result.count).toBeGreaterThan(1)
  })

  test('runTests with allowedCategories returns only matching category', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const { runTests } = await import('/protask/api/tester.js')
      const r = await runTests('http://localhost:3001/api', ['Authentification'])
      return { count: r.categories.length, names: r.categories.map(c => c.name) }
    })
    expect(result.count).toBe(1)
    expect(result.names).toEqual(['Authentification'])
  })
})

test.describe('Guide learning path — viewer', () => {

  test('markdown guide renders normally for non-learning-path guides', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => window.switchView('guide'))
    await page.waitForSelector('#codeContent .lp-nav', { state: 'detached', timeout: 5000 }).catch(() => {})
    const hasLearningPath = await page.evaluate(() => !!document.querySelector('.lp-nav'))
    expect(hasLearningPath).toBe(false)
    const hasContent = await page.evaluate(() => document.getElementById('codeContent')?.textContent?.trim()?.length > 0)
    expect(hasContent).toBe(true)
  })

  test('learning path renders lesson navigation and first lesson', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    const navBtns = page.locator('.lp-nav-btn')
    await expect(navBtns).toHaveCount(9)
    await expect(navBtns.first()).toContainText('1.')
    await expect(navBtns.nth(2)).toContainText('3.')
    await expect(navBtns.last()).toContainText('9.')
  })

  test('learning path shows lesson title and duration', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    await expect(page.locator('.lp-lesson-title')).not.toBeEmpty()
    await expect(page.locator('.lp-duration')).not.toBeEmpty()
  })

  test('learning path shows touched files in sidebar', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    await expect(page.locator('.lp-sidebar-title')).toContainText('Fichiers touchés')
    const fileItems = page.locator('.lp-file-item')
    await expect(fileItems.first()).not.toBeEmpty()
  })

  test('learning path has collapsed Code complet section', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    const details = page.locator('.lp-checkpoint-details')
    await expect(details).toBeVisible()
    const summary = details.locator('summary')
    await expect(summary).toContainText('solution')
  })

  test('learning path shows Vérifier mon étape button for lessons with tests', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    await page.locator('.lp-nav-btn').nth(2).click()
    await expect(page.locator('.lp-check-btn')).toContainText('Vérifier mon étape')
  })

  test('clicking lesson 3 changes title and nav active state', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    const titleBefore = await page.locator('.lp-lesson-title').textContent()
    await page.locator('.lp-nav-btn').nth(2).click()
    await page.waitForTimeout(100)
    const titleAfter = await page.locator('.lp-lesson-title').textContent()
    expect(titleAfter).not.toBe(titleBefore)
    const activeCount = await page.locator('.lp-nav-btn.active').count()
    expect(activeCount).toBe(1)
  })
})
