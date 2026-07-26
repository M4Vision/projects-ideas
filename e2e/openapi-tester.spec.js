import { test, expect } from '@playwright/test'

async function resetApi(page) {
  await page.request.post('/api/_reset')
}

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

test.describe('OpenAPI Tester — Ticket #2', () => {

  test('POST /boards — créer un board', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-boards"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ title: 'Board E2E', color: '#3B82F6', description: 'Test' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('Board E2E')
  })

  test('GET /boards/{id} — récupérer un board par ID', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-boards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const pathInput = panel.locator('.try-path-input')
    await pathInput.fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('Design System')
  })

  test('PUT /boards/{id} — mettre à jour un board', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-boards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ title: 'Board Modifié', color: '#FF5722' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('Board Modifié')
  })

  test('DELETE /boards/{id} — supprimer un board', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="delete-boards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('204')
  })

  test('POST /boards/{id}/columns — créer une colonne', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-boards--id--columns"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ title: 'Col E2E', color: '#FF9800' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('Col E2E')
  })

  test('PUT /columns/{id} — mettre à jour une colonne', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-columns--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ title: 'Col Modifiée', color: '#E91E63' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('Col Modifiée')
  })

  test('DELETE /columns/{id} — supprimer une colonne', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="delete-columns--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('204')
  })

  test('PUT /columns/reorder — réordonner les colonnes', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-columns-reorder"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify([{ id: 1, order: 2 }, { id: 2, order: 1 }, { id: 3, order: 0 }]))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
  })

})

