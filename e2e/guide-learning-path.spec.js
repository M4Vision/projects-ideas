import { test, expect } from '@playwright/test';
import fs from 'fs';

function stubTesterModule(withSpy) {
  const spySetup = withSpy ? 'window.__testerCalls = window.__testerCalls || [];\n' : ''
  const spyBody = withSpy
    ? 'window.__testerCalls.push({ baseUrl, allowedCategories });\n  '
    : ''
  return `${spySetup}export async function runTests(baseUrl, allowedCategories) {
  ${spyBody}return { summary: { total: 1, passed: 1, failed: 0, errors: 0 }, categories: [] };
}
export function abortTests() {}`}

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

test.describe('Guide learning path — step verification', () => {

  test('lesson 03 verification passes Authentification category to runTests', async ({ page }) => {
    const body = stubTesterModule(true)
    await page.route(/\/protask\/api\/tester\.js(\?.*)?$/, (route) => route.fulfill({ body, contentType: 'application/javascript' }))

    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    await page.locator('.lp-nav-btn').nth(2).click()
    await page.fill('#lpApiUrl', 'http://localhost:3333/api')
    await page.click('.lp-check-btn')
    await page.waitForFunction(() => window.__testerCalls?.length > 0, { timeout: 5000 })
    const calls = await page.evaluate(() => window.__testerCalls)
    expect(calls.length).toBe(1)
    expect(calls[0].allowedCategories).toEqual(['Authentification'])
  })

  test('lesson 06 verification passes Authentification and Boards categories', async ({ page }) => {
    const body = stubTesterModule(true)
    await page.route(/\/protask\/api\/tester\.js(\?.*)?$/, (route) => route.fulfill({ body, contentType: 'application/javascript' }))

    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    await page.locator('.lp-nav-btn').nth(5).click()
    await page.fill('#lpApiUrl', 'http://localhost:3333/api')
    await page.click('.lp-check-btn')
    await page.waitForFunction(() => window.__testerCalls?.length > 0, { timeout: 5000 })
    const calls = await page.evaluate(() => window.__testerCalls)
    expect(calls.length).toBe(1)
    expect(calls[0].allowedCategories).toEqual(['Authentification', 'Boards'])
  })

  test('verification result displays categories covered in the DOM', async ({ page }) => {
    const body = stubTesterModule(false)
    await page.route(/\/protask\/api\/tester\.js(\?.*)?$/, (route) => route.fulfill({ body, contentType: 'application/javascript' }))

    await page.goto('/')
    await page.waitForFunction(() => !!window.switchView)
    await page.evaluate(() => { window.switchView('guide'); window.switchGuideTo(3) })
    await page.locator('.lp-nav-btn').nth(5).click()
    await page.fill('#lpApiUrl', 'http://localhost:3333/api')
    await page.click('.lp-check-btn')
    await expect(page.locator('.lp-check-result')).toBeVisible()
    await expect(page.locator('.lp-check-result')).toContainText('Authentification')
    await expect(page.locator('.lp-check-result')).toContainText('Boards')
  })
})
