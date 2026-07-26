import { test, expect } from '@playwright/test'

test.describe('OpenAPI Tester — Ticket #1', () => {

  test('la toolbar affiche les inputs API URL et Token en vue OpenAPI', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    await expect(page.locator('#apiUrlInput')).toBeVisible()
    await expect(page.locator('#apiTokenInput')).toBeVisible()
    await expect(page.locator('#apiResetData')).toBeVisible()
    expect(await page.inputValue('#apiTokenInput')).toBe('token-1')
    expect(await page.inputValue('#apiUrlInput')).toBe('/api')
  })

  test('les boutons Try it sont visibles sur les endpoints', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const buttons = page.locator('.try-btn')
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(19)
    await expect(buttons.first()).toBeVisible()
  })

  test('POST /auth/login — se connecter et voir la réponse', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-auth-login"]')
    await expect(card).toBeVisible()
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ email: 'alex@protask.dev', password: 'pass123' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('token-')
    expect(text).toContain('Alexandre')
  })

  test('GET /boards — liste les boards avec le token par défaut', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-boards"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })
    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('Design System')
  })

  test('POST /auth/register — créer un utilisateur', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-auth-register"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const bodyInput = panel.locator('.try-body-input')
    const email = 'test-e2e-' + Date.now() + '@test.com'
    await bodyInput.fill(JSON.stringify({ name: 'Test E2E', email, password: 'pass1234' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('token-')
    expect(text).toContain('Test E2E')
  })

  test('GET /users/me — récupère le profil avec le token par défaut', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-users-me"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })
    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('Alexandre')
  })

  test('le bouton Reset est cliquable', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const resetBtn = page.locator('#apiResetData')
    await expect(resetBtn).toBeVisible()
    await expect(resetBtn).toBeEnabled()
  })

})
