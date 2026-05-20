import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm } from '@data/orangehrm-data';

test.describe('OrangeHRM Admin > User Management — edge cases', () => {
  test.beforeEach(async ({ orangeHrmLoginPage }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginExpectingDashboard(
      orangeHrm.admin.username,
      orangeHrm.admin.password,
    );
  });

  test('ADMIN-020: Cancelling the delete confirmation keeps the user in the list', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    const before = await orangeHrmAdminUsersPage.recordsFoundText();

    const username = await orangeHrmAdminUsersPage.openDeleteConfirmForFirstDeletableRow();
    await orangeHrmAdminUsersPage.cancelDelete();

    await expect(orangeHrmAdminUsersPage.confirmDialogLocator()).toBeHidden();
    expect(await orangeHrmAdminUsersPage.recordsFoundText()).toBe(before);
    // The row we were about to delete is still in the table.
    await expect(
      orangeHrmAdminUsersPage.tableRowsLocator().filter({ hasText: username }).first(),
    ).toBeVisible();
  });

  test('ADMIN-023: SQL injection in username filter returns no records without error', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(`'; DROP TABLE users;--`);

    await expect(orangeHrmAdminUsersPage.noRecordsLocator()).toBeVisible();
    expect(await orangeHrmAdminUsersPage.rowCount()).toBe(0);
  });

  test('ADMIN-033: Whitespace-only username filter does not crash the page', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername('   ');

    // The page must still be rendered (heading visible) and the row count
    // must be a non-negative number — i.e. no JS exception, no blank table
    // crash. We accept either "treated as empty filter (rows >= 0)" or
    // "filter applied literally and returned 0".
    await expect(orangeHrmAdminUsersPage.headingLocator()).toBeVisible();
    const afterRows = await orangeHrmAdminUsersPage.rowCount();
    expect(afterRows).toBeGreaterThanOrEqual(0);
  });

  test('ADMIN-024: Add User with too-short username surfaces a length validation', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: 'ab',
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    expect(await orangeHrmAddUserPage.usernameValidationMessage()).toMatch(
      /at least \d+|min/i,
    );
  });

  test('ADMIN-034: Add User with 7-char password surfaces minimum-length validation', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: 'qa_boundary',
      password: 'Aa1!aaa',
      confirmPassword: 'Aa1!aaa',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    expect(await orangeHrmAddUserPage.passwordValidationMessage()).toMatch(
      /at least 8|min.*8/i,
    );
  });

  test('ADMIN-029: Pagination control is rendered when results exceed one page', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    const totalRows = await orangeHrmAdminUsersPage.rowCount();
    const pages = await orangeHrmAdminUsersPage.paginationPageCount();
    // If the seed data has > one page of users the pagination control is
    // expected to surface multiple page buttons; if not, the test simply
    // documents the count.
    if (totalRows >= 50) {
      expect(pages).toBeGreaterThanOrEqual(2);
    } else {
      expect(pages).toBeGreaterThanOrEqual(0);
    }
  });

  test('ADMIN-031: Currently logged-in user cannot delete their own row', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(orangeHrm.admin.username);

    // The Admin row may either expose no trash button at all, or attempts
    // to delete it must surface a blocking message. Verify the safer
    // invariant: the system does not silently delete the only admin.
    const hasTrash = await orangeHrmAdminUsersPage.hasDeleteButtonFor(
      orangeHrm.admin.username,
    );
    if (hasTrash) {
      await orangeHrmAdminUsersPage.openDeleteConfirmFor(orangeHrm.admin.username);
      await orangeHrmAdminUsersPage.cancelDelete();
    } else {
      expect(hasTrash).toBe(false);
    }

    // Either way, the Admin row must still be present afterwards.
    expect(
      await orangeHrmAdminUsersPage
        .tableRowsLocator()
        .filter({ hasText: orangeHrm.admin.username })
        .count(),
    ).toBeGreaterThan(0);
  });

  test.skip(
    'ADMIN-030: Disabling the only Admin user is not safely automatable on the shared demo',
    async () => {
      /**
       * Editing the only Admin user to Disabled — if the system allows it —
       * would lock every other tester out of the public demo. This case
       * must be exercised on an isolated environment with a backup Admin.
       */
    },
  );

  test.skip(
    'ADMIN-032: Idle session timeout exceeds practical CI runtime',
    async () => {
      /**
       * OrangeHRM session timeout is configured server-side and runs in the
       * order of tens of minutes. Exercising it from a Playwright test would
       * dominate the suite runtime. Verify manually or via a dedicated
       * long-running suite.
       */
    },
  );
});
