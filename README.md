# Playwright Demo — POM Framework

A small Playwright + TypeScript framework that demonstrates how to generate
maintainable end-to-end tests from Markdown testcases using Claude Code.

## Pipeline

```
Jira user story (copy/paste)
        │
        ▼
generate-testplan-testcase  ──►  samples/<US>-testcases.md  (human-readable)
        │
        ▼
generate-playwright-tests   ──►  tests/<user-story>/*.spec.ts
                                 pages/<user-story>/*.page.ts
```

Each user story becomes its own subfolder under `tests/` and `pages/`.
All page objects extend `BasePage`; specs receive page objects via the
custom fixture in `fixtures/test-fixtures.ts` — they never call
`page.locator(...)` directly.

## Layout

```
playwright-demo/
├── pages/                 # page objects, one folder per user story
│   └── base.page.ts       # shared BasePage
├── tests/                 # specs, one folder per user story
├── fixtures/
│   └── test-fixtures.ts   # custom test() exposing page objects
├── data/test-data.ts      # shared credentials / fixtures
├── samples/               # sample Jira stories + generated testcases
├── .claude/skills/
│   └── generate-playwright-tests/SKILL.md   # project-level skill
├── CLAUDE.md              # POM rules — Claude Code reads automatically
└── playwright.config.ts
```

## Run

```bash
npm install
npx playwright install --with-deps chromium
npm test
```

## Generate tests from a testcases file

In Claude Code, from inside this repo:

```
/generate-playwright-tests samples/US-001-login-testcases.md
```

The skill reads the Markdown, infers page objects, writes them under
`pages/<slug>/`, writes specs under `tests/<slug>/`, wires up the fixture,
and runs `npx playwright test tests/<slug>` before reporting done.