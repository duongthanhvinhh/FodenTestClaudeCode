import { test, expect } from '@fixtures/test-fixtures';
import { ORIENT_BASE_URL } from '@data/orient-catalog';

test.describe('US-003 — Robots, sitemap, and 404 handling', () => {
  test('TC-1101: /robots.txt declares the sitemap', async ({ request }) => {
    const res = await request.get(`${ORIENT_BASE_URL}/robots.txt`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Sitemap:\s*https?:\/\/[^\s]+\/sitemap\.xml/i);
  });

  test('TC-1102: /sitemap.xml is XML and references the home URL', async ({ request }) => {
    const res = await request.get(`${ORIENT_BASE_URL}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<\?xml/);
    expect(body).toContain(`${ORIENT_BASE_URL}/`);
  });

  test('TC-1201: Unknown URL routes to a not-found page', async ({ request }) => {
    const fakePath = '/this-page-does-not-exist-qa-test/';
    // The site soft-404s by redirecting unknown paths to /404.html.
    const initial = await request.get(`${ORIENT_BASE_URL}${fakePath}`, { maxRedirects: 0 });
    const status = initial.status();
    const redirectedTo404 = status === 302 && /404\.html$/i.test(initial.headers()['location'] ?? '');
    const directly404 = status === 404;

    if (!redirectedTo404 && !directly404) {
      // Final fallback: follow redirects and inspect body for not-found copy.
      const followed = await request.get(`${ORIENT_BASE_URL}${fakePath}`);
      const body = (await followed.text()).toLowerCase();
      expect(
        body.includes('not found') || body.includes('404'),
        `Expected 404 status, redirect to /404.html, or "not found" body. status=${status}`,
      ).toBeTruthy();
    } else {
      expect(redirectedTo404 || directly404).toBeTruthy();
    }
  });
});
