import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — every page object extends this.
 * Holds shared navigation, waits, and assertion helpers so individual
 * page objects stay focused on their own locators and actions.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Absolute or relative path; relative uses baseURL from playwright.config.ts. */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async url(): Promise<string> {
    return this.page.url();
  }

  protected async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  protected async expectText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toHaveText(text);
  }
}
