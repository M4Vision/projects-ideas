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
