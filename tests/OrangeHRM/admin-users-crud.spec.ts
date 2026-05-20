import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm, uniqueUsername } from '@data/orangehrm-data';

/**
 * CRUD specs for OrangeHRM Admin > User Management.
 *
 * These tests mutate the shared public demo site. To stay polite to other
 * testers we:
 *   - generate unique per-run usernames (timestamp + random suffix);
 *   - always delete the users we create in an `afterEach` cleanup, even on
 *     failure, so the demo seed data is left untouched.
 */

/** Best-effort cleanup — search for a username and delete it if present. */
async function safeDelete(
  adminUsersPage: import('@pages/OrangeHRM/admin-users.page').OrangeHrmAdminUsersPage,
  username: string,
): Promise<void> {
  try {
    await adminUsersPage.open();
    await adminUsersPage.searchByUsername(username);
    if ((await adminUsersPage.rowCount()) > 0) {
      await adminUsersPage.openDeleteConfirmFor(username);
      await adminUsersPage.confirmDelete();
    }
  } catch {
    /* cleanup is best-effort */
  }
}

test.describe.serial('OrangeHRM Admin > User Management — CRUD workflow', () => {
  const createdUsername = uniqueUsername('qa_crud');
  const createdPassword = 'StrongP@ss1';

  test.beforeEach(async ({ orangeHrmLoginPage }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginExpectingDashboard(
      orangeHrm.admin.username,
      orangeHrm.admin.password,
    );
  });

  test.afterAll(async ({ browser }) => {
    // One last sweep to make sure we leave the demo as we found it.
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      const { OrangeHrmLoginPage } = await import('@pages/OrangeHRM/login.page');
      const { OrangeHrmAdminUsersPage } = await import('@pages/OrangeHRM/admin-users.page');
      const loginPage = new OrangeHrmLoginPage(page);
      const adminUsersPage = new OrangeHrmAdminUsersPage(page);
      await loginPage.open();
      await loginPage.loginExpectingDashboard(orangeHrm.admin.username, orangeHrm.admin.password);
      await safeDelete(adminUsersPage, createdUsername);
    } finally {
      await context.close();
    }
  });

  test('ADMIN-007: Add a new System User successfully', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: createdUsername,
      password: createdPassword,
      confirmPassword: createdPassword,
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
    await orangeHrmAdminUsersPage.searchByUsername(createdUsername);
    expect(await orangeHrmAdminUsersPage.rowCount()).toBe(1);
    const row = await orangeHrmAdminUsersPage.rowDataFor(createdUsername);
    expect(row?.username).toBe(createdUsername);
    expect(row?.status).toBe('Enabled');
  });

  test('ADMIN-008: Edit an existing user\'s status to Disabled', async ({
    orangeHrmAdminUsersPage,
    orangeHrmEditUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(createdUsername);
    await orangeHrmAdminUsersPage.clickEditFor(createdUsername);
    await orangeHrmEditUserPage.waitUntilReady();

    await orangeHrmEditUserPage.setStatus('Disabled');
    await orangeHrmEditUserPage.save();

    await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
    await orangeHrmAdminUsersPage.searchByUsername(createdUsername);
    const row = await orangeHrmAdminUsersPage.rowDataFor(createdUsername);
    expect(row?.status).toBe('Disabled');
  });

  test('ADMIN-009: Delete the user via confirmation dialog', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(createdUsername);
    expect(await orangeHrmAdminUsersPage.rowCount()).toBe(1);

    await orangeHrmAdminUsersPage.openDeleteConfirmFor(createdUsername);
    await orangeHrmAdminUsersPage.confirmDelete();

    await orangeHrmAdminUsersPage.searchByUsername(createdUsername);
    expect(await orangeHrmAdminUsersPage.rowCount()).toBe(0);
  });
});

