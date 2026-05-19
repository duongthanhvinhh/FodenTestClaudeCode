---
name: generate-playwright-tests
description: Use this skill whenever the user wants to generate, scaffold, or write Playwright tests from a Markdown testcases file (typically output by the generate-testplan-testcase skill from a Jira user story). Trigger any time the user mentions "generate Playwright tests", "scaffold tests from testcases", "convert testcases to Playwright", "write Playwright POM tests", or explicitly invokes /generate-playwright-tests. The skill enforces a strict Page Object Model: locators only in page objects (which extend BasePage), specs use a shared fixture, one subfolder per user story under both `pages/` and `tests/`. Produces working TypeScript test files and verifies them with `npx playwright test` before reporting done.
---

# Generate Playwright Tests (POM)

Convert a Markdown testcases file into POM-compliant Playwright + TypeScript
tests inside the current Playwright repo. One user story → one subfolder
under `tests/` and one under `pages/`. Verify with a test run before
reporting done.

## Inputs

Required:
- **Path to a testcases Markdown file** (e.g. `samples/US-001-login-testcases.md`).
  Usually produced by the `generate-testplan-testcase` skill.

Optional:
- **User story slug override.** Otherwise inferred from the testcases file
  (look for a `Slug:` field, a `US-XXX` ID, or the filename).

If the user invokes the skill without a path, ask for one. Do not guess.

## Pre-flight checks

Before writing anything, confirm:

1. Current working directory is a Playwright repo (`playwright.config.*`,
   `package.json` with `@playwright/test`). If not, stop and tell the user.
2. Repo `CLAUDE.md` exists and defines POM conventions — read it and
   **defer to it on any conflict with this skill**. Per-repo rules win.
3. `pages/base.page.ts` and `fixtures/test-fixtures.ts` exist. If either is
   missing, scaffold the minimum versions before generating tests (see
   "Scaffolding fallback" below).
4. Node modules are installed (`node_modules/@playwright/test` present). If
   not, run `npm install` and `npx playwright install --with-deps chromium`.

## Workflow

### Step 1 — Parse the testcases Markdown

Read the file end-to-end and extract:

- **Slug** — kebab-case identifier, e.g. `US-001-login`. Use the `Slug:`
  field if present; otherwise build it from the user story ID + a short
  title (`US-001-login`).
- **Target URL / baseURL** — note any URLs mentioned; they belong in
  `playwright.config.ts` (`baseURL`) or `.env.example`, not in code.
- **Distinct pages** involved — e.g. Login page, Inventory page, Cart page.
  Each becomes one `*.page.ts` under `pages/<slug>/`.
- **Test cases** — for each one, capture:
  - ID + title (e.g. `TC-001 — Login with valid standard user`)
  - Preconditions
  - Test data (mark whether it's reusable → `data/test-data.ts`, or
    scenario-specific → inline in the spec)
  - Steps (UI actions)
  - Expected result (becomes the spec assertions)

Group test cases that share the same starting page into the same spec file.

### Step 2 — Plan the file layout

Before writing, list every file you'll create or edit and confirm with the
user if the list is long (more than ~6 files). For a typical story:

```
pages/<slug>/<page-name>.page.ts          (one per distinct page)
tests/<slug>/<scenario>.spec.ts           (one per test case group)
fixtures/test-fixtures.ts                 (extend to expose new page objects)
data/test-data.ts                         (add credentials/constants if reused)
```

### Step 3 — Create / update page objects

For each distinct page:

- Class extends `BasePage` from `pages/base.page.ts`.
- Constructor takes `Page`; calls `super(page)`.
- All locators are `private readonly` class fields, initialised in the
  constructor with `this.page.getByRole(...)` etc. **Selectors priority:**
  `getByRole` → `getByLabel` → `getByTestId` → `getByText` → CSS. Avoid
  XPath. Avoid CSS chains longer than one level.
- Public methods describe **user intent**, not framework calls. Prefer
  `login(username, password)` over `clickLoginButton`. Group tightly
  coupled steps into one method.
