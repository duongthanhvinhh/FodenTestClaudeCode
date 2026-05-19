import { test, expect } from '@fixtures/test-fixtures';
import { EXPECTED_SERVICES_ON_HUB, ORIENT_BASE_URL } from '@data/orient-catalog';

test.describe('US-003 — Services', () => {
  test('TC-401: Services hub mentions each major service area in the HTML', async ({ request }) => {
    const res = await request.get(`${ORIENT_BASE_URL}/services/`);
    expect(res.status()).toBeLessThan(400);
    const body = (await res.text()).toLowerCase();
    for (const name of EXPECTED_SERVICES_ON_HUB) {
      expect(
        body.includes(name.toLowerCase()),
        `/services/ does not reference "${name}"`,
      ).toBeTruthy();
    }
  });

  test('TC-402: QA service page renders hero and FAQ section', async ({ sitePage, page }) => {
    await sitePage.open('/services/qa-and-software-testing/');
    await sitePage.expectH1Contains('qa');
    await expect(
      page.getByRole('heading', { name: /frequently asked questions/i }).first(),
    ).toBeVisible();
  });
});
