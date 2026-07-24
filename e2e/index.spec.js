import { test, expect } from '@playwright/test';

test.describe('index.html — Navigateur de projets', () => {

  test('charge et affiche les projets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Projets');
    const nav = page.locator('#projectNav');
    await expect(nav.locator('a')).toHaveCount(2);
    await expect(nav.locator('a').first()).toContainText('ProTask');
  });

  test('sélectionne un projet par défaut', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toContainText('ProTask');
    await expect(sidebar).toContainText('Neo-Brutalist');
  });

  test('change de projet via la navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#projectNav');
    await nav.locator('a').last().click();
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toContainText('ShopFlow');
  });

  test('les liens PRD/OpenAPI/demo-api existent', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('#sidebar');
    await expect(sidebar.locator('a[href*="PRD"]')).toBeVisible();
    await expect(sidebar.locator('a[href*="openapi"]')).toBeVisible();
    await expect(sidebar.locator('a[href*="demo-api"]')).toBeVisible();
  });

  test('le chargement du template dans l\'iframe', async ({ page }) => {
    await page.goto('/');
    const iframe = page.locator('#previewFrame');
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute('src');
    expect(src).toContain('protask/templates/neo-brutalist/index.html');
  });

  test('les boutons viewport fonctionnent', async ({ page }) => {
    await page.goto('/');
    const iframe = page.locator('#previewFrame');
    const btns = page.locator('.viewport-btn');
    await expect(btns).toHaveCount(5);
    await btns.nth(2).click();
    const width = await iframe.getAttribute('style');
    expect(width).toContain('768px');
  });

});
