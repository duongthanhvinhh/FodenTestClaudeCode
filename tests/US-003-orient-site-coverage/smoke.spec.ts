import { test, expect } from '@fixtures/test-fixtures';
import { ORIENT_BASE_URL, SITE_CATALOG } from '@data/orient-catalog';

/**
 * Smoke is run against the HTTP layer rather than the rendered DOM so
 * the 30-page sweep completes in seconds and is robust against the
 * navigation-timeout flakes that occur when the live site is slow.
 *
 * Canonical is only asserted on pages flagged `strictSeo !== false` —
 * `/careers/` is currently shipped without one.
 */
test.describe('US-003 — Smoke: every catalog URL serves valid HTML', () => {
  for (const entry of SITE_CATALOG) {
    test(`TC-smoke-${entry.id}: GET ${entry.path} returns 2xx with title and H1`, async ({ request }) => {
      const response = await request.get(ORIENT_BASE_URL + entry.path);
      expect(response.status(), `Bad status for ${entry.path}`).toBeLessThan(400);

      const body = await response.text();
      expect(body.length, `Empty body for ${entry.path}`).toBeGreaterThan(1000);

      const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      expect(titleMatch, `Missing <title> on ${entry.path}`).not.toBeNull();
      expect(titleMatch![1].trim(), `Empty <title> on ${entry.path}`).not.toBe('');

      const h1Matches = body.match(/<h1[\s>][\s\S]*?<\/h1>/gi);
      expect(h1Matches, `No <h1> on ${entry.path}`).not.toBeNull();
      const h1Text = h1Matches!.map(h => h.replace(/<[^>]+>/g, ' ')).join(' ').toLowerCase();
      expect(h1Text, `H1 on ${entry.path} should contain "${entry.h1Contains}"`).toContain(entry.h1Contains.toLowerCase());

      if (entry.strictSeo !== false) {
        const canonicalMatch = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        expect(canonicalMatch, `Missing canonical on ${entry.path}`).not.toBeNull();
        expect(canonicalMatch![1]).toContain('orientsoftware.com');
      }
    });
  }
});
