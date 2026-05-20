import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * Admin > Job > Job Titles list page. Only the heading and Add button are
 * needed for the navigation smoke test.
 */
export class OrangeHrmJobTitlesPage extends BasePage {
  private readonly heading: Locator;
  private readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Job Titles' });
    this.addButton = page.getByRole('button', { name: 'Add' });
  }

  async open(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}/web/index.php/admin/viewJobTitleList`);
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
  }

  headingLocator(): Locator {
    return this.heading;
  }

  addButtonLocator(): Locator {
    return this.addButton;
  }
}
