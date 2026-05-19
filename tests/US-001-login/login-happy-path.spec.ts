import { test, expect } from '@fixtures/test-fixtures';
import { users } from '@data/test-data';

test.describe('US-001 Login — happy path', () => {
  test('TC-001: Login with valid standard user', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.headingLocator()).toBeVisible();
    await expect(inventoryPage.headingLocator()).toHaveText('Products');
    await expect(page).toHaveTitle(/Swag Labs/);
  });
});
