import { test, expect } from '@fixtures/test-fixtures';
import { users } from '@data/test-data';

test.describe('US-001 Login — negative paths', () => {
  test('TC-002: Login with invalid credentials shows error', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login(users.invalid.username, users.invalid.password);

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBannerLocator()).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
  });

  test('TC-003: Login with locked-out user shows lockout error', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login(users.locked.username, users.locked.password);

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBannerLocator()).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.',
    );
  });
});
