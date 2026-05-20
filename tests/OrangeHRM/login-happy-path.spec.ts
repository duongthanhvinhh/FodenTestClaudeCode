import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm } from '@data/orangehrm-data';

test.describe('OrangeHRM Login — happy path', () => {
  test('LOGIN-001: Login with valid Admin credentials', async ({
    orangeHrmLoginPage,
    orangeHrmDashboardPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.admin.username, orangeHrm.admin.password);

    await expect(page).toHaveURL(new RegExp(`${orangeHrm.paths.dashboard}$`));
    await expect(orangeHrmDashboardPage.headerLocator()).toBeVisible();
    await expect(orangeHrmDashboardPage.sidepanelLocator()).toBeVisible();
  });

  test('LOGIN-003: Session persists after page reload', async ({
    orangeHrmLoginPage,
    orangeHrmDashboardPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.admin.username, orangeHrm.admin.password);
    await expect(orangeHrmDashboardPage.headerLocator()).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(new RegExp(`${orangeHrm.paths.dashboard}$`));
    await expect(orangeHrmDashboardPage.headerLocator()).toBeVisible();
  });

  test('LOGIN-004: Logout terminates session and redirects to login', async ({
    orangeHrmLoginPage,
    orangeHrmDashboardPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.admin.username, orangeHrm.admin.password);
    await expect(orangeHrmDashboardPage.headerLocator()).toBeVisible();

    await orangeHrmDashboardPage.logout();
    await expect(page).toHaveURL(new RegExp(`${orangeHrm.paths.login}$`));

    // Direct navigation to a protected page must bounce back to login.
    await orangeHrmDashboardPage.open();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('LOGIN-005: Forgot Password link navigates to reset page', async ({
    orangeHrmLoginPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.clickForgotPassword();

    await expect(page).toHaveURL(new RegExp(`${orangeHrm.paths.forgotPassword}$`));
    await expect(page.getByRole('heading', { name: /Reset Password/i })).toBeVisible();
  });

  test.skip(
    'LOGIN-002: Login with valid ESS user credentials',
    async () => {
      /**
       * The public OrangeHRM demo does not expose a stable, public-known
       * ESS user with permanent credentials, and creating one would mutate
       * the shared demo. Manually verify with a provisioned ESS account.
       */
    },
  );
});
