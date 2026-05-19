# Presentation Talking Points

**Target audience:** QA engineering team
**Duration:** ~15 minutes + Q&A
**Goal:** Show the team a repeatable pipeline that turns Jira user stories
into POM-compliant Playwright tests using Claude Code, even without Rovo MCP.

---

## 1. Problem statement (1 min)

- We don't have Atlassian Rovo MCP access — Claude Code cannot read Jira
  tickets directly.
- Writing test plans, test cases, and Playwright automation by hand for
  every story is slow and inconsistent.
- We need a workflow that is: (a) repeatable, (b) enforces our POM
  framework, (c) leaves humans in charge of judgment calls (selectors,
  edge cases).

## 2. The pipeline in one slide (1 min)

```
Jira user story (copy/paste)
        │
        ▼  Skill 1: generate-testplan-testcase
        ▼
Markdown:  samples/<US-id>-testcases.md
        │
        ▼  Skill 2: generate-playwright-tests
        ▼
pages/<US-id>/*.page.ts   +   tests/<US-id>/*.spec.ts
        │
        ▼  npx playwright test
        ▼
Green CI
```

Three steps. Two skills. One framework. Human in the loop at each handoff.

## 3. Why Page Object Model — non-negotiable (1 min)

- Locators centralised → UI change touches one file, not 30.
- Specs read like business intent, not framework code.
- New testers can write a spec without touching Playwright APIs.
- Code review focuses on test logic, not selector copy-paste.

## 4. How we make Claude Code follow the rules (2 min) — **the key insight**

Two artifacts in the repo do the work:

1. **`CLAUDE.md`** — read by Claude on every action in the repo. Encodes
   POM rules: no `page.locator` in specs, page objects extend `BasePage`,
   fixture-injected page objects, folder layout, selector priority.
2. **`fixtures/test-fixtures.ts`** — custom `test()` exposes page objects
   so specs *cannot* construct them manually. The shape of the API forces
   compliance.

Add the **`generate-playwright-tests` skill** on top — it codifies the
workflow (parse → plan → page objects → fixture → specs → run) and
refuses shortcuts.

Pull quote for a slide:
> _"You don't get POM by asking nicely. You get it by making the
> repo refuse anything else."_

## 5. Live demo (8 min)

**Setup:** terminal open at `/Users/admin/Foden/Techs/FodenClaudeCode/playwright-demo/`,
Claude Code running, browser ready.

1. **Show the input** — open `samples/US-001-login.md` (the Jira-style
   user story). 30 sec.
2. **Run Skill 1** (or show pre-generated output for time) — open
   `samples/US-001-login-testcases.md`. Point out: test plan, 5 test
   cases, traceability matrix. 1 min.
3. **Show the empty `tests/` and `pages/` folders** (delete the generated
   files beforehand so the demo starts clean). 15 sec.
4. **Walk through `CLAUDE.md`** — read the "POM rules" section out loud.
   Emphasise rule #1 (no raw locators in specs) and rule #4 (fixture).
   45 sec.
5. **Invoke the skill** in Claude Code:
   ```
   /generate-playwright-tests samples/US-001-login-testcases.md
   ```
   Narrate what Claude does as files appear:
   - Creates `pages/US-001-login/login.page.ts` + `inventory.page.ts`
   - Extends `fixtures/test-fixtures.ts`
   - Creates 3 spec files under `tests/US-001-login/`
   - Runs `npx playwright test` itself
   2-3 min.
6. **Open one spec file** — show it reads like English, no `page.locator`,
   page objects come from fixture args. 30 sec.
7. **Open the page object** — show locators centralised, methods describe
   user intent (`login(u, p)`). 30 sec.
8. **Re-run the tests** in the terminal: `npm test`. 5 green. 30 sec.

## 6. Limitations & human-in-the-loop checkpoints (1 min)

Be honest about what Claude **cannot** do reliably:

- **Selectors** — Claude picks plausible selectors from page semantics.
  For complex apps with custom components, a human should verify or
  swap to `data-testid` attributes the dev team owns.
- **Test data** — Claude reuses what's in `data/test-data.ts`. For
  scenarios requiring DB seeding or API setup, you scaffold the
  fixtures; Claude wires them up.
- **Flaky assertions** — Claude uses web-first assertions, which handle
  most timing issues. Truly flaky behaviour (animations, third-party
  iframes) still needs a human eye.
- **Negative-path coverage** — Claude generates what's in the testcases.
  If the testcases skill missed a corner case, so will Playwright.
  Review the testcases Markdown carefully before running Skill 2.

The pipeline accelerates the boring parts. Judgment stays with us.

## 7. Next steps for the team (1 min)

- Clone the demo repo (path: `playwright-demo/`) and run `npm test` to
  verify the env.
- The `generate-playwright-tests` skill ships with the repo at
  `.claude/skills/generate-playwright-tests/` — clone the repo and
  Claude Code picks it up automatically.
- Pick one of your current Jira stories. Copy the description into
  Skill 1, review the generated Markdown, then run Skill 2.
- Send feedback — what worked, what Claude got wrong, what rules we
  should add to `CLAUDE.md`.

## 8. Q&A (open)

Likely questions to prep for:

- **"What if the app needs login state for most tests?"** — Add an
  `authenticatedPage` fixture in `test-fixtures.ts` that performs login
  once and reuses storage state. Update `CLAUDE.md` to reference it.
- **"How do we run this in GitLab CI?"** — Standard Playwright CI:
  install Node, `npm ci`, `npx playwright install --with-deps chromium`,
  `npm test`. Report Portal integration is a separate slide.
- **"What if I don't like a generated test?"** — Edit it. The skill
  generates a starting point, not a final answer. The POM structure
  makes edits cheap.
- **"Does this work for API tests too?"** — Yes, with a different skill
  (or extending this one). Out of scope for today.
- **"What about visual regression / accessibility?"** — Playwright
  supports both via plugins; we add them once the POM workflow is
  bedded in.

---

## Optional: backup demo

If the live demo fails (network, saucedemo down, anything), fall back to:

1. Show the **already-generated** files in `pages/US-001-login/` and
   `tests/US-001-login/`.
2. Walk through `login.page.ts` and `login-happy-path.spec.ts`.
3. Show the **passing test run output** (screenshot the green run in
   advance, or `npx playwright show-report`).
4. Move directly to limitations + Q&A.