test.describe('OrangeHRM Admin > User Management — bulk delete', () => {
  const usernames = [uniqueUsername('qa_bulk1'), uniqueUsername('qa_bulk2')];

  test.beforeEach(async ({ orangeHrmLoginPage }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginExpectingDashboard(
      orangeHrm.admin.username,
      orangeHrm.admin.password,
    );
  });

  test.afterEach(async ({ orangeHrmAdminUsersPage }) => {
    for (const u of usernames) {
      await safeDelete(orangeHrmAdminUsersPage, u);
    }
  });

  test('ADMIN-010: Bulk-delete selected users', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    // Seed: create two disposable users for the bulk delete.
    for (const u of usernames) {
      await orangeHrmAdminUsersPage.open();
      await orangeHrmAdminUsersPage.clickAdd();
      await orangeHrmAddUserPage.waitUntilReady();
      await orangeHrmAddUserPage.fillForm({
        userRole: 'ESS',
        status: 'Enabled',
        username: u,
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });
      await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
      await orangeHrmAddUserPage.save();
      await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
    }

    // Search by the shared "qa_bulk" prefix so both rows appear in the
    // same view; tick each, then bulk-delete.
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername('qa_bulk');
    for (const u of usernames) {
      await orangeHrmAdminUsersPage.selectRowCheckbox(u);
    }
    await orangeHrmAdminUsersPage.clickDeleteSelected();
    await orangeHrmAdminUsersPage.confirmDelete();

    // Both users are gone.
    for (const u of usernames) {
      await orangeHrmAdminUsersPage.searchByUsername(u);
      expect(await orangeHrmAdminUsersPage.rowCount()).toBe(0);
    }
  });
});

test.describe('OrangeHRM Admin > User Management — create-flow boundaries', () => {
  const created: string[] = [];

  test.beforeEach(async ({ orangeHrmLoginPage }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginExpectingDashboard(
      orangeHrm.admin.username,
      orangeHrm.admin.password,
    );
  });

  test.afterEach(async ({ orangeHrmAdminUsersPage }) => {
    while (created.length > 0) {
      const u = created.pop()!;
      await safeDelete(orangeHrmAdminUsersPage, u);
    }
  });

  test('ADMIN-025: Username at the 40-char boundary is accepted', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    const username = ('a' + uniqueUsername('qa_max')).slice(0, 40);
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username,
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
    await orangeHrmAdminUsersPage.searchByUsername(username);
    expect(await orangeHrmAdminUsersPage.rowCount()).toBe(1);
    created.push(username);
  });

  test('ADMIN-026: Username with leading/trailing whitespace is trimmed on save', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    const baseName = uniqueUsername('qa_trim');
    const padded = `  ${baseName}  `;
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: padded,
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
    await orangeHrmAdminUsersPage.searchByUsername(baseName);
    const row = await orangeHrmAdminUsersPage.rowDataFor(baseName);
    expect(row?.username).toBe(baseName);
    created.push(baseName);
  });

  test('ADMIN-027: Username case-sensitivity on duplicates is consistent', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    // The OrangeHRM Admin user already exists as "Admin"; attempt to create
    // a duplicate with case-changed casing and assert the system responds
    // consistently — either rejected as a duplicate, or created as a new user
    // (which we then clean up).
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    const candidate = orangeHrm.admin.username.toLowerCase();
    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: candidate,
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    const usernameError = await orangeHrmAddUserPage.usernameValidationMessage();
    if (usernameError) {
      expect(usernameError).toContain(orangeHrm.messages.alreadyExists);
    } else {
      // Created as a new user — record for cleanup.
      await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
      created.push(candidate);
    }
  });

  test('ADMIN-028: Username with Unicode characters is either accepted or cleanly rejected', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    const username = `测试_${uniqueUsername('qa')}`;
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username,
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    const usernameError = await orangeHrmAddUserPage.usernameValidationMessage();
    if (usernameError) {
      // Rejected with a clear validation message — acceptable.
      expect(usernameError.length).toBeGreaterThan(0);
    } else {
      // Accepted and saved — verify it appears correctly in the list, then clean up.
      await orangeHrmAdminUsersPage.headingLocator().waitFor({ state: 'visible' });
      await orangeHrmAdminUsersPage.searchByUsername(username);
      expect(await orangeHrmAdminUsersPage.rowCount()).toBe(1);
      created.push(username);
    }
  });
});
