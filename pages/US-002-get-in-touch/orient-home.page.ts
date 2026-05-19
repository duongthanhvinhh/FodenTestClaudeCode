import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class OrientHomePage extends BasePage {
  private readonly getInTouchLink: Locator;

  constructor(page: Page) {
    super(page);
    this.getInTouchLink = page.getByRole('link', { name: /^Get in touch$/i }).first();
  }

  async open(): Promise<void> {
    await this.page.goto('https://www.orientsoftware.com/', {
      waitUntil: 'domcontentloaded',
    });
  }

  async goToContact(): Promise<void> {
    await this.getInTouchLink.click();
  }
}
