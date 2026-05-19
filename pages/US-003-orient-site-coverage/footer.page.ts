import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class OrientFooterPage extends BasePage {
  private readonly footer: Locator;
  private readonly backToTop: Locator;
  private readonly salesMail: Locator;
  private readonly termsLink: Locator;
  private readonly privacyLink: Locator;

  constructor(page: Page) {
    super(page);
    this.footer = page.locator('footer.osd-footer, footer').first();
    this.backToTop = page.locator('a', { hasText: /back to top/i }).first();
    this.salesMail = page.locator('a[href^="mailto:sales@orientsoftware.com"]').first();
    this.termsLink = this.footer.locator('a', { hasText: /terms of use/i }).first();
    this.privacyLink = this.footer.locator('a', { hasText: /privacy/i }).first();
  }

  async expectColumnHeadings(): Promise<void> {
    for (const heading of ['Company', 'Our Services', 'Our Expertise', 'Technologies', 'Resources', 'Contact Us']) {
      const re = new RegExp('^' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
      await expect(
        this.footer.locator('h1,h2,h3,h4,h5,h6', { hasText: re }).first(),
        `Footer heading missing: "${heading}"`,
      ).toBeVisible();
    }
  }

  async expectSalesEmail(): Promise<void> {
    await expect(this.salesMail).toHaveAttribute('href', 'mailto:sales@orientsoftware.com');
  }

  async openTerms(): Promise<void> {
    await this.termsLink.scrollIntoViewIfNeeded();
    await this.termsLink.click();
  }

  async openPrivacy(): Promise<void> {
    await this.privacyLink.scrollIntoViewIfNeeded();
    await this.privacyLink.click();
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async clickBackToTop(): Promise<void> {
    await this.backToTop.scrollIntoViewIfNeeded();
    await this.backToTop.click();
  }

  async currentScrollY(): Promise<number> {
    return this.page.evaluate(() => window.scrollY);
  }
}
