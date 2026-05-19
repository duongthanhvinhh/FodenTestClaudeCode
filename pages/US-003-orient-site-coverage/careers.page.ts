import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ORIENT_BASE_URL } from '@data/orient-catalog';

export class OrientCareersPage extends BasePage {
  private readonly keywordSearch: Locator;
  private readonly jobItems: Locator;
  private readonly jobTitles: Locator;
  private readonly firstJobApplyLink: Locator;

  constructor(page: Page) {
    super(page);
    this.keywordSearch = page.locator('#txtKeyWord');
    this.jobItems = page.locator('.job-info');
    this.jobTitles = page.locator('.job-info :is(h2, h3, h4)');
    this.firstJobApplyLink = page.locator('.job-applying a, .job-info a').first();
  }

  async open(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/careers/', { waitUntil: 'domcontentloaded' });
    // Job list is rendered client-side once the page is interactive.
    await this.jobItems.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectAtLeastOneJobVisible(): Promise<void> {
    await expect(this.jobItems.first()).toBeVisible();
    expect(await this.jobItems.count()).toBeGreaterThan(0);
  }

  async searchByKeyword(keyword: string): Promise<void> {
    await this.keywordSearch.fill(keyword);
    await this.keywordSearch.press('Enter');
  }

  async jobCount(): Promise<number> {
    return this.jobItems.count();
  }

  async visibleJobTitles(): Promise<string[]> {
    return this.jobTitles.allInnerTexts();
  }

  async openFirstJob(): Promise<void> {
    await this.firstJobApplyLink.scrollIntoViewIfNeeded();
    await this.firstJobApplyLink.click();
  }

  searchLocator(): Locator { return this.keywordSearch; }
}
