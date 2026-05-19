import { test, expect } from '@fixtures/test-fixtures';

test.describe('US-003 — Header & primary navigation', () => {
  test.beforeEach(async ({ headerPage }) => {
    await headerPage.openHome();
  });

  test('TC-101: Primary nav links are visible on the home page', async ({ headerPage }) => {
    await headerPage.expectPrimaryLinksVisible();
    await headerPage.expectLogoLinksHome();
  });

  test('TC-102: Services mega-menu lists key categories', async ({ headerPage }) => {
    await headerPage.expectServicesMenuLinks([
      'Custom Software Development',
      'Web Application Development',
      'Mobile App Development',
      'UX/UI Design',
      'QA and Testing',
      'Cloud and Infrastructure',
      'Data & AI',
    ]);
  });

  test('TC-103: Company menu lists company destinations', async ({ headerPage }) => {
    await headerPage.expectCompanyMenuLinks([
      'Who We Are',
      'How We Work',
      'Partnership Program',
      'Case Studies',
      'News',
    ]);
  });

  test('TC-104: Language switcher exposes English and Japanese', async ({ headerPage }) => {
    await headerPage.expectLanguageSwitcher();
  });

  test('TC-105: Get in touch CTA navigates to /contact/', async ({ headerPage, page }) => {
    await headerPage.clickGetInTouch();
    await expect(page).toHaveURL(/\/contact\/?$/);
  });
});
