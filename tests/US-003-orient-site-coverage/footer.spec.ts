import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-003 — Footer', () => {
  test.beforeEach(async ({ headerPage }) => {
    await headerPage.openHome();
  });

  test('TC-201: Footer column headings render', async ({ footerPage }) => {
    await footerPage.expectColumnHeadings();
  });

  test('TC-202: Footer exposes the sales@orientsoftware.com mailto link', async ({ footerPage }) => {
    await footerPage.expectSalesEmail();
  });

  test('TC-203a: Footer Terms link opens /terms-of-use/', async ({ footerPage, page, sitePage }) => {
    await footerPage.openTerms();
    await expect(page).toHaveURL(/\/terms-of-use\/?$/);
    expect(await sitePage.getH1Count()).toBeGreaterThan(0);
  });

  test('TC-203b: Footer Privacy link opens /privacy-statement/', async ({ footerPage, page, sitePage }) => {
    await footerPage.openPrivacy();
    await expect(page).toHaveURL(/\/privacy-statement\/?$/);
    expect(await sitePage.getH1Count()).toBeGreaterThan(0);
  });

  test('TC-204: Back to top scrolls to the top of the page', async ({ footerPage, page }) => {
    await footerPage.scrollToBottom();
    expect(await footerPage.currentScrollY()).toBeGreaterThan(500);
    await footerPage.clickBackToTop();
    // Smooth-scroll animations can run several hundred ms; allow generous timeout.
    await expect.poll(() => footerPage.currentScrollY(), {
      timeout: 8_000,
      intervals: [100, 250, 500, 1000],
    }).toBeLessThan(200);
    await expect(page).toHaveURL(/#main$/);
  });
});
