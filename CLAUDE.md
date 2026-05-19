# Playwright Repo Conventions (read every time)

This is a Playwright + TypeScript framework that strictly follows the Page
Object Model. These rules are non-negotiable and apply to any file you
create or edit in this repo.

## Folder layout

```
pages/<user-story-slug>/<name>.page.ts   # one page object per logical page
pages/base.page.ts                       # shared BasePage — extend it
tests/<user-story-slug>/<name>.spec.ts   # one spec folder per user story
fixtures/test-fixtures.ts                # exposes page objects to specs
data/test-data.ts                        # shared credentials & constants
samples/                                 # input Markdown testcases
```

`<user-story-slug>` is kebab-case, derived from the user story ID + title,
e.g. `US-001-login`, `US-002-cart-checkout`.

## POM rules (hard requirements)

1. **No raw locators in specs.** Spec files must NEVER contain
   `page.locator(...)`, `page.getByRole(...)`, `page.getByTestId(...)`,
   `page.click(...)`, `page.fill(...)`, or any direct `page.*` interaction.
   All UI interaction goes through a page object method.

2. **Page objects extend `BasePage`** from `pages/base.page.ts`. Their
   constructor takes a `Page` and is the only place that touches Playwright
   locators. Locators are declared as `private readonly` class fields and
   initialised in the constructor.

3. **Page objects expose intent, not mechanics.** Method names describe
   user actions (`login(username, password)`, `addItemToCart(name)`),
   not framework calls (`clickLoginButton`, `fillUsernameInput`). Group
   tightly-coupled steps into one method.

4. **Specs use the custom fixture** from `fixtures/test-fixtures.ts`.
   Import `test` and `expect` from there, never directly from
   `@playwright/test`. Page objects are destructured from fixture args —
   no `new LoginPage(page)` inside specs.

5. **One spec file per testcase group**, named after the scenario:
   `login-success.spec.ts`, `login-invalid-credentials.spec.ts`. Test
   titles mirror the testcase ID + name from the source Markdown,
   e.g. `test('TC-001: Login with valid standard user', ...)`.

6. **Assertions belong in specs**, not in page objects, with two
   exceptions: implicit waits (`expectVisible` helpers on `BasePage`)
   and "page is ready" guards used by other page methods.

7. **Selectors priority** — prefer in this order:
   `getByRole` → `getByLabel` → `getByTestId` → `getByText` → CSS.
   Avoid XPath. Avoid CSS chains longer than one level.

8. **Test data** — credentials and reusable constants live in
   `data/test-data.ts`. Inline only data that's specific to one scenario.

9. **No `console.log` in committed code.** Use Playwright's built-in
   reporter; debug locally with `--ui` or `--debug`.

10. **Run tests after every generation/edit.** After writing or editing
    spec/page files, run `npx playwright test tests/<slug>` and fix
    failures before reporting work done. Don't claim success without
    a green run.

## When adding a new user story

Given a Markdown testcases file at `samples/<US>-testcases.md`:

1. Derive `<slug>` (kebab-case, e.g. `US-001-login`).
2. Create `pages/<slug>/` and `tests/<slug>/`.
3. For each distinct page in the testcases, create one
   `<name>.page.ts` extending `BasePage`.
4. Extend `fixtures/test-fixtures.ts` to expose the new page objects:

   ```ts
   import { test as base } from '@playwright/test';
   import { LoginPage } from '@pages/US-001-login/login.page';

   type Fixtures = { loginPage: LoginPage };
   export const test = base.extend<Fixtures>({
     loginPage: async ({ page }, use) => {
       await use(new LoginPage(page));
     },
   });
   export { expect } from '@playwright/test';
   ```

5. Write specs under `tests/<slug>/`, one file per testcase group, using
   the fixture.
6. Run `npx playwright test tests/<slug>` until green.

## When in doubt

If a request would violate any rule above (e.g. "just use `page.click`
in the spec, it's faster"), refuse and propose the POM-compliant
alternative. The whole point of this framework is consistency — speed
shortcuts that break the pattern create maintenance debt later.
