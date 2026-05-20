import { test, expect } from '@fixtures/test-fixtures';
import { orangeHrm } from '@data/orangehrm-data';
import { OrangeHrmLoginPage } from '@pages/OrangeHRM/login.page';
import { OrangeHrmDashboardPage } from '@pages/OrangeHRM/dashboard.page';

test.describe('OrangeHRM Login — edge cases & security', () => {
  test('LOGIN-018: SQL injection in username is safely rejected', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(`' OR '1'='1`, 'anything');

    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  test('LOGIN-019: XSS payload in username is rendered as text, not executed', async ({
    orangeHrmLoginPage,
    page,
  }) => {
    let dialogTriggered = false;
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login('<script>alert(1)</script>', orangeHrm.admin.password);

    await expect(orangeHrmLoginPage.errorAlertLocator()).toBeVisible();
    expect(dialogTriggered).toBe(false);
  });

  test('LOGIN-021: Browser back after logout does not restore session', async ({
    orangeHrmLoginPage,
    orangeHrmDashboardPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(orangeHrm.admin.username, orangeHrm.admin.password);
    await expect(orangeHrmDashboardPage.headerLocator()).toBeVisible();

    await orangeHrmDashboardPage.logout();
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('LOGIN-024: Password field masks its input', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.typePassword(orangeHrm.admin.password);

    expect(await orangeHrmLoginPage.passwordInputType()).toBe('password');
  });

  test('LOGIN-025: Pressing Enter in password field submits the form', async ({
    orangeHrmLoginPage,
    orangeHrmDashboardPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.loginByEnterKey(orangeHrm.admin.username, orangeHrm.admin.password);

    await expect(page).toHaveURL(new RegExp(`${orangeHrm.paths.dashboard}$`));
    await expect(orangeHrmDashboardPage.headerLocator()).toBeVisible();
  });

  test('LOGIN-014: Username with leading/trailing whitespace is handled consistently', async ({
    orangeHrmLoginPage,
    page,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(`  ${orangeHrm.admin.username}  `, orangeHrm.admin.password);

    // Either the username is trimmed and the user lands on the dashboard, or
    // the login is rejected with "Invalid credentials" — both are acceptable
    // as long as behaviour is consistent and no server crash occurs.
    const url = page.url();
    if (/\/dashboard\/index/.test(url)) {
      await expect(page).toHaveURL(/\/dashboard\/index/);
    } else {
      await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
        orangeHrm.messages.invalidCredentials,
      );
    }
  });

  test('LOGIN-015: Username at boundary length (255 chars) is rejected without crash', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    const longUsername = 'a'.repeat(255);
    await orangeHrmLoginPage.login(longUsername, 'anything');

    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  test('LOGIN-016: Over-max-length username does not cause server error', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    const veryLongUsername = 'a'.repeat(512);
    await orangeHrmLoginPage.typeUsername(veryLongUsername);

    // Field either truncates to its maxlength or accepts the full value, but
    // submitting must not throw a server error.
    const maxLen = await orangeHrmLoginPage.usernameMaxLength();
    const stored = await orangeHrmLoginPage.usernameInputValue();
    if (maxLen) {
      expect(stored.length).toBeLessThanOrEqual(Number(maxLen));
    }

    await orangeHrmLoginPage.typePassword('anything');
    await orangeHrmLoginPage.submit();
    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  test('LOGIN-017: Special characters in username are rejected safely', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login('!@#$%^&*()_+', orangeHrm.admin.password);

    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  test('LOGIN-020: Repeated invalid attempts continue to be rejected (rate-limit smoke)', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    for (let i = 0; i < 5; i++) {
      await orangeHrmLoginPage.login(orangeHrm.admin.username, `wrong_${i}`);
      await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
        orangeHrm.messages.invalidCredentials,
      );
    }
    // After repeated failures the form must still be on the login page and
    // not crash or silently auto-authenticate.
    await expect(orangeHrmLoginPage.loginButtonLocator()).toBeVisible();
  });

  test('LOGIN-022: Caps Lock equivalent — uppercase password is rejected', async ({
    orangeHrmLoginPage,
  }) => {
    await orangeHrmLoginPage.open();
    await orangeHrmLoginPage.login(
      orangeHrm.admin.username.toUpperCase(),
      orangeHrm.admin.password.toUpperCase(),
    );

    await expect(orangeHrmLoginPage.errorAlertLocator()).toContainText(
      orangeHrm.messages.invalidCredentials,
    );
  });

  /**
   * Multi-context test — must instantiate fresh page objects against each
   * separate browser context. The shared `page` fixture cannot represent
   * two simultaneous sessions.
   */
  test('LOGIN-023: Concurrent logins from two browser contexts both succeed', async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    const loginA = new OrangeHrmLoginPage(pageA);
    const loginB = new OrangeHrmLoginPage(pageB);
    const dashA = new OrangeHrmDashboardPage(pageA);
    const dashB = new OrangeHrmDashboardPage(pageB);
    try {
      await loginA.open();
      await loginB.open();
      await loginA.loginExpectingDashboard(orangeHrm.admin.username, orangeHrm.admin.password);
      await loginB.loginExpectingDashboard(orangeHrm.admin.username, orangeHrm.admin.password);

      await expect(dashA.headerLocator()).toBeVisible();
      await expect(dashB.headerLocator()).toBeVisible();
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