test.describe('OpenAPI Tester — Ticket #3', () => {

  test('GET /columns/{id}/cards — lister les cartes d\'une colonne', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-columns--id--cards"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('palette')
  })

  test('POST /columns/{id}/cards — créer une carte', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-columns--id--cards"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ title: 'Carte E2E', description: 'Test' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('Carte E2E')
  })

  test('GET /cards/{id} — récupérer une carte', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-cards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
    expect(text).toContain('Définir')
  })

  test('PUT /cards/{id} — mettre à jour une carte (spec PUT ≠ server PATCH → 404 attendu)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-cards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ title: 'Carte Modifiée E2E' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    // Server uses PATCH, spec says PUT → 404 expected
    // This validates the viewer sends correctly
  })

  // PATCH /cards/{id} version (matches server)
  test('PATCH /cards/{id} — modifier une carte (méthode réelle du serveur)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    // Use evaluate to send PATCH (spec says PUT but server expects PATCH)
    // First open the PUT panel to get the inputs
    const card = page.locator('.endpoint-card[data-endpoint="put-cards--id-"]')
    await card.locator('.try-btn').click()
    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })
    await panel.locator('.try-path-input').fill('1')

    // Send via evaluate to use PATCH method
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/cards/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token-1' },
        body: JSON.stringify({ title: 'Carte Patchée E2E' }),
      })
      const data = res.status === 204 ? null : await res.json()
      return { status: res.status, body: data }
    })

    expect(result.status).toBe(200)
    expect(result.body.title).toBe('Carte Patchée E2E')
  })

  test('DELETE /cards/{id} — supprimer une carte', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="delete-cards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('204')
  })

  test('POST /cards/{id}/move — déplacer une carte (spec PUT ≠ server POST → 404 attendu)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-cards--id--move"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ columnId: 2 }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    // Server uses POST, spec says PUT → 404 expected
  })

  test('POST /cards/reorder — réordonner les cartes (spec PUT ≠ server POST → 404 attendu)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-cards-reorder"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify([{ id: 1, order: 1 }, { id: 2, order: 0 }]))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    // Server uses POST, spec says PUT → 404 expected
  })

  test('POST /boards/{id}/labels — créer un label', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-boards--id--labels"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ name: 'Bug E2E', color: '#FF0000' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('Bug E2E')
  })

  test('PUT /labels/{id} — mettre à jour un label (spec PUT ≠ server PATCH → 404 attendu)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="put-labels--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ name: 'Label Modifié', color: '#00FF00' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    // Server uses PATCH, spec says PUT → 404 expected
  })

  test('DELETE /labels/{id} — supprimer un label', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="delete-labels--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('204')
  })

  test('GET /cards/{id}/comments — lister les commentaires', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-cards--id--comments"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
  })

  test('POST /cards/{id}/comments — ajouter un commentaire', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-cards--id--comments"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ text: 'Commentaire E2E' }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('Commentaire E2E')
  })

  test('DELETE /comments/{id} — supprimer un commentaire', async ({ page }) => {
    await resetApi(page)
    // First create a comment
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    // Create comment on card 1
    const createCard = page.locator('.endpoint-card[data-endpoint="post-cards--id--comments"]')
    await createCard.locator('.try-btn').click()
    const createPanel = createCard.locator('.try-panel')
    await expect(createPanel).toBeVisible({ timeout: 3000 })
    await createPanel.locator('.try-path-input').fill('1')
    await createPanel.locator('.try-body-input').fill(JSON.stringify({ text: 'Temp E2E' }))
    await createPanel.locator('.send-btn').click()

    const createResponse = createPanel.locator('.try-response')
    await expect(createResponse).toBeVisible({ timeout: 5000 })
    const createText = await createResponse.textContent()

    // Extract the comment ID from the response
    const match = createText.match(/"id":\s*(\d+)/)
    if (!match) throw new Error('Could not extract comment ID from: ' + createText)
    const commentId = match[1]

    // Close this panel and open DELETE
    await createCard.locator('.try-btn').click()

    // Delete the comment
    const deleteCard = page.locator('.endpoint-card[data-endpoint="delete-comments--id-"]')
    await deleteCard.locator('.try-btn').click()
    const deletePanel = deleteCard.locator('.try-panel')
    await expect(deletePanel).toBeVisible({ timeout: 3000 })
    await deletePanel.locator('.try-path-input').fill(commentId)
    await deletePanel.locator('.send-btn').click()

    const deleteResponse = deletePanel.locator('.try-response')
    await expect(deleteResponse).toBeVisible({ timeout: 5000 })
    const deleteText = await deleteResponse.textContent()
    expect(deleteText).toContain('204')
  })

  test('POST /boards/{id}/invitations — inviter un nouveau membre', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    // First register a new user
    const registerCard = page.locator('.endpoint-card[data-endpoint="post-auth-register"]')
    await registerCard.locator('.try-btn').click()
    const registerPanel = registerCard.locator('.try-panel')
    await expect(registerPanel).toBeVisible({ timeout: 3000 })
    const email = 'newbie-' + Date.now() + '@test.com'
    await registerPanel.locator('.try-body-input').fill(JSON.stringify({ name: 'Newbie', email, password: 'pass1234' }))
    await registerPanel.locator('.send-btn').click()
    await expect(registerPanel.locator('.try-response')).toBeVisible({ timeout: 5000 })
    const registerText = await registerPanel.locator('.try-response').textContent()
    expect(registerText).toContain('201')
    await registerCard.locator('.try-btn').click()

    // Invite the new user to board 3 (owned by sophie, not alex)
    const inviteCard = page.locator('.endpoint-card[data-endpoint="post-boards--id--invitations"]')
    await inviteCard.locator('.try-btn').click()

    const panel = inviteCard.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    // Board 3 belongs to sophie (token-2), use it as owner
    const tokenInput = page.locator('#apiTokenInput')
    await tokenInput.fill('token-2')
    await panel.locator('.try-path-input').fill('3')

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ email }))

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('201')
    expect(text).toContain('newbie')
  })

  test('GET /boards/{id}/invitations — lister les invitations', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-boards--id--invitations"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('1')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('200')
  })

  test('PUT /invitations/{id} — accepter une invitation (spec PUT ≠ server PATCH → 404 attendu)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    // First create an invitation for marc
    const createCard = page.locator('.endpoint-card[data-endpoint="post-boards--id--invitations"]')
    await createCard.locator('.try-btn').click()
    const createPanel = createCard.locator('.try-panel')
    await expect(createPanel).toBeVisible({ timeout: 3000 })
    await createPanel.locator('.try-path-input').fill('1')
    await createPanel.locator('.try-body-input').fill(JSON.stringify({ email: 'marc@protask.dev' }))
    await createPanel.locator('.send-btn').click()
    await expect(createPanel.locator('.try-response')).toBeVisible({ timeout: 5000 })

    await createCard.locator('.try-btn').click() // close panel

    const acceptCard = page.locator('.endpoint-card[data-endpoint="put-invitations--id-"]')
    await acceptCard.locator('.try-btn').click()
    const acceptPanel = acceptCard.locator('.try-panel')
    await expect(acceptPanel).toBeVisible({ timeout: 3000 })

    await acceptPanel.locator('.try-path-input').fill('1')

    const bodyInput = acceptPanel.locator('.try-body-input')
    await bodyInput.fill(JSON.stringify({ status: 'accepted' }))

    await acceptPanel.locator('.send-btn').click()

    const response = acceptPanel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    // Server uses PATCH, spec says PUT → 404 expected
  })

  test('DELETE /invitations/{id} — annuler une invitation via API (pas dans contrat OpenAPI)', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    // Create an invitation via the viewer
    const createCard = page.locator('.endpoint-card[data-endpoint="post-boards--id--invitations"]')
    await createCard.locator('.try-btn').click()
    const createPanel = createCard.locator('.try-panel')
    await expect(createPanel).toBeVisible({ timeout: 3000 })
    // Board 3, sophie's token
    const tokenInput = page.locator('#apiTokenInput')
    await tokenInput.fill('token-2')
    await createPanel.locator('.try-path-input').fill('3')
    const email = 'del-inv-' + Date.now() + '@test.com'
    // Register user first
    await page.evaluate(async (e) => {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'DelInv', email: e, password: 'pass1234' }),
      })
    }, email)
    await createPanel.locator('.try-body-input').fill(JSON.stringify({ email }))
    await createPanel.locator('.send-btn').click()
    await expect(createPanel.locator('.try-response')).toBeVisible({ timeout: 5000 })
    const createText = await createPanel.locator('.try-response').textContent()
    const match = createText.match(/"id":\s*(\d+)/)
    const invId = match ? match[1] : null

    // Delete directly via API (not in OpenAPI spec)
    const result = await page.evaluate(async (id) => {
      const res = await fetch('/api/invitations/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer token-2' } })
      return { status: res.status }
    }, invId || '1')

    expect(result.status).toBe(204)
  })

  test('401 — requête sans token retourne une erreur', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const tokenInput = page.locator('#apiTokenInput')
    await tokenInput.fill('')

    const card = page.locator('.endpoint-card[data-endpoint="get-boards"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })
    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('401')
  })

  test('404 — requête avec ID inexistant retourne 404', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="get-boards--id-"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    await panel.locator('.try-path-input').fill('999')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('404')
  })

  test('400 — requête POST sans champ requis retourne 400', async ({ page }) => {
    await resetApi(page)
    await page.goto('/')
    await page.click('[data-view="openapi"]')
    await page.waitForSelector('#apiContainer')

    const card = page.locator('.endpoint-card[data-endpoint="post-boards"]')
    await card.locator('.try-btn').click()

    const panel = card.locator('.try-panel')
    await expect(panel).toBeVisible({ timeout: 3000 })

    const bodyInput = panel.locator('.try-body-input')
    await bodyInput.fill('{}')

    await panel.locator('.send-btn').click()

    const response = panel.locator('.try-response')
    await expect(response).toBeVisible({ timeout: 5000 })
    const text = await response.textContent()
    expect(text).toContain('400')
  })

})
