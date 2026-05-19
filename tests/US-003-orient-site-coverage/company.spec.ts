import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-003 — Company pages', () => {
  test('TC-601: Who We Are exposes Culture and Management Team anchors', async ({ sitePage, page }) => {
    await sitePage.open('/who-we-are/');
    // Anchors live inside the page (#company-culture, #management-team).
    await expect(page.locator('#company-culture, [id*="culture" i]').first()).toBeAttached();
    await expect(page.locator('#management-team, [id*="management" i]').first()).toBeAttached();
  });

  test('TC-602: How We Work page renders an H1 and primary content', async ({ sitePage }) => {
    await sitePage.open('/how-we-work/');
    expect(await sitePage.getH1Count()).toBeGreaterThan(0);
    expect((await sitePage.pageTitle()).length).toBeGreaterThan(5);
  });

  test('TC-603: Case Studies lists at least 3 case study items', async ({ sitePage, page }) => {
    await sitePage.open('/case-studies/');
    const cards = page.locator('a[href*="/case-studies/"]:not([href$="/case-studies/"])');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });
});
