import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ORIENT_BASE_URL } from '@data/orient-catalog';

/**
 * Shared site header (rendered as <nav class="navbar">; the site does
 * not use a <header> element). Reusable across specs — call openHome()
 * first.
 */
export class OrientHeaderPage extends BasePage {
  private readonly nav: Locator;
  private readonly logo: Locator;
  private readonly servicesTrigger: Locator;
  private readonly companyTrigger: Locator;
  private readonly careersLink: Locator;
  private readonly blogLink: Locator;
  private readonly getInTouchLink: Locator;
  private readonly engLink: Locator;
  private readonly jpLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = page.locator('nav.navbar').first();
    this.logo = this.nav.locator('a[href="/"]').first();
    this.servicesTrigger = this.nav.locator('.nav-link.dropdown-toggle', { hasText: /^Services$/ }).first();
    this.companyTrigger = this.nav.locator('.nav-link.dropdown-toggle', { hasText: /^Company$/ }).first();
    this.careersLink = this.nav.locator('a', { hasText: /^Careers$/ }).first();
    this.blogLink = this.nav.locator('a', { hasText: /^Blog$/ }).first();
    this.getInTouchLink = this.nav.locator('a', { hasText: /^Get in touch$/ }).first();
    this.engLink = this.nav.locator('a.header__language-en').first();
    this.jpLink = this.nav.locator('a.header__language-jp').first();
  }

  async openHome(): Promise<void> {
    await this.page.goto(ORIENT_BASE_URL + '/', { waitUntil: 'domcontentloaded' });
  }

  async expectPrimaryLinksVisible(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.servicesTrigger).toBeVisible();
    await expect(this.companyTrigger).toBeVisible();
    await expect(this.careersLink).toBeVisible();
    await expect(this.blogLink).toBeVisible();
    await expect(this.getInTouchLink).toBeVisible();
  }

  async clickGetInTouch(): Promise<void> {
    await this.getInTouchLink.click();
  }

  async hoverServices(): Promise<void> {
    await this.servicesTrigger.hover();
  }

  async hoverCompany(): Promise<void> {
    await this.companyTrigger.hover();
  }

  async expectServicesMenuLinks(linkTextsCaseInsensitive: readonly string[]): Promise<void> {
    await this.hoverServices();
    for (const text of linkTextsCaseInsensitive) {
      const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      // Mega-menu links live in the nav. Match by visible text after hover.
      const link = this.nav.locator('a', { hasText: re }).first();
      await expect(link, `Services menu missing link matching /${text}/i`).toBeVisible();
    }
  }

  async expectCompanyMenuLinks(linkTextsCaseInsensitive: readonly string[]): Promise<void> {
    await this.hoverCompany();
    for (const text of linkTextsCaseInsensitive) {
      const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const link = this.nav.locator('a', { hasText: re }).first();
      await expect(link, `Company menu missing link matching /${text}/i`).toBeVisible();
    }
  }

  async expectLanguageSwitcher(): Promise<void> {
    await expect(this.engLink).toBeVisible();
    await expect(this.jpLink).toBeVisible();
    await expect(this.engLink).toHaveAttribute('href', /orientsoftware\.com/);
    await expect(this.jpLink).toHaveAttribute('href', /jp\.orientsoftware\.com/);
  }

  async expectLogoLinksHome(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.logo).toHaveAttribute('href', '/');
  }
}
