import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-002 Get in Touch — contact form fields visible', () => {
  test('TC-001: Click Get in Touch and verify Full Name, Email, Company fields display', async ({
    orientHomePage,
    orientContactPage,
    page,
  }) => {
    await orientHomePage.open();
    await orientHomePage.goToContact();

    await expect(page).toHaveURL(/\/contact\/?$/);

    await expect(orientContactPage.fullNameLocator()).toBeVisible();
    await expect(orientContactPage.emailLocator()).toBeVisible();
    await expect(orientContactPage.companyLocator()).toBeVisible();
  });
});
