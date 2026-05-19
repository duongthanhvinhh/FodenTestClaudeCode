import { test, expect } from '@fixtures/test-fixtures';
import { users } from '@data/test-data';

test.describe('US-001 Login — required-field validation', () => {
  test('TC-004: Missing username shows required-field error', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login('', users.standard.password);

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBannerLocator()).toHaveText(
      'Epic sadface: Username is required',
    );
  });

  test('TC-005: Missing password shows required-field error', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, '');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBannerLocator()).toHaveText(
      'Epic sadface: Password is required',
    );
  });
});
