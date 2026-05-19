import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { CONTACT_OFFICES, ORIENT_BASE_URL } from '@data/orient-catalog';

/**
 * Contact page. Two field groups render in the DOM — a visible in-page
 * group (IDs prefixed `con-`) and a slide-out modal (IDs `text-*`).
 * This object targets the in-page group. The fields are NOT wrapped in
 * a <form>; the visible "Send" button is `#btnsend` and validation is
 * driven by JavaScript that injects `<div class="error-message">`
 * messages next to invalid fields and a banner at the top of the form.
 *
 * Tests MUST NOT actually submit data to production. The contact spec
 * installs a network guard to abort any POST.
 */
export class OrientContactPage extends BasePage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly companyInput: Locator;
  private readonly websiteInput: Locator;
  private readonly messageInput: Locator;
  private readonly sendButton: Locator;
  private readonly errorMessages: Locator;
  private readonly topErrorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#con-txtname');
    this.emailInput = page.locator('#con-txtemail');
    this.companyInput = page.locator('#con-txtcompany');
    this.websiteInput = page.locator('#con-txtwebsite');
    this.messageInput = page.locator('#con-txtmessage');
    this.sendButton = page.locator('#btnsend');
    this.errorMessages = page.locator('.error-message');
    this.topErrorBanner = page.locator('.error-message.--top, .error-message[class*="top"]');
  }

  async open(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/contact/', { waitUntil: 'domcontentloaded' });
  }

  async expectRequiredFieldsVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();
  }

  async expectOfficeHeadingsVisible(): Promise<void> {
    for (const office of CONTACT_OFFICES) {
      const re = new RegExp(office.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      await expect(
        this.page.getByRole('heading', { name: re }).first(),
        `Office heading missing on /contact/: "${office}"`,
      ).toBeVisible();
    }
  }

  async fillForm(data: { name?: string; email?: string; company?: string; website?: string; message?: string }): Promise<void> {
    if (data.name !== undefined) await this.nameInput.fill(data.name);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.company !== undefined) await this.companyInput.fill(data.company);
    if (data.website !== undefined) await this.websiteInput.fill(data.website);
    if (data.message !== undefined) await this.messageInput.fill(data.message);
  }

  async clickSend(): Promise<void> {
    await this.sendButton.scrollIntoViewIfNeeded();
    await this.sendButton.click();
  }

  async expectValidationErrorsShown(): Promise<void> {
    const visibleErrors = this.errorMessages.locator('visible=true');
    await expect(visibleErrors.first()).toBeVisible({ timeout: 5_000 });
  }

  async expectTopErrorBannerShown(): Promise<void> {
    await expect(this.topErrorBanner.first()).toBeVisible({ timeout: 5_000 });
  }

  async expectEmailFieldError(): Promise<void> {
    // The error message lives in the email field's row. Match the
    // sibling .error-message next to #con-txtemail.
    const emailGroupError = this.page
      .locator('.error-message')
      .filter({ hasText: /required|valid|email/i })
      .first();
    await expect(emailGroupError).toBeVisible({ timeout: 5_000 });
  }

  nameLocator(): Locator { return this.nameInput; }
  emailLocator(): Locator { return this.emailInput; }
  messageLocator(): Locator { return this.messageInput; }
  sendLocator(): Locator { return this.sendButton; }
}
