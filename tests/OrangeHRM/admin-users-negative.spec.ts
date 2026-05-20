import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm } from '@data/orangehrm-data';

test.describe('OrangeHRM Admin > User Management — negative paths', () => {
  test.beforeEach(async ({ orangeHrmLoginPage }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginExpectingDashboard(
      orangeHrm.admin.username,
      orangeHrm.admin.password,
    );
  });

  test('ADMIN-014: Add User form rejects empty mandatory fields', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.submitEmpty();

    const messages = await orangeHrmAddUserPage.allValidationMessages();
    expect(messages.length).toBeGreaterThanOrEqual(4);
    // The required fields (User Role, Employee Name, Username, Password) must
    // each surface a "Required" validation.
    for (const label of ['User Role', 'Employee Name', 'Username', 'Password']) {
      expect(await orangeHrmAddUserPage.validationMessageFor(label)).toContain(
        orangeHrm.messages.required,
      );
    }
  });

  test('ADMIN-016: Password and Confirm Password mismatch shows validation error', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss2',
    });
    await orangeHrmAddUserPage.save();

    expect(await orangeHrmAddUserPage.validationMessageFor('Confirm Password')).toBe(
      orangeHrm.messages.passwordsDoNotMatch,
    );
  });

  test('ADMIN-019: Search with non-existent username returns no records', async ({
    orangeHrmAdminUsersPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.searchByUsername(`zzz_no_such_user_${Date.now()}`);

    await expect(orangeHrmAdminUsersPage.noRecordsLocator()).toBeVisible();
    expect(await orangeHrmAdminUsersPage.rowCount()).toBe(0);
  });

  test('ADMIN-021: ESS-protected check — unauthenticated direct nav to Admin redirects to login', async ({
    page,
    orangeHrmDashboardPage,
    orangeHrmAdminUsersPage,
  }) => {
    // First clear session by logging out, then try to hit the Admin URL.
    await orangeHrmDashboardPage.logout();
    await expect(page).toHaveURL(/\/auth\/login/);

    await orangeHrmAdminUsersPage.tryOpen();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('ADMIN-015: Add User with duplicate username surfaces "Already exists"', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: orangeHrm.admin.username,
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    expect(await orangeHrmAddUserPage.usernameValidationMessage()).toContain(
      orangeHrm.messages.alreadyExists,
    );
  });

  test('ADMIN-017: Add User with weak password is rejected', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: 'qa_weakpw',
      password: '123',
      confirmPassword: '123',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    expect(await orangeHrmAddUserPage.passwordValidationMessage()).toMatch(
      /at least|stronger|invalid|character/i,
    );
  });

  test('ADMIN-018: Employee Name not in autocomplete suggestions is rejected', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
  }) => {
    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      employeeName: 'NotARealEmployee_xyz',
      username: 'qa_noemp',
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.save();

    expect(await orangeHrmAddUserPage.employeeNameValidationMessage()).toContain(
      orangeHrm.messages.invalid,
    );
  });

  test('ADMIN-022: XSS payload in Username is stored safely or rejected — no script execution', async ({
    orangeHrmAdminUsersPage,
    orangeHrmAddUserPage,
    page,
  }) => {
    let dialogTriggered = false;
    page.on('dialog', async (d) => {
      dialogTriggered = true;
      await d.dismiss();
    });

    await orangeHrmAdminUsersPage.open();
    await orangeHrmAdminUsersPage.clickAdd();
    await orangeHrmAddUserPage.waitUntilReady();

    await orangeHrmAddUserPage.fillForm({
      userRole: 'ESS',
      status: 'Enabled',
      username: '<script>alert(1)</script>',
      password: 'StrongP@ss1',
      confirmPassword: 'StrongP@ss1',
    });
    await orangeHrmAddUserPage.pickFirstEmployeeSuggestion(orangeHrm.employeePickerPrefix);
    await orangeHrmAddUserPage.save();

    // The page may either reject the value with a validation error (no
    // navigation) or accept and persist it as escaped text. In either case
    // no alert/dialog must fire.
    expect(dialogTriggered).toBe(false);

    // If the form persisted, clean up by deleting the user we just created.
    if (/\/viewSystemUsers/.test(page.url())) {
      await orangeHrmAdminUsersPage.openDeleteConfirmFor('<script>alert(1)</script>');
      await orangeHrmAdminUsersPage.confirmDelete();
    }
  });
});
