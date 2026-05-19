import { test, expect } from '@fixtures/test-fixtures';

/**
 * Block any contact-form POST so we never accidentally submit data to
 * production while exercising client-side validation behaviour.
 */
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const req = route.request();
    if (req.method() === 'POST' && /contact|send|mail|form/i.test(req.url())) {
      return route.abort();
    }
    return route.continue();
  });
});

test.describe('US-003 — Contact page & form', () => {
  test('TC-901: All office sections render', async ({ contactPage }) => {
    await contactPage.open();
    await contactPage.expectOfficeHeadingsVisible();
  });

  test('TC-902: Required form fields are present', async ({ contactPage }) => {
    await contactPage.open();
    await contactPage.expectRequiredFieldsVisible();
  });

  test('TC-903: Empty submit shows the JS validation banner and does not navigate', async ({ contactPage, page }) => {
    await contactPage.open();
    await contactPage.clickSend();
    await expect(page).toHaveURL(/\/contact\/?$/);
    await contactPage.expectTopErrorBannerShown();
  });

  test('TC-904: Malformed email shows an email-related validation error', async ({ contactPage, page }) => {
    await contactPage.open();
    await contactPage.fillForm({
      name: 'QA Bot',
      email: 'not-an-email',
      message: 'automation validation check — do not action',
    });
    await contactPage.clickSend();
    await expect(page).toHaveURL(/\/contact\/?$/);
    await contactPage.expectEmailFieldError();
  });
});
