import { test } from '@fixtures/test-fixtures';

test.describe('US-003 — Technologies hub', () => {
  test('TC-501: Lists each major technology', async ({ technologiesPage }) => {
    await technologiesPage.open();
    await technologiesPage.expectAllTechLinksVisible();
  });
});
