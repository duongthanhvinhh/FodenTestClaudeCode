import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm } from '@data/orangehrm-data';

test.describe('OrangeHRM Login — negative paths', () => {
  test('LOGIN-006: Invalid username with valid password is rejected', async ({
    orangeHrmLoginPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.invalid.username, orangeHrm.admin.password);

    await expect(orangeHrmLoginPage.errorAlertLocator()).toBeVisible();
    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('LOGIN-007: Valid username with invalid password is rejected', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.admin.username, orangeHrm.invalid.password);

    await expect(orangeHrmLoginPage.errorAlertLocator()).toBeVisible();
    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  test('LOGIN-008: Empty username and empty password show Required errors', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login('', '');

    expect(await orangeHrmLoginPage.fieldValidationMessage('username')).toBe(
      orangeHrm.messages.required,
    );
    expect(await orangeHrmLoginPage.fieldValidationMessage('password')).toBe(
      orangeHrm.messages.required,
    );
  });

  test('LOGIN-009: Empty username only shows Required error on username', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login('', orangeHrm.admin.password);

    expect(await orangeHrmLoginPage.fieldValidationMessage('username')).toBe(
      orangeHrm.messages.required,
    );
  });

  test('LOGIN-010: Empty password only shows Required error on password', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.admin.username, '');

    expect(await orangeHrmLoginPage.fieldValidationMessage('password')).toBe(
      orangeHrm.messages.required,
    );
  });

  test('LOGIN-011: Password is case-sensitive', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(
      orangeHrm.admin.username,
      orangeHrm.admin.password.toUpperCase(),
    );

    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  test('LOGIN-013: Unauthenticated access to protected route redirects to login', async ({
    orangeHrmAdminUsersPage,
    page,
  }) => {
    await orangeHrmAdminUsersPage.tryOpen();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test.skip(
    'LOGIN-012: Login attempt with disabled user account shows generic error',
    async () => {
      /**
       * Requires a seeded user with Status = Disabled. The public demo does
       * not expose such an account with stable credentials, and creating
       * one would mutate the shared demo. Verify manually.
       */
    },
  );
});
