import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * OrangeHRM Admin > Edit System User page object. The form is nearly
 * identical to Add User but the heading reads "Edit User" and the
 * Employee field is read-only.
 */
export class OrangeHrmEditUserPage extends BasePage {
  private readonly heading: Locator;
  private readonly statusDropdown: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Edit User' });
    this.statusDropdown = page
      .locator('.oxd-input-group', { hasText: 'Status' })
      .locator('.oxd-select-text')
      .first();
    this.userRoleDropdown = page
      .locator('.oxd-input-group', { hasText: 'User Role' })
      .locator('.oxd-select-text')
      .first();
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async waitUntilReady(): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveButton.waitFor({ state: 'visible', timeout: 30_000 });
  }

  async setStatus(status: string): Promise<void> {
    await this.statusDropdown.click();
    await this.page
      .locator('.oxd-select-dropdown')
      .getByRole('option', { name: status, exact: true })
      .click();
  }

  async statusValue(): Promise<string> {
    return (await this.statusDropdown.textContent())?.trim() ?? '';
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  headingLocator(): Locator {
    return this.heading;
  }
}
