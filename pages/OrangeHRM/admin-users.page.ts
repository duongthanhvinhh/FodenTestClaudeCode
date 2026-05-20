import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * OrangeHRM Admin > User Management (System Users) page object.
 *
 * Wraps the search filters, results table, and the "Add" entry point so
 * specs can drive the page through intent-revealing methods.
 */
export class OrangeHrmAdminUsersPage extends BasePage {
  private readonly heading: Locator;
  private readonly usernameFilter: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly employeeNameInput: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly addButton: Locator;
  private readonly recordsCount: Locator;
  private readonly tableRows: Locator;
  private readonly noRecordsBanner: Locator;
  private readonly confirmDialog: Locator;
  private readonly cancelDeleteButton: Locator;
  private readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'System Users' });
    // Filter section — labels are rendered as <label> siblings of the inputs.
    const filterCard = page.locator('.orangehrm-background-container');
    this.usernameFilter = filterCard
      .locator('.oxd-input-group', { hasText: 'Username' })
      .locator('input.oxd-input')
      .first();
    this.userRoleDropdown = filterCard
      .locator('.oxd-input-group', { hasText: 'User Role' })
      .locator('.oxd-select-text')
      .first();
    this.statusDropdown = filterCard
      .locator('.oxd-input-group', { hasText: 'Status' })
      .locator('.oxd-select-text')
      .first();
    this.employeeNameInput = filterCard
      .locator('.oxd-input-group', { hasText: 'Employee Name' })
      .locator('input')
      .first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.recordsCount = page.locator('.orangehrm-horizontal-padding span');
    this.tableRows = page.locator('.oxd-table-body .oxd-table-card');
    // The OrangeHRM page renders a toast with the same text on certain searches,
    // so the empty-state span must be scoped to the results container.
    this.noRecordsBanner = page
      .locator('.orangehrm-paper-container')
      .getByText('No Records Found', { exact: true });
    this.confirmDialog = page.locator('.orangehrm-dialog-popup');
    this.cancelDeleteButton = this.confirmDialog.getByRole('button', { name: 'No, Cancel' });
    this.confirmDeleteButton = this.confirmDialog.getByRole('button', {
      name: 'Yes, Delete',
    });
  }

  async open(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}${orangeHrm.paths.adminUsers}`);
    await this.heading.waitFor({ state: 'visible', timeout: 30_000 });
    await this.waitForResultsReady();
  }

  /**
   * Attempt to navigate to System Users without asserting the page rendered —
   * used by negative tests that expect a redirect (e.g. unauthenticated).
   */
  async tryOpen(): Promise<void> {
    await this.goto(`${orangeHrm.baseURL}${orangeHrm.paths.adminUsers}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Wait until the table rows or the "no records" banner is visible. */
  async waitForResultsReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await Promise.race([
      this.tableRows.first().waitFor({ state: 'visible', timeout: 30_000 }),
      this.noRecordsBanner.waitFor({ state: 'visible', timeout: 30_000 }),
    ]).catch(() => {
      /* swallow — assertions in specs will surface a clearer failure */
    });
  }

  async searchByUsername(username: string): Promise<void> {
    await this.usernameFilter.fill(username);
    await this.clickSearch();
  }

  async selectUserRole(role: string): Promise<void> {
    await this.userRoleDropdown.click();
    await this.page
      .locator('.oxd-select-dropdown')
      .getByRole('option', { name: role, exact: true })
      .click();
  }

  async selectStatus(status: string): Promise<void> {
    await this.statusDropdown.click();
    await this.page
      .locator('.oxd-select-dropdown')
      .getByRole('option', { name: status, exact: true })
      .click();
  }

  async fillEmployeeName(text: string): Promise<void> {
    await this.employeeNameInput.fill(text);
  }

  /**
   * Fill the Employee Name filter with `prefix`, wait for the autocomplete
   * dropdown to settle (past the "Searching...." placeholder), then click
   * the first real suggestion. Returns the chosen employee's display name.
   */
  async pickEmployeeFromAutocomplete(prefix: string): Promise<string> {
    await this.employeeNameInput.fill(prefix);
    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 10_000 });
    // Wait until the "Searching...." placeholder disappears.
    await dropdown.getByText('Searching').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    const firstOption = dropdown.locator('div[role="option"]').first();
    await firstOption.waitFor({ state: 'visible', timeout: 15_000 });
    const text = ((await firstOption.textContent()) ?? '').trim();
    await firstOption.click();
    return text;
  }

  async clickSearch(): Promise<void> {
    await this.searchButton.click();
    // The table re-renders behind a loader; wait until results settle.
    await this.page
      .locator('.oxd-loading-spinner')
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => {});
    await this.waitForResultsReady();
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click();
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
  }

  async rowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async recordsFoundText(): Promise<string> {
    return (await this.recordsCount.first().textContent())?.trim() ?? '';
  }

  /** Open the delete-confirmation dialog for a specific username. */
  async openDeleteConfirmFor(username: string): Promise<void> {
    const row = this.tableRows.filter({ hasText: username }).first();
    const trash = row.locator('button:has(i.bi-trash)').first();
    await trash.waitFor({ state: 'visible', timeout: 15_000 });
    await trash.click();
    await expect(this.confirmDialog).toBeVisible({ timeout: 15_000 });
  }

  /** Click the pencil (edit) icon for a row matching `username`. */
  async clickEditFor(username: string): Promise<void> {
    const row = this.tableRows.filter({ hasText: username }).first();
    await row.locator('button:has(i.bi-pencil-fill)').click();
  }

  /**
   * Open the delete-confirmation dialog for the first row that exposes a
   * delete (trash) button — used by tests that just need to verify the
   * Cancel branch without depending on a specific seeded user.
   */
  async openDeleteConfirmForFirstDeletableRow(): Promise<string> {
    const trashButtons = this.tableRows.locator('button:has(i.bi-trash)');
    await trashButtons.first().waitFor({ state: 'visible', timeout: 15_000 });
    const row = this.tableRows
      .filter({ has: this.page.locator('button:has(i.bi-trash)') })
      .first();
    const username = ((await row.locator('div').nth(1).textContent()) ?? '').trim();
    await row.locator('button:has(i.bi-trash)').first().click();
    await expect(this.confirmDialog).toBeVisible({ timeout: 15_000 });
    return username;
  }

  async cancelDelete(): Promise<void> {
    await this.cancelDeleteButton.click();
  }

  async confirmDelete(): Promise<void> {
    await this.confirmDeleteButton.click();
  }

  async usernameFilterValue(): Promise<string> {
    return this.usernameFilter.inputValue();
  }

  async userRoleSelectedValue(): Promise<string> {
    return (await this.userRoleDropdown.textContent())?.trim() ?? '';
  }

  async statusSelectedValue(): Promise<string> {
    return (await this.statusDropdown.textContent())?.trim() ?? '';
  }

  /** Get the [Username, Role, Employee, Status] cell values of a row by username. */
  async rowDataFor(username: string): Promise<{
    username: string;
    role: string;
    employee: string;
    status: string;
  } | null> {
    const row = this.tableRows.filter({ hasText: username }).first();
    if ((await row.count()) === 0) return null;
    const cells = row.locator('div[role="cell"], .oxd-table-cell');
    const texts = await cells.allInnerTexts();
    // Cells: [checkbox, username, role, employee, status, actions]
    return {
      username: (texts[1] ?? '').trim(),
      role: (texts[2] ?? '').trim(),
      employee: (texts[3] ?? '').trim(),
      status: (texts[4] ?? '').trim(),
    };
  }

  /** Tick the checkbox for a specific row (by username). */
  async selectRowCheckbox(username: string): Promise<void> {
    const row = this.tableRows.filter({ hasText: username }).first();
    await row.locator('.oxd-checkbox-input').first().click();
  }

  /** Click the Delete Selected button (visible after at least one row is ticked). */
  async clickDeleteSelected(): Promise<void> {
    await this.page.getByRole('button', { name: /Delete Selected/i }).click();
    await expect(this.confirmDialog).toBeVisible();
  }

  /** Returns true if a delete (trash) button is present in the named row. */
  async hasDeleteButtonFor(username: string): Promise<boolean> {
    const row = this.tableRows.filter({ hasText: username }).first();
    return (await row.locator('button:has(i.bi-trash)').count()) > 0;
  }

  /** Pagination — returns the number of pages currently advertised. */
  async paginationPageCount(): Promise<number> {
    const buttons = this.page.locator('.oxd-pagination__page-item button');
    return buttons.count();
  }

  headingLocator(): Locator {
    return this.heading;
  }

  noRecordsLocator(): Locator {
    return this.noRecordsBanner;
  }

  tableRowsLocator(): Locator {
    return this.tableRows;
  }

  confirmDialogLocator(): Locator {
    return this.confirmDialog;
  }
}
