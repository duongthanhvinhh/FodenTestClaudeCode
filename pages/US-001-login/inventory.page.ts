import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class InventoryPage extends BasePage {
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('[data-test="title"]');
  }

  headingLocator(): Locator {
    return this.heading;
  }

  async headingText(): Promise<string> {
    return (await this.heading.textContent()) ?? '';
  }
}
