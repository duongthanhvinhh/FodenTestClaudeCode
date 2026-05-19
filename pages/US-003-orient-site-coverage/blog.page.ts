import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { BLOG_CATEGORIES, ORIENT_BASE_URL } from '@data/orient-catalog';

export class OrientBlogPage extends BasePage {
  private readonly searchBox: Locator;
  private readonly articles: Locator;
  private readonly firstPostLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.locator('#search-box').first();
    this.articles = page.locator('article, [class*="blog-item"], [class*="post-item"]');
    this.firstPostLink = page
      .locator('a[href*="/blog/"]:not([href$="/blog/"]):not([href*="/category/"]):not([href*="/tag/"]):not([href*="/author/"])')
      .first();
  }

  async open(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/blog/', { waitUntil: 'domcontentloaded' });
  }

  async expectCategoryLinksVisible(): Promise<void> {
    for (const name of BLOG_CATEGORIES) {
      const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      await expect(
        this.page.getByRole('link', { name: re }).first(),
        `Blog category missing: "${name}"`,
      ).toBeVisible();
    }
  }

  async searchFor(query: string): Promise<void> {
    await this.searchBox.click();
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
  }

  async openFirstPost(): Promise<void> {
    await this.firstPostLink.scrollIntoViewIfNeeded();
    await this.firstPostLink.click();
  }

  postCountLocator(): Locator {
    return this.articles;
  }
}
