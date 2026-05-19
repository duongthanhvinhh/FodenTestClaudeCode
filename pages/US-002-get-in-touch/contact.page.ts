import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class OrientContactPage extends BasePage {
  private readonly fullNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly companyInput: Locator;

  constructor(page: Page) {
    super(page);
    // The page renders two forms (visible main form + hidden modal form).
    // Target the visible one via its unique `con-*` IDs.
    this.fullNameInput = page.locator('#con-txtname');
    this.emailInput = page.locator('#con-txtemail');
    this.companyInput = page.locator('#con-txtcompany');
  }

  fullNameLocator(): Locator {
    return this.fullNameInput;
  }

  emailLocator(): Locator {
    return this.emailInput;
  }

  companyLocator(): Locator {
    return this.companyInput;
  }
}
