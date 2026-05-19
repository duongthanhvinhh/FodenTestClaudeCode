import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorBanner = page.locator('[data-test="error"]');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    if (username) {
      await this.usernameInput.fill(username);
    }
    if (password) {
      await this.passwordInput.fill(password);
    }
    await this.loginButton.click();
  }

  async errorMessage(): Promise<string> {
    return (await this.errorBanner.textContent()) ?? '';
  }

  errorBannerLocator(): Locator {
    return this.errorBanner;
  }
}
