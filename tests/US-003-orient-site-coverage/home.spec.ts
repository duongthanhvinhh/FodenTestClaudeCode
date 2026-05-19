import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-003 — Home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC-301: Hero H1 is visible and mentions Software Development', async ({ homePage }) => {
    await homePage.expectHeroVisible();
  });

  test('TC-302: Hero primary CTA navigates to /contact/', async ({ homePage, page }) => {
    await homePage.clickPrimaryCta();
    await expect(page).toHaveURL(/\/contact\/?(\?|$)/);
  });

  test('TC-303: "What We Offer" section heading is visible', async ({ homePage }) => {
    await homePage.expectWhatWeOfferVisible();
  });
});
