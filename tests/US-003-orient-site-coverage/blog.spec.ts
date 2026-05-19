import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-003 — Blog', () => {
  test('TC-701: Blog index lists category links', async ({ blogPage }) => {
    await blogPage.open();
    await blogPage.expectCategoryLinksVisible();
  });

  test('TC-702: Blog search input accepts a query without errors', async ({ blogPage, page }) => {
    await blogPage.open();
    await blogPage.searchFor('testing');
    // Search is JS-driven on /blog/; pressing Enter doesn't necessarily
    // navigate, but the page should remain responsive and the input
    // should retain its value.
    await page.waitForTimeout(500);
    await expect(page.locator('#search-box')).toHaveValue(/testing/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-703: A blog post page has an H1 and an author byline', async ({ blogPage, sitePage, page }) => {
    await blogPage.open();
    await blogPage.openFirstPost();
    await page.waitForLoadState('domcontentloaded');
    expect(await sitePage.getH1Count()).toBeGreaterThan(0);
    await expect(page.locator('a.post-author, [class*="author"]').first()).toBeVisible();
  });
});
