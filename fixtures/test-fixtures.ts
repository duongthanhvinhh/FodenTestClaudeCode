import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/US-001-login/login.page';
import { InventoryPage } from '@pages/US-001-login/inventory.page';
import { OrientHomePage as OrientHomePageLegacy } from '@pages/US-002-get-in-touch/orient-home.page';
import { OrientContactPage as OrientContactPageLegacy } from '@pages/US-002-get-in-touch/contact.page';
import { OrientHomePage } from '@pages/US-003-orient-site-coverage/home.page';
import { OrientHeaderPage } from '@pages/US-003-orient-site-coverage/header.page';
import { OrientFooterPage } from '@pages/US-003-orient-site-coverage/footer.page';
import { OrientSitePage } from '@pages/US-003-orient-site-coverage/site.page';
import { OrientServicesHubPage } from '@pages/US-003-orient-site-coverage/services-hub.page';
import { OrientTechnologiesPage } from '@pages/US-003-orient-site-coverage/technologies.page';
import { OrientBlogPage } from '@pages/US-003-orient-site-coverage/blog.page';
import { OrientCareersPage } from '@pages/US-003-orient-site-coverage/careers.page';
import { OrientContactPage } from '@pages/US-003-orient-site-coverage/contact.page';
import { OrangeHrmLoginPage } from '@pages/OrangeHRM/login.page';
import { OrangeHrmDashboardPage } from '@pages/OrangeHRM/dashboard.page';
import { OrangeHrmAdminUsersPage } from '@pages/OrangeHRM/admin-users.page';
import { OrangeHrmAddUserPage } from '@pages/OrangeHRM/add-user.page';
import { OrangeHrmJobTitlesPage } from '@pages/OrangeHRM/admin-job-titles.page';
import { OrangeHrmOrgGeneralPage } from '@pages/OrangeHRM/admin-org-general.page';
import { OrangeHrmNationalitiesPage } from '@pages/OrangeHRM/admin-nationalities.page';
import { OrangeHrmEditUserPage } from '@pages/OrangeHRM/edit-user.page';

type Fixtures = {
  // US-001
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  // US-002 (legacy)
  orientHomePage: OrientHomePageLegacy;
  orientContactPage: OrientContactPageLegacy;
  // US-003
  homePage: OrientHomePage;
  headerPage: OrientHeaderPage;
  footerPage: OrientFooterPage;
  sitePage: OrientSitePage;
  servicesHubPage: OrientServicesHubPage;
  technologiesPage: OrientTechnologiesPage;
  blogPage: OrientBlogPage;
  careersPage: OrientCareersPage;
  contactPage: OrientContactPage;
  // OrangeHRM
  orangeHrmLoginPage: OrangeHrmLoginPage;
  orangeHrmDashboardPage: OrangeHrmDashboardPage;
  orangeHrmAdminUsersPage: OrangeHrmAdminUsersPage;
  orangeHrmAddUserPage: OrangeHrmAddUserPage;
  orangeHrmJobTitlesPage: OrangeHrmJobTitlesPage;
  orangeHrmOrgGeneralPage: OrangeHrmOrgGeneralPage;
  orangeHrmNationalitiesPage: OrangeHrmNationalitiesPage;
  orangeHrmEditUserPage: OrangeHrmEditUserPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
  orientHomePage: async ({ page }, use) => { await use(new OrientHomePageLegacy(page)); },
  orientContactPage: async ({ page }, use) => { await use(new OrientContactPageLegacy(page)); },
  homePage: async ({ page }, use) => { await use(new OrientHomePage(page)); },
  headerPage: async ({ page }, use) => { await use(new OrientHeaderPage(page)); },
  footerPage: async ({ page }, use) => { await use(new OrientFooterPage(page)); },
  sitePage: async ({ page }, use) => { await use(new OrientSitePage(page)); },
  servicesHubPage: async ({ page }, use) => { await use(new OrientServicesHubPage(page)); },
  technologiesPage: async ({ page }, use) => { await use(new OrientTechnologiesPage(page)); },
  blogPage: async ({ page }, use) => { await use(new OrientBlogPage(page)); },
  careersPage: async ({ page }, use) => { await use(new OrientCareersPage(page)); },
  contactPage: async ({ page }, use) => { await use(new OrientContactPage(page)); },
  // OrangeHRM
  orangeHrmLoginPage: async ({ page }, use) => { await use(new OrangeHrmLoginPage(page)); },
  orangeHrmDashboardPage: async ({ page }, use) => { await use(new OrangeHrmDashboardPage(page)); },
  orangeHrmAdminUsersPage: async ({ page }, use) => { await use(new OrangeHrmAdminUsersPage(page)); },
  orangeHrmAddUserPage: async ({ page }, use) => { await use(new OrangeHrmAddUserPage(page)); },
  orangeHrmJobTitlesPage: async ({ page }, use) => { await use(new OrangeHrmJobTitlesPage(page)); },
  orangeHrmOrgGeneralPage: async ({ page }, use) => { await use(new OrangeHrmOrgGeneralPage(page)); },
  orangeHrmNationalitiesPage: async ({ page }, use) => { await use(new OrangeHrmNationalitiesPage(page)); },
  orangeHrmEditUserPage: async ({ page }, use) => { await use(new OrangeHrmEditUserPage(page)); },
});

export { expect } from '@playwright/test';
