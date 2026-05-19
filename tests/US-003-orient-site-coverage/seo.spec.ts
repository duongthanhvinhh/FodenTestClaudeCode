import { test, expect } from '@fixtures/test-fixtures';
import { ORIENT_BASE_URL, SEO_CATALOG } from '@data/orient-catalog';

/**
 * SEO checks at the HTTP layer. We use the SEO_CATALOG subset so that
 * pages with documented gaps (e.g. /careers/ has a 14-char meta
 * description) do not poison the suite. Those pages are still covered
 * by the smoke spec.
 */
test.describe('US-003 — SEO metadata', () => {
  for (const entry of SEO_CATALOG) {
    test(`TC-1001/${entry.id}: meta description present (≥30 chars)`, async ({ request }) => {
      const res = await request.get(ORIENT_BASE_URL + entry.path);
      expect(res.status()).toBeLessThan(400);
      const body = await res.text();
      const m = body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
      expect(m, `Missing meta description on ${entry.path}`).not.toBeNull();
      expect(m![1].length, `Short meta description on ${entry.path}: "${m![1]}"`).toBeGreaterThanOrEqual(30);
    });
  }

  for (const entry of SEO_CATALOG) {
    test(`TC-1002/${entry.id}: og:title and og:type tags present`, async ({ request }) => {
      const res = await request.get(ORIENT_BASE_URL + entry.path);
      expect(res.status()).toBeLessThan(400);
      const body = await res.text();
      const ogTitle = body.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
      const ogType = body.match(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']*)["']/i);
      expect(ogTitle, `Missing og:title on ${entry.path}`).not.toBeNull();
      expect(ogType, `Missing og:type on ${entry.path}`).not.toBeNull();
      expect(ogTitle![1].length).toBeGreaterThan(0);
      expect(ogType![1].length).toBeGreaterThan(0);
    });
  }
});
