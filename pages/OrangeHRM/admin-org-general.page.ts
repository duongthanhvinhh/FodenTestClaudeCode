import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * Admin > Organization > General Information page.
 */
export class OrangeHrmOrgGeneralPage extends BasePage {
  private readonly heading: Locator;
  private readonly organizationNameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'General Information' });
    this.organizationNameInput = page
      .locator('.oxd-input-group', { hasText: 'Organization Name' })
      .locator('input')
      .first();
  }

  async open(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}/web/index.php/admin/viewOrganizationGeneralInformation`);
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
  }

  headingLocator(): Locator {
    return this.heading;
  }

  organizationNameLocator(): Locator {
    return this.organizationNameInput;
  }
}
