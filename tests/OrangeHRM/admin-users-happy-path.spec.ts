import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm } from '@data/orangehrm-data';

/**
 * These specs share an authenticated state. The OrangeHRM demo is a
 * shared site, so we keep the suite read-only (search / filter / reset)
 * and avoid create/update/delete operations that would mutate shared
 * data and break other testers.
 */
test.describe('OrangeHRM Admin > User Management — happy path', () => {
  test.beforeEach(async ({ orangeHrmLoginPage }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginExpectingDashboard(
      orangeHrm.admin.username,
      orangeHrm.admin.password,
    );
  });

  test('ADMIN-001: Open Admin > System Users and see the list', async ({
    orangeHrmAdminUsersPage,
    page,
  }) => {
    await orangeHrmAdminUsersPage.open();

    await expect(page).toHaveURL(new RegExp(`${orangeHrm.paths.adminUsers}$`));
    await expect(orangeHrmAdminUsersPage.headingLocator()).toBeVisible();
    expect(await orangeHrmAdminUsersPage.recordsFoundText()).toMatch(/\(\d+\)\s+Records?\s+Found/);
    expect(await orangeHrmAdminUsersPage.rowCount()).toBeGreaterThan(0);
  });

  test('ADMIN-002: Search by exact username returns matching row', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(orangeHrm.admin.username);

    expect(await orangeHrmAdminUsersPage.recordsFoundText()).toMatch(/\(1\)\s+Record\s+Found/);
    await expect(orangeHrmAdminUsersPage.tableRowsLocator().first()).toContainText(
      orangeHrm.admin.username,
    );
  });

  test('ADMIN-003: Filter by User Role = Admin returns only Admin users', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.selectUserRole('Admin');
    await orangeHrmAdminUsersPage.clickSearch();

    const rows = orangeHrmAdminUsersPage.tableRowsLocator();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Admin');
    }
  });

  test('ADMIN-004: Filter by Status = Enabled returns only Enabled users', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.selectStatus('Enabled');
    await orangeHrmAdminUsersPage.clickSearch();

    const rows = orangeHrmAdminUsersPage.tableRowsLocator();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Enabled');
    }
  });

  test('ADMIN-006: Reset clears all populated search filters', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(orangeHrm.admin.username);
    expect(await orangeHrmAdminUsersPage.usernameFilterValue()).toBe(orangeHrm.admin.username);

    await orangeHrmAdminUsersPage.clickReset();

    expect(await orangeHrmAdminUsersPage.usernameFilterValue()).toBe('');
    expect(await orangeHrmAdminUsersPage.userRoleSelectedValue()).toMatch(/-- Select --/);
    expect(await orangeHrmAdminUsersPage.statusSelectedValue()).toMatch(/-- Select --/);
  });

  test('ADMIN-005: Search by Employee Name with autocomplete', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    const chosenName = await orangeHrmAdminUsersPage.pickEmployeeFromAutocomplete(
      orangeHrm.employeePickerPrefix,
    );
    await orangeHrmAdminUsersPage.clickSearch();

    const rows = orangeHrmAdminUsersPage.tableRowsLocator();
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i++) {
      await expect(rows.nth(i)).toContainText(chosenName);
    }
  });

  test('ADMIN-011: Navigate to Admin > Job > Job Titles', async ({
    orangeHrmJobTitlesPage,
    page,
  }) => {
    await orangeHrmJobTitlesPage.open();

    await expect(page).toHaveURL(/\/admin\/viewJobTitleList/);
    await expect(orangeHrmJobTitlesPage.headingLocator()).toBeVisible();
    await expect(orangeHrmJobTitlesPage.addButtonLocator()).toBeVisible();
  });

  test('ADMIN-012: Navigate to Admin > Organization > General Information', async ({
    orangeHrmOrgGeneralPage,
    page,
  }) => {
    await orangeHrmOrgGeneralPage.open();

    await expect(page).toHaveURL(/\/admin\/viewOrganizationGeneralInformation/);
    await expect(orangeHrmOrgGeneralPage.headingLocator()).toBeVisible();
    await expect(orangeHrmOrgGeneralPage.organizationNameLocator()).toBeVisible();
  });

  test('ADMIN-013: Navigate to Admin > Nationalities and verify list', async ({
    orangeHrmNationalitiesPage,
    page,
  }) => {
    await orangeHrmNationalitiesPage.open();

    await expect(page).toHaveURL(/\/admin\/nationality/);
    await expect(orangeHrmNationalitiesPage.headingLocator()).toBeVisible();
    await expect(orangeHrmNationalitiesPage.addButtonLocator()).toBeVisible();
    expect(await orangeHrmNationalitiesPage.rowCount()).toBeGreaterThanOrEqual(0);
  });
});
