import { Locator, Page, Response, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ORIENT_BASE_URL } from '@data/orient-catalog';

/**
 * Generic Orient page — used by smoke / SEO tests where the assertions
 * are page-shape rather than page-specific (H1 present, canonical, meta).
 */
export class OrientSitePage extends BasePage {
  private readonly h1: Locator;

  constructor(page: Page) {
    super(page);
    this.h1 = page.locator('h1').first();
  }

  async open(path: string): Promise<Response | null> {
    const url = path.startsWith('http') ? path : ORIENT_BASE_URL + path;
    return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async expectH1Contains(substring: string): Promise<void> {
    await expect(this.h1).toBeVisible();
    const text = (await this.h1.innerText()).toLowerCase();
    expect(text, `H1 should contain "${substring}" (got: "${text}")`).toContain(substring.toLowerCase());
  }

  async getH1Count(): Promise<number> {
    return this.page.locator('h1').count();
  }

  async metaDescription(): Promise<string | null> {
    return this.page.locator('meta[name="description"]').first().getAttribute('content');
  }

  async canonicalHref(): Promise<string | null> {
    return this.page.locator('link[rel="canonical"]').first().getAttribute('href');
  }

  async ogTagContent(property: string): Promise<string | null> {
    return this.page.locator(`meta[property="${property}"]`).first().getAttribute('content');
  }

  async pageTitle(): Promise<string> {
    return this.page.title();
  }

  async findLinkByName(re: RegExp): Promise<Locator> {
    return this.page.getByRole('link', { name: re }).first();
  }

  async expectAnyLinkMatches(substrings: readonly string[]): Promise<void> {
    for (const substring of substrings) {
      const re = new RegExp(substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const link = this.page.getByRole('link', { name: re }).first();
      await expect(link, `Expected at least one link matching /${substring}/i`).toBeVisible();
    }
  }
}
