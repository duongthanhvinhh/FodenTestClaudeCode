import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { EXPECTED_SERVICES_ON_HUB, ORIENT_BASE_URL } from '@data/orient-catalog';

export class OrientServicesHubPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/services/', { waitUntil: 'domcontentloaded' });
  }

  /**
   * The services hub is mostly narrative — we assert that each major
   * service area is referenced somewhere in the page body, rather than
   * insisting on a specific anchor for each.
   */
  async expectAllServicesReferenced(): Promise<void> {
    const body = this.page.locator('main, body').first();
    for (const name of EXPECTED_SERVICES_ON_HUB) {
      const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      await expect(
        body.getByText(re).first(),
        `Service area not referenced on /services/: "${name}"`,
      ).toBeVisible();
    }
  }
}