- Page objects should not assert business outcomes (that's the spec's
  job). They may use `BasePage`'s `expectVisible` helpers as readiness
  guards inside other methods.

Example shape (do not copy verbatim, adapt to the page):

```ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorBanner = page.locator('[data-test="error"]');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    if (username) await this.usernameInput.fill(username);
    if (password) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async errorMessage(): Promise<string> {
    return (await this.errorBanner.textContent()) ?? '';
  }
}
```

### Step 4 — Wire up the fixture

Extend `fixtures/test-fixtures.ts` to expose each new page object. Imports
use the `@pages/*` alias. Always re-export `expect`.

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/US-001-login/login.page';
import { InventoryPage } from '@pages/US-001-login/inventory.page';

type Fixtures = { loginPage: LoginPage; inventoryPage: InventoryPage };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
});

export { expect } from '@playwright/test';
```

### Step 5 — Write specs

For each spec file under `tests/<slug>/`:

- Import `test` and `expect` from `@fixtures/test-fixtures`. Never from
  `@playwright/test` directly.
- Destructure page objects from `test(...)` arguments.
- Test titles mirror the source: `test('TC-001: Login with valid standard user', ...)`.
- Group related cases in `test.describe(...)`.
- Assertions live in the spec, not in page objects.
- Use `data/test-data.ts` for reusable credentials/constants. Inline only
  scenario-specific values.

Example:

```ts
import { test, expect } from '@fixtures/test-fixtures';
import { users } from '@data/test-data';

test.describe('US-001 Login — happy path', () => {
  test('TC-001: Login with valid standard user', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page).toHaveTitle(/Swag Labs/);
  });
});
```

### Step 6 — Hard rules to enforce while generating

These are non-negotiable. Self-check the generated files against them
before saving:

1. No `page.locator(...)`, `page.getByRole(...)`, `page.click(...)`, or
   any direct `page.*` UI interaction **inside spec files**. Specs may
   only use `expect(page).to*(...)` for top-level assertions (URL, title)
   and otherwise go through page objects.
2. No `new SomePage(page)` inside specs — page objects are injected via
   the fixture.
3. No XPath selectors anywhere.
4. No `console.log`, no `test.only`, no `test.skip` without a `// reason:`
   comment.
5. No hard-coded `setTimeout` waits. Use Playwright's web-first assertions.
6. No credentials hard-coded in specs. Pull from `data/test-data.ts`.
7. All new files end with a trailing newline. TypeScript strict mode
   must pass (`tsc --noEmit` runs clean).

### Step 7 — Run the tests

After writing all files:

1. Run `npx playwright test tests/<slug>` from the repo root.
2. If any test fails:
   - Read the failure output.
   - Fix the underlying issue (wrong selector, wrong assertion text, etc.).
   - Re-run. Do not silence with `.skip` or weaken assertions.
3. Run `npx tsc --noEmit` and fix any type errors.
4. Only after `npx playwright test tests/<slug>` is green do you report
   the task as done.

If the target site is unreachable from the user's environment, say so
explicitly — do not claim success because tests "would pass".

## Reporting back

When done, give the user:

- Files created / edited (path list, grouped by pages vs. tests vs. fixture).
- Test run summary (`X passed, Y failed`).
- Anything you stubbed or left for human review (e.g. a selector you
  weren't confident about, a test data value the user must supply).

Keep the summary tight. No recap of the workflow itself — they can read
the diff.

## Scaffolding fallback

If `pages/base.page.ts` or `fixtures/test-fixtures.ts` is missing, create
minimal versions before generating tests:

- `pages/base.page.ts`: abstract class with `protected constructor(page)`,
  a `goto(path)` helper, and `expectVisible` / `expectText` helpers.
- `fixtures/test-fixtures.ts`: re-exports `test` from `@playwright/test`
  and `expect`, ready to be extended.

Tell the user you scaffolded them so they're aware.

## Refusing shortcuts

If the user asks you to "just put the locator in the spec, it's faster",
refuse and propose the POM-compliant version. The whole point of this
skill is consistency — shortcuts that break the pattern create
maintenance debt later.
