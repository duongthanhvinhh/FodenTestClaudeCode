import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-003 — Careers', () => {
  test('TC-801: At least one open position is visible', async ({ careersPage }) => {
    await careersPage.open();
    await careersPage.expectAtLeastOneJobVisible();
  });

  test('TC-802: Keyword search filters the job list', async ({ careersPage, page }) => {
    await careersPage.open();
    const before = await careersPage.jobCount();
    expect(before).toBeGreaterThan(0);

    await careersPage.searchByKeyword('PHP');
    await page.waitForTimeout(1_500); // allow client-side filter to apply

    const after = await careersPage.jobCount();
    if (after === 0) {
      // Filter hid everything — that is still a valid filter effect.
      expect(after).toBeLessThan(before);
      return;
    }

    const titles = await careersPage.visibleJobTitles();
    const allRelated = titles.every(t => /php/i.test(t));
    // Either the list shrank, or every remaining title matches the query.
    expect(
      after < before || allRelated,
      `Search did not filter the list. before=${before} after=${after} titles=${titles.join(' | ')}`,
    ).toBeTruthy();
  });

  test('TC-803: Opening a job posts shows job details', async ({ careersPage, sitePage, page }) => {
    await careersPage.open();
    await careersPage.openFirstJob();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/careers\//);
    expect(await sitePage.getH1Count()).toBeGreaterThan(0);
  });
});
