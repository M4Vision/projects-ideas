import { test, expect } from '@playwright/test';
import { interceptDemoApi, getApiCalls } from '../../../e2e/helpers/intercept.js';
import { ALL_METHODS } from '../../../e2e/helpers/api-coverage.js';

const OPENAPI_METHODS = ALL_METHODS.filter(m => !['getColumns', 'cancelInvitation', 'removeMember'].includes(m));

async function dialogConfirm(page, value) {
  await expect(page.locator('#dialog-overlay')).toHaveClass(/show/);
  if (value !== undefined) {
    const inputType = await page.locator('#dialog-input').getAttribute('type');
    if (inputType === 'color') {
      await page.locator('#dialog-input').evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
    } else {
      await page.fill('#dialog-input', value);
    }
  }
  await page.click('#dialog-confirm-btn');
}

test.describe('ProTask cyberpunk', () => {

  test.beforeEach(async ({ page }) => {
    await interceptDemoApi(page);
  });

  test('full walkthrough — covers all OpenAPI routes', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/protask/templates/cyberpunk/index.html');

    await page.click('#login-toggle-link');
    await page.fill('#reg-name', 'E2E User');
    await page.fill('#login-email', 'e2e@test.com');
    await page.fill('#login-password', 'e2epass123');
    await page.fill('#reg-confirm', 'e2epass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);

    await page.click('#nav-logout');
    await page.waitForTimeout(200);
    await expect(page.locator('#page-login')).toHaveClass(/active/);
    await page.click('#login-toggle-link');
    await page.fill('#login-email', 'e2e@test.com');
    await page.fill('#login-password', 'e2epass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);

    const existingBoard = page.locator('.board-card').first();
    if (await existingBoard.isVisible()) {
      await existingBoard.click();
      await page.waitForTimeout(300);
      await expect(page.locator('#page-board')).toHaveClass(/active/);
    }
    await page.click('#nav-dashboard');
    await page.waitForTimeout(200);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);

    await page.click('#dash-new-board-btn');
    await dialogConfirm(page, 'Board E2E');
    await page.waitForTimeout(300);
    await expect(page.locator('#board-title')).toContainText('Board E2E');

    const addBtn = page.locator('[data-add-card]').first();
    await addBtn.click();
    await dialogConfirm(page, 'Carte Alpha');
    await page.waitForTimeout(300);
    await addBtn.click();
    await dialogConfirm(page, 'Carte Beta');
    await page.waitForTimeout(300);
    await expect(page.locator('.task-card')).toHaveCount(2);

    await page.evaluate(() => {
      const card = document.querySelector('.task-card');
      const target = document.querySelectorAll('.board-col-body')[1];
      if (!card || !target) return;
      const dt = new DataTransfer();
      card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
      target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
      card.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const card = document.querySelector('.task-card');
      if (card) openCardModal(+card.dataset.cardId);
    });
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-overlay')).toHaveClass(/show/);

    await page.fill('#modal-edit-title', 'Carte Modifiée');
    await page.click('#modal-save-btn');
    await page.waitForTimeout(300);

    await page.fill('#modal-comment-input', 'Commentaire E2E');
    await page.press('#modal-comment-input', 'Enter');
    await page.waitForTimeout(200);

    await page.locator('#modal-overlay').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const card = document.querySelector('.task-card');
      if (card) openCardModal(+card.dataset.cardId);
    });
    await page.waitForTimeout(300);

    const delComment = page.locator('.modal-comment button:has-text("✕")').last();
    if (await delComment.isVisible()) {
      await delComment.click();
      await page.waitForTimeout(200);
    }

    await page.click('#modal-delete-btn');
    await dialogConfirm(page);
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/show/);

    await page.click('[data-tab="settings"]');
    await page.waitForTimeout(300);
    await expect(page.locator('#settings-board-name')).toHaveValue('Board E2E');

    await page.fill('#settings-board-name', 'Board Renamed');
    await page.click('#settings-save-btn');
    await page.waitForTimeout(200);

    const colEdit = page.locator('.settings-col-item .col-edit').first();
    if (await colEdit.isVisible()) {
      await colEdit.click();
      await dialogConfirm(page, 'Colonne Alpha');
      await page.waitForTimeout(200);
    }

    await page.click('#settings-add-col');
    await dialogConfirm(page, 'Colonne E2E');
    await page.waitForTimeout(200);

    const upBtns = page.locator('.settings-col-item button:has-text("▲")');
    if (await upBtns.count() >= 2) {
      await upBtns.nth(1).click();
      await page.waitForTimeout(200);
    }

    const downBtns = page.locator('.settings-col-item button:has-text("▼")');
    if (await downBtns.count() >= 2) {
      await downBtns.nth(0).click();
      await page.waitForTimeout(200);
    }

    const colDel = page.locator('.settings-col-item .col-del').last();
    if (await colDel.isVisible()) {
      await colDel.click();
      await dialogConfirm(page);
      await page.waitForTimeout(200);
    }

    await page.click('#settings-add-label');
    await dialogConfirm(page, 'Label E2E');
    await dialogConfirm(page, '#FF5722');
    await page.waitForTimeout(200);

    const labelEdit = page.locator('.settings-label-item button:has-text("✎")').first();
    if (await labelEdit.isVisible()) {
      await labelEdit.click();
      await dialogConfirm(page, 'Label Modifié');
      await dialogConfirm(page, '#4CAF50');
      await page.waitForTimeout(200);
    }

    const labelDel = page.locator('.settings-label-item button:has-text("✕")').first();
    if (await labelDel.isVisible()) {
      await labelDel.click();
      await page.waitForTimeout(200);
    }

    await page.click('[data-tab="board"]');
    await page.waitForTimeout(300);

    await page.click('#board-invite-btn');
    await dialogConfirm(page, 'sophie@protask.dev');
    await page.waitForTimeout(200);

    const invPanelBtn = page.locator('#board-invitations-btn');
    if (await invPanelBtn.isVisible()) {
      await invPanelBtn.click();
      await page.waitForTimeout(200);
    }

    const invPanel = page.locator('#board-invitations-panel');
    if (await invPanel.isVisible()) {
      const decline = invPanel.locator('button').last();
      if (await decline.isVisible()) {
        await decline.click();
        await page.waitForTimeout(200);
      }
    }

    await page.click('#board-invite-btn');
    await dialogConfirm(page, 'marc@protask.dev');
    await page.waitForTimeout(200);
    if (await invPanelBtn.isVisible()) {
      await invPanelBtn.click();
      await page.waitForTimeout(200);
    }
    if (await invPanel.isVisible()) {
      const accept = invPanel.locator('button').first();
      if (await accept.isVisible()) {
        await accept.click();
        await page.waitForTimeout(200);
      }
    }

    await page.click('[data-tab="profile"]');
    await page.waitForTimeout(300);
    await expect(page.locator('#profile-name-display')).toContainText('E2E User');
    await page.fill('#profile-name', 'E2E Updated');
    await page.click('#profile-save-btn');
    await page.waitForTimeout(200);
    await expect(page.locator('#profile-name-display')).toContainText('E2E Updated');

    await page.click('[data-tab="board"]');
    await page.waitForTimeout(200);
    const avatar = page.locator('.board-avatar').first();
    if (await avatar.isVisible()) {
      await avatar.click();
      await page.waitForTimeout(100);
    }

    await page.click('[data-tab="settings"]');
    await page.waitForTimeout(200);
    await page.click('#settings-del-board-btn');
    await dialogConfirm(page);
    await page.waitForTimeout(300);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);

    await page.click('#nav-logout');
    await page.waitForTimeout(200);
    await expect(page.locator('#page-login')).toHaveClass(/active/);

    const called = await getApiCalls(page);
    const missing = OPENAPI_METHODS.filter(m => !called.includes(m));
    console.log('Routes OpenAPI appelées:', called.length, '/', OPENAPI_METHODS.length);
    if (missing.length) console.log('Manquantes:', missing.join(', '));
    expect(missing).toEqual([]);
  });

  test('affiche les vues login et register', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await expect(page.locator('#login-form')).toBeVisible();
    await page.click('#login-toggle-link');
    await expect(page.locator('#reg-name-field')).toHaveClass(/show/);
    await expect(page.locator('#login-submit-btn')).toContainText('INSCRIRE');
  });

  test('affiche une erreur sur identifiants invalides', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'wrong@email.com');
    await page.fill('#login-password', 'wrongpass');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(200);
    await expect(page.locator('#login-error')).toHaveClass(/show/);
  });

  test('le dashboard est accessible après connexion', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'alex@protask.dev');
    await page.fill('#login-password', 'pass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    await expect(page.locator('#dash-grid')).toBeVisible();
    await expect(page.locator('.board-card').first()).toBeVisible();
  });

  test('les avatars des membres sont affichés sur le board', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'alex@protask.dev');
    await page.fill('#login-password', 'pass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);
    const boardCard = page.locator('.board-card').first();
    await boardCard.click();
    await page.waitForTimeout(300);
    await expect(page.locator('#board-avatars')).toBeVisible();
  });

  test('crée un board juste après inscription', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.click('#login-toggle-link');
    await page.fill('#reg-name', 'Nouveau Membre');
    await page.fill('#login-email', 'nouveau@test.com');
    await page.fill('#login-password', 'nouveaupass123');
    await page.fill('#reg-confirm', 'nouveaupass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    await page.click('#dash-new-board-btn');
    await dialogConfirm(page, 'Board Post-Inscription');
    await page.waitForTimeout(300);
    await expect(page.locator('#board-title')).toContainText('Board Post-Inscription');
  });

  test('inscription → créer board → ajouter cartes → dashboard → sélectionner board', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.click('#login-toggle-link');
    await page.fill('#reg-name', 'Créateur Test');
    await page.fill('#login-email', 'createur@test.com');
    await page.fill('#login-password', 'createurpass123');
    await page.fill('#reg-confirm', 'createurpass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);

    await page.click('#dash-new-board-btn');
    await dialogConfirm(page, 'Board Test');
    await page.waitForTimeout(300);
    await expect(page.locator('#board-title')).toContainText('Board Test');

    await page.locator('[data-add-card]').first().click();
    await dialogConfirm(page, 'Première carte');
    await page.waitForTimeout(300);
    await page.locator('[data-add-card]').first().click();
    await dialogConfirm(page, 'Deuxième carte');
    await page.waitForTimeout(200);
    await expect(page.locator('.task-card')).toHaveCount(2);

    await page.click('#nav-dashboard');
    await page.waitForTimeout(200);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    await page.locator('.board-card').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#page-board')).toHaveClass(/active/);
    await expect(page.locator('#board-title')).toContainText('Board Test');
  });

  test('naviguer un board existant sans créer ni modifier', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'alex@protask.dev');
    await page.fill('#login-password', 'pass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(300);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);

    await page.locator('.board-card').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#page-board')).toHaveClass(/active/);
    await expect(page.locator('#board-title')).toBeVisible();
    await expect(page.locator('.task-card').first()).toBeVisible();

    await page.evaluate(() => {
      const card = document.querySelector('.task-card');
      if (card) openCardModal(+card.dataset.cardId);
    });
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-overlay')).toHaveClass(/show/);
    await page.locator('#modal-overlay').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(200);
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/show/);

    await page.click('[data-tab="settings"]');
    await page.waitForTimeout(200);
    await expect(page.locator('#settings-board-name')).toBeVisible();

    await page.click('[data-tab="profile"]');
    await page.waitForTimeout(200);
    await expect(page.locator('#profile-name-display')).toBeVisible();

    await page.click('#nav-dashboard');
    await page.waitForTimeout(200);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
  });
});

