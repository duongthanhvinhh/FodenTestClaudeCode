import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * OrangeHRM Login page object.
 *
 * Covers the login form, validation messages, and the "Forgot your
 * password?" link. All UI interactions for the authentication flow live
 * here — specs never touch raw locators.
 */
export class OrangeHrmLoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorAlert: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.locator('.oxd-alert-content--error');
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.heading = page.getByRole('heading', { name: 'Login' });
  }

  async open(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}${orangeHrm.paths.login}`);
    await this.expectVisible(this.heading);
  }

  async login(username: string, password: string): Promise<void> {
    if (username !== '') {
      await this.usernameInput.fill(username);
    }
    if (password !== '') {
      await this.passwordInput.fill(password);
    }
    await this.loginButton.click();
  }

  /**
   * Convenience helper for tests that only need a logged-in session. Logs in
   * and waits for the dashboard URL to appear, surfacing a clear timeout if
   * the demo site is slow or returns an unexpected page.
   */
  async loginExpectingDashboard(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.page.waitForURL(/\/dashboard\/index/, { timeout: 45_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginByEnterKey(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /** Returns the trimmed text of the requested field's validation message. */
  async fieldValidationMessage(field: 'username' | 'password'): Promise<string> {
    const input = field === 'username' ? this.usernameInput : this.passwordInput;
    const message = input
      .locator('xpath=ancestor::div[contains(@class,"oxd-input-group")]')
      .locator('.oxd-input-field-error-message');
    return (await message.textContent())?.trim() ?? '';
  }

  /** Returns the password field's `type` attribute — used to assert masking. */
  async passwordInputType(): Promise<string> {
    return (await this.passwordInput.getAttribute('type')) ?? '';
  }

  /** Type into the password field (without submitting) — used by masking tests. */
  async typePassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Type into the username field (without submitting). */
  async typeUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Click Login without filling anything. */
  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async usernameInputValue(): Promise<string> {
    return this.usernameInput.inputValue();
  }

  async passwordInputValue(): Promise<string> {
    return this.passwordInput.inputValue();
  }

  /** Returns the maxlength attribute on the username input (if any). */
  async usernameMaxLength(): Promise<string | null> {
    return this.usernameInput.getAttribute('maxlength');
  }

  errorAlertLocator(): Locator {
    return this.errorAlert;
  }

  loginButtonLocator(): Locator {
    return this.loginButton;
  }
}
