import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * OrangeHRM Dashboard page object.
 *
 * Used by specs to verify a successful login (heading + sidebar visible)
 * and to perform the Logout flow from the top-right user dropdown.
 */
export class OrangeHrmDashboardPage extends BasePage {
  private readonly header: Locator;
  private readonly sidepanel: Locator;
  private readonly userDropdownToggle: Locator;
  private readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', { name: 'Dashboard' });
    this.sidepanel = page.getByRole('navigation', { name: 'Sidepanel' });
    this.userDropdownToggle = page.locator('.oxd-userdropdown-tab');
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
  }

  async open(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}${orangeHrm.paths.dashboard}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout(): Promise<void> {
    await this.userDropdownToggle.click();
    await this.logoutMenuItem.click();
  }

  headerLocator(): Locator {
    return this.header;
  }

  sidepanelLocator(): Locator {
    return this.sidepanel;
  }
}