test.describe('ProTask — Invitations & CRUD (API directe)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
  });

  test('accepter invitation', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      await window.demoApi.register({ name: 'U1', email: 'accept-c@test.com', password: 'pass1234' });
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      const inv = await window.demoApi.inviteMember(board.id, 'accept-c@test.com');
      const a = await window.demoApi.acceptInvitation(inv.id);
      return a.status;
    });
    expect(result).toBe('accepted');
  });

  test('refuser invitation', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      await window.demoApi.register({ name: 'U2', email: 'decline-c@test.com', password: 'pass1234' });
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      const inv = await window.demoApi.inviteMember(board.id, 'decline-c@test.com');
      return (await window.demoApi.respondToInvitation(inv.id, 'declined')).status;
    });
    expect(result).toBe('declined');
  });

  test('annuler invitation', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      await window.demoApi.register({ name: 'U3', email: 'cancel-c@test.com', password: 'pass1234' });
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      const inv = await window.demoApi.inviteMember(board.id, 'cancel-c@test.com');
      await window.demoApi.cancelInvitation(inv.id);
      return (await window.demoApi.getInvitations(board.id)).find(i => i.id === inv.id);
    });
    expect(result).toBeUndefined();
  });

  test('retirer membre', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const r = await window.demoApi.register({ name: 'U4', email: 'remove-c@test.com', password: 'pass1234' });
      const invitedUserId = r.user.id;
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      const inv = await window.demoApi.inviteMember(board.id, 'remove-c@test.com');
      await window.demoApi.respondToInvitation(inv.id, 'accepted');
      await window.demoApi.removeMember(board.id, invitedUserId);
      return (await window.demoApi.getBoard(board.id)).members.map(m => m.email);
    });
    expect(result).not.toContain('remove-c@test.com');
  });

  test('wrong user cannot respond', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      await window.demoApi.register({ name: 'U5', email: 'wrong-c@test.com', password: 'pass1234' });
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      const inv = await window.demoApi.inviteMember(board.id, 'wrong-c@test.com');
      await window.demoApi.login({ email: 'marc@protask.dev', password: 'pass123' });
      try { await window.demoApi.acceptInvitation(inv.id); return 'ok'; }
      catch (e) { return e.message; }
    });
    expect(result).toContain('pas répondre');
  });

  test('déjà invité → erreur', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      await window.demoApi.register({ name: 'U6', email: 'dup-c@test.com', password: 'pass1234' });
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      await window.demoApi.inviteMember(board.id, 'dup-c@test.com');
      try { await window.demoApi.inviteMember(board.id, 'dup-c@test.com'); return 'ok'; }
      catch (e) { return e.message; }
    });
    expect(result).toContain('déjà en attente');
  });

  test('déjà membre → erreur', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      await window.demoApi.register({ name: 'U7', email: 'member-c@test.com', password: 'pass1234' });
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const board = (await window.demoApi.getBoards())[0];
      const inv = await window.demoApi.inviteMember(board.id, 'member-c@test.com');
      await window.demoApi.respondToInvitation(inv.id, 'accepted');
      try { await window.demoApi.inviteMember(board.id, 'member-c@test.com'); return 'ok'; }
      catch (e) { return e.message; }
    });
    expect(result).toContain('membre');
  });

  test('email invalide → erreur', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      try { await window.demoApi.inviteMember(1, 'pas-email'); return 'ok'; }
      catch (e) { return e.message; }
    });
    expect(result).toContain('invalide');
  });

  test('utilisateur inexistant → erreur', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      try { await window.demoApi.inviteMember(1, 'nobody@test.com'); return 'ok'; }
      catch (e) { return e.message; }
    });
    expect(result).toContain('trouvé');
  });

  test('board CRUD', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const b = await window.demoApi.createBoard({ title: 'CRUD Board', color: '#FF5722', categories: ['Dev'], description: 'Desc' });
      await window.demoApi.updateBoard(b.id, { title: 'Updated', color: '#4CAF50', categories: ['Design'], description: 'Nouvelle desc' });
      const updated = await window.demoApi.getBoard(b.id);
      await window.demoApi.deleteBoard(b.id);
      const deleted = await window.demoApi.getBoard(b.id).catch(() => null);
      return { title: updated.title, color: updated.color, categories: updated.categories, description: updated.description, deleted };
    });
    expect(result.title).toBe('Updated');
    expect(result.color).toBe('#4CAF50');
    expect(result.categories).toEqual(['Design']);
    expect(result.description).toBe('Nouvelle desc');
    expect(result.deleted).toBeNull();
  });

  test('label CRUD', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const b = await window.demoApi.createBoard({ title: 'Labels' });
      const l = await window.demoApi.createLabel(b.id, { name: 'L1', color: '#F00', description: 'D1' });
      await window.demoApi.updateLabel(l.id, { name: 'L2', color: '#0F0', description: 'D2' });
      const up = (await window.demoApi.getLabels(b.id)).find(x => x.id === l.id);
      await window.demoApi.deleteLabel(l.id);
      const del = (await window.demoApi.getLabels(b.id)).find(x => x.id === l.id);
      return { name: up.name, color: up.color, desc: up.description, deleted: !del };
    });
    expect(result.name).toBe('L2');
    expect(result.color).toBe('#0F0');
    expect(result.desc).toBe('D2');
    expect(result.deleted).toBe(true);
  });

  test('colonne CRUD + reorder', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const b = await window.demoApi.createBoard({ title: 'Cols' });
      const c = await window.demoApi.createColumn(b.id, { title: 'C1', color: '#FF9800', description: 'Col 1' });
      await window.demoApi.updateColumn(c.id, { title: 'C2', color: '#E91E63', description: 'Col 2' });
      const up = (await window.demoApi.getColumns(b.id)).find(x => x.id === c.id);
      const cols = await window.demoApi.getColumns(b.id);
      await window.demoApi.reorderColumns([{ id: cols[0].id, order: 1 }, { id: cols[1].id, order: 0 }]);
      const re = await window.demoApi.getColumns(b.id);
      await window.demoApi.deleteColumn(c.id);
      const del = (await window.demoApi.getColumns(b.id)).find(x => x.id === c.id);
      return { title: up.title, color: up.color, desc: up.description, reordered: re[0].order === 0, deleted: !del };
    });
    expect(result.title).toBe('C2');
    expect(result.color).toBe('#E91E63');
    expect(result.desc).toBe('Col 2');
    expect(result.reordered).toBe(true);
    expect(result.deleted).toBe(true);
  });

  test('assignee picker — update assignee via modal UI', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'alex@protask.dev');
    await page.fill('#login-password', 'pass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(400);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    const existingBoard = page.locator('.board-card').first();
    if (await existingBoard.isVisible()) {
      await existingBoard.click();
      await page.waitForTimeout(300);
      await expect(page.locator('#page-board')).toHaveClass(/active/);
    }
    const addBtn = page.locator('[data-add-card]').first();
    if (!(await addBtn.isVisible())) {
      await page.click('#dash-new-board-btn');
      await dialogConfirm(page, 'Assignee Test C');
      await page.waitForTimeout(300);
    }
    const adder = page.locator('[data-add-card]').first();
    await expect(adder).toBeVisible({ timeout: 3000 });
    await adder.click();
    await dialogConfirm(page, 'Carte Test C');
    await page.waitForTimeout(300);
    const card = page.locator('.task-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    await page.evaluate(() => {
      const el = document.querySelector('.task-card');
      if (el) openCardModal(+el.dataset.cardId);
    });
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-overlay')).toHaveClass(/show/);
    await expect(page.locator('#modal-edit-assignee')).toBeVisible();
    await page.selectOption('#modal-edit-assignee', '2');
    await expect(page.locator('#unsaved-indicator')).toBeVisible();
    await page.click('#modal-save-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#modal-assignee')).not.toContainText('Non assigné');
    await page.locator('#modal-close-btn').click();
  });

  test('self-invite rejetée avec toast erreur', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'alex@protask.dev');
    await page.fill('#login-password', 'pass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(400);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    let boardBtn = page.locator('.board-card').first();
    if (!(await boardBtn.isVisible())) {
      await page.click('#dash-new-board-btn');
      await dialogConfirm(page, 'Invite C Test');
      await page.waitForTimeout(300);
    } else {
      await boardBtn.click();
      await page.waitForTimeout(300);
    }
    await expect(page.locator('#page-board')).toHaveClass(/active/);
    await page.locator('#board-invite-btn').waitFor({ state: 'visible', timeout: 3000 });
    await page.click('#board-invite-btn');
    await dialogConfirm(page, 'alex@protask.dev');
    await page.waitForTimeout(300);
    await expect(page.locator('.toast.error')).toBeVisible();
  });

  test('assigner un label à une carte via le modal UI', async ({ page }) => {
    await page.goto('/protask/templates/cyberpunk/index.html');
    await page.fill('#login-email', 'alex@protask.dev');
    await page.fill('#login-password', 'pass123');
    await page.click('#login-submit-btn');
    await page.waitForTimeout(400);
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    const existingBoard = page.locator('.board-card').first();
    if (await existingBoard.isVisible()) {
      await existingBoard.click();
      await page.waitForTimeout(300);
      await expect(page.locator('#page-board')).toHaveClass(/active/);
    }
    const adder = page.locator('[data-add-card]').first();
    await expect(adder).toBeVisible({ timeout: 3000 });
    await adder.click();
    await dialogConfirm(page, 'Carte Labels C');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const el = document.querySelector('.task-card');
      if (el) openCardModal(+el.dataset.cardId);
    });
    await page.waitForTimeout(300);
    await expect(page.locator('#modal-overlay')).toHaveClass(/show/);
    await expect(page.locator('#label-picker')).toBeVisible();

    const secondLabel = page.locator('#label-picker div[data-label-id]').nth(1);
    await secondLabel.click();
    await expect(secondLabel).toHaveClass(/checked/);

    await page.click('#modal-save-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#modal-labels')).not.toContainText('Aucun');
    await page.locator('#modal-close-btn').click();
  });

  test('assigner un label à une carte via API directe', async ({ page }) => {
    const result = await page.evaluate(async () => {
      await window.demoApi.login({ email: 'alex@protask.dev', password: 'pass123' });
      const b = await window.demoApi.getBoards();
      const board = b[0];
      const cols = await window.demoApi.getColumns(board.id);
      const labels = await window.demoApi.getLabels(board.id);
      if (!cols.length || !labels.length) return { ok: false };
      const card = await window.demoApi.createCard(cols[0].id, { title: 'Label Card C', labels: [] });
      await window.demoApi.updateCard(card.id, { labels: [labels[0].id] });
      const updated = await window.demoApi.getCard(card.id);
      return { ok: updated.labels && updated.labels.length > 0 && updated.labels[0].id === labels[0].id };
    });
    expect(result.ok).toBe(true);
  });
});
