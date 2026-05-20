import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export interface AddUserInput {
  userRole?: string;
  status?: string;
  employeeName?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * OrangeHRM Admin > Add System User page object.
 *
 * Encapsulates the Add User form so specs can submit happy-path data or
 * focus on a single validation rule without touching raw locators.
 */
export class OrangeHrmAddUserPage extends BasePage {
  private readonly heading: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly employeeNameInput: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;
  private readonly form: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Add User' });
    this.form = page.locator('.oxd-form');

    this.userRoleDropdown = this.form
      .locator('.oxd-input-group', { hasText: 'User Role' })
      .locator('.oxd-select-text')
      .first();
    this.statusDropdown = this.form
      .locator('.oxd-input-group', { hasText: 'Status' })
      .locator('.oxd-select-text')
      .first();
    this.employeeNameInput = this.form
      .locator('.oxd-input-group', { hasText: 'Employee Name' })
      .locator('input')
      .first();
    this.usernameInput = this.form
      .locator('.oxd-input-group', { hasText: 'Username' })
      .locator('input.oxd-input')
      .first();
    this.passwordInput = this.form
      .locator('.oxd-input-group', { hasText: 'Password' })
      .locator('input[type="password"]')
      .first();
    this.confirmPasswordInput = this.form
      .locator('.oxd-input-group', { hasText: 'Confirm Password' })
      .locator('input[type="password"]')
      .first();
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async waitUntilReady(): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveButton.waitFor({ state: 'visible', timeout: 30_000 });
  }

  /**
   * Type a prefix into Employee Name and pick the first autocomplete
   * suggestion (waiting past the "Searching...." placeholder). Throws if
   * no suggestion appears within 15s.
   */
  async pickFirstEmployeeSuggestion(prefix: string): Promise<string> {
    await this.employeeNameInput.fill(prefix);
    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await dropdown
      .getByText('Searching')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});
    const firstOption = dropdown.locator('div[role="option"]').first();
    await firstOption.waitFor({ state: 'visible', timeout: 15_000 });
    const text = ((await firstOption.textContent()) ?? '').trim();
    await firstOption.click();
    return text;
  }

  /** Returns true if the employee-name field shows an "Invalid" validation. */
  async employeeNameValidationMessage(): Promise<string> {
    return this.validationMessageFor('Employee Name');
  }

  /** Returns the username field's validation message (e.g. duplicate, length). */
  async usernameValidationMessage(): Promise<string> {
    return this.validationMessageFor('Username');
  }

  /** Returns the password field's validation message. */
  async passwordValidationMessage(): Promise<string> {
    return this.validationMessageFor('Password');
  }

  async usernameValue(): Promise<string> {
    return this.usernameInput.inputValue();
  }

  async submitEmpty(): Promise<void> {
    await this.saveButton.click();
  }

  async fillForm(data: AddUserInput): Promise<void> {
    if (data.userRole) {
      await this.userRoleDropdown.click();
      await this.page
        .locator('.oxd-select-dropdown')
        .getByRole('option', { name: data.userRole, exact: true })
        .click();
    }
    if (data.status) {
      await this.statusDropdown.click();
      await this.page
        .locator('.oxd-select-dropdown')
        .getByRole('option', { name: data.status, exact: true })
        .click();
    }
    if (data.employeeName !== undefined) {
      await this.employeeNameInput.fill(data.employeeName);
    }
    if (data.username !== undefined) {
      await this.usernameInput.fill(data.username);
    }
    if (data.password !== undefined) {
      await this.passwordInput.fill(data.password);
    }
    if (data.confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(data.confirmPassword);
    }
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Returns every visible inline validation message inside the form. */
  async allValidationMessages(): Promise<string[]> {
    const messages = await this.form
      .locator('.oxd-input-field-error-message')
      .allTextContents();
    return messages.map((m) => m.trim()).filter((m) => m.length > 0);
  }

  /** Returns the validation message for a single labeled field. */
  async validationMessageFor(label: string): Promise<string> {
    let group = this.form.locator('.oxd-input-group').filter({ hasText: label });
    if (label === 'Password') {
      // The "Confirm Password" group also contains the word "Password" — narrow.
      group = group.filter({ hasNotText: 'Confirm Password' });
    } else if (label === 'Username') {
      group = group.filter({ hasNotText: 'Employee Name' });
    }
    const message = group.locator('.oxd-input-field-error-message').first();
    if ((await message.count()) === 0) return '';
    return (await message.textContent())?.trim() ?? '';
  }

  headingLocator(): Locator {
    return this.heading;
  }
}
