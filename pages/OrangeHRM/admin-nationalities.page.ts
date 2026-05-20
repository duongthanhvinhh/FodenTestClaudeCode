import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * Admin > Nationalities page.
 */
export class OrangeHrmNationalitiesPage extends BasePage {
  private readonly heading: Locator;
  private readonly addButton: Locator;
  private readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Nationalities' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.tableRows = page.locator('.oxd-table-body .oxd-table-card');
  }

  async open(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}/web/index.php/admin/nationality`);
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
    // Wait until either the table has rendered at least one row, or the
    // page-level loader has finished — whichever comes first.
    await this.tableRows
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => {});
  }

  headingLocator(): Locator {
    return this.heading;
  }

  addButtonLocator(): Locator {
    return this.addButton;
  }

  async rowCount(): Promise<number> {
    return this.tableRows.count();
  }
}
