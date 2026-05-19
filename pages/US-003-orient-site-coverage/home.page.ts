import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ORIENT_BASE_URL } from '@data/orient-catalog';

export class OrientHomePage extends BasePage {
  private readonly hero: Locator;
  private readonly whatWeOfferHeading: Locator;
  private readonly primaryCta: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.locator('h1').first();
    this.whatWeOfferHeading = page.getByRole('heading', { name: /what we offer/i }).first();
    this.primaryCta = page
      .getByRole('link', { name: /get in touch|get a quote|let'?s get to work|start your project/i })
      .first();
  }

  async open(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/', { waitUntil: 'domcontentloaded' });
  }

  async expectHeroVisible(): Promise<void> {
    await expect(this.hero).toBeVisible();
    await expect(this.hero).toContainText(/software development/i);
  }

  async expectWhatWeOfferVisible(): Promise<void> {
    await expect(this.whatWeOfferHeading).toBeVisible();
  }

  async clickPrimaryCta(): Promise<void> {
    await this.primaryCta.scrollIntoViewIfNeeded();
    await this.primaryCta.click();
  }
}
