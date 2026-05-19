import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { EXPECTED_TECHNOLOGIES, ORIENT_BASE_URL } from '@data/orient-catalog';

export class OrientTechnologiesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/technologies/', { waitUntil: 'domcontentloaded' });
  }

  async expectAllTechLinksVisible(): Promise<void> {
    // Use the dedicated link container shown in the /technologies/ hub
    // to avoid matching unrelated nav or footer links.
    const linkScope = this.page.locator('a[href^="/technologies/"]');
    for (const tech of EXPECTED_TECHNOLOGIES) {
      const re = new RegExp('^' + tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      await expect(
        linkScope.filter({ hasText: re }).first(),
        `Technology link missing on /technologies/: "${tech}"`,
      ).toBeAttached();
    }
  }
}
