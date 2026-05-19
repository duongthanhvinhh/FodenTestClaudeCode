# US-003 — Orient Software Website: Full-Site Coverage

**As** a QA engineer
**I want** an automated regression suite for `https://www.orientsoftware.com`
**So that** I can detect broken navigation, missing content, form regressions, and SEO defects on each release.

## Scope and constraints

- Target environment: production (`https://www.orientsoftware.com`).
- Tests are **read-only**. They never submit the contact form or careers
  application — they only validate fields/states. Search queries are
  allowed because they are idempotent GET requests.
- Locale tested: English (`/`). Japanese (`jp.orientsoftware.com`) is
  smoke-only.
- Browser: Desktop Chromium 1280×800 by default. A mobile project
  (Pixel 7) is configured but not required to be green for CI.

## Page inventory

| Area            | URL                                                          |
| --------------- | ------------------------------------------------------------ |
| Home            | `/`                                                          |
| Services hub    | `/services/`                                                 |
| Custom dev      | `/services/software-development/custom/`                     |
| Dedicated teams | `/services/software-development/dedicated-teams/`            |
| Outsourcing     | `/services/software-development/outsourcing/`                |
| Offshore        | `/services/software-development/offshore/`                   |
| Web app dev     | `/services/web-development/application/`                     |
| Mobile app dev  | `/services/application-development/mobile/`                  |
| Maintenance     | `/services/application-development/support-and-maintenance/` |
| UI/UX design    | `/services/ui-ux-design/`                                    |
| QA & testing    | `/services/qa-and-software-testing/`                         |
| Cloud           | `/services/cloud-computing/`                                 |
| Data & AI       | `/services/data-and-ai/`                                     |
| AI services     | `/services/artificial-intelligence/`                         |
| ML              | `/services/machine-learning/`                                |
| IoT             | `/services/internet-of-things/`                              |
| Staff aug       | `/services/it-staff-augmentation/`                           |
| Project-based   | `/services/project-based-delivery/`                          |
| Technologies    | `/technologies/`                                             |
| Who we are      | `/who-we-are/`                                               |
| How we work     | `/how-we-work/`                                              |
| Partner with us | `/why-partner-with-us/`                                      |
| Case studies    | `/case-studies/`                                             |
| News            | `/news/`                                                     |
| Blog            | `/blog/`                                                     |
| Careers         | `/careers/`                                                  |
| Contact         | `/contact/`                                                  |
| Terms           | `/terms-of-use/`                                             |
| Privacy         | `/privacy-statement/`                                        |
| Outsourcing FAQ | `/software-outsourcing/faq/`                                 |

## Test cases

### TC-001 to TC-030 — Smoke: every catalog URL loads (HTTP 200, has H1, has canonical)

For every URL in the catalog above:
- Page returns HTTP 2xx.
- `<title>` is non-empty.
- Exactly one `<h1>` element is rendered.
- `<link rel="canonical">` is present and matches the requested URL host.
- No console errors of `severity=error` during navigation.

### TC-101 — Header: primary navigation links are visible on the home page
- Open `/`.
- Verify links Services, Company, Careers, Blog, Get in touch are visible.
- Verify the Orient Software logo is visible and is a link to `/`.

### TC-102 — Header: Services mega-menu opens and lists key categories
- Open `/`.
- Hover Services.
- Verify the mega-menu shows links to Custom Software Development,
  Dedicated Teams, QA & Software Testing, UI/UX Design, Cloud,
  Data & AI.

### TC-103 — Header: Company menu lists Who We Are, How We Work, Why Partner With Us, Case Studies, News
- Open `/`.
- Hover Company.
- Verify the menu shows links to those five destinations.

### TC-104 — Header: Language switcher exposes English and Japanese
- Open `/`.
- Find the language switcher.
- Verify it has an `ENG` link to `orientsoftware.com` and a `日本語` link
  to `jp.orientsoftware.com`.

### TC-105 — Header: Get in touch CTA navigates to /contact/
- Open `/`.
- Click the header "Get in touch" link.
- Verify URL is `/contact/`.

### TC-201 — Footer: column headings render
- Open `/`.
- Verify the footer contains the headings Company, Our Services,
  Our Expertise, Technologies, Resources, Contact Us.

### TC-202 — Footer: sales email link is present
- Open `/`.
- Verify a `mailto:sales@orientsoftware.com` link is present in the
  footer.

### TC-203 — Footer: legal links resolve
- From `/`, click Terms of Use and verify the URL is `/terms-of-use/`
  and the page has an H1.
- Back to `/`, click Privacy Statement and verify the URL is
  `/privacy-statement/` and the page has an H1.

### TC-204 — Footer: Back to top scrolls to top of page
- Open `/`.
- Scroll to the bottom.
- Click "Back to top".
- Verify `window.scrollY` is < 200 px within 2 seconds.

### TC-301 — Home: hero H1 is visible and contains "Software Development"
- Open `/`.
- Verify the H1 text contains "Software Development".

### TC-302 — Home: hero CTA links to /contact/
- Open `/`.
- Click the primary hero CTA (e.g. "Get a Quote" / "Let's get to work").
- Verify URL is `/contact/`.

### TC-303 — Home: "What We Offer" section is visible
- Open `/`.
- Verify a section heading contains "What We Offer".

### TC-401 — Services hub: lists all major service categories
- Open `/services/`.
- Verify the page links to at least: software development, web
  application, mobile application, UI/UX design, QA & software testing,
  cloud computing, data & AI, AI, IoT, staff augmentation.

### TC-402 — QA service page: hero and FAQ render
- Open `/services/qa-and-software-testing/`.
- Verify H1 is "QA & TESTING SERVICES".
- Verify a "Frequently Asked Questions" section heading is visible.

### TC-501 — Technologies hub: shows React, Angular, Vue, .NET, Java, PHP, Python, Node.js, Ruby, Go
- Open `/technologies/`.
- Verify a link is present for each of the technologies above.

### TC-601 — Who We Are: shows company sections (Culture, Management team)
- Open `/who-we-are/`.
- Verify section anchors / headings for "Company Culture" and
  "Management Team" exist.

### TC-602 — How We Work page renders
- Open `/how-we-work/`.
- Verify the page has an H1 and a primary content section.

### TC-603 — Case Studies page lists case study cards
- Open `/case-studies/`.
- Verify at least 3 case study links / cards are present.

### TC-701 — Blog: page lists categories
- Open `/blog/`.
- Verify links to categories Software Development, AI & Data,
  Business Innovation, Staffing & Outsourcing are visible.

### TC-702 — Blog: search box accepts a query and updates results
- Open `/blog/`.
- Type "testing" into the search box.
- Trigger search.
- Verify the URL or visible list reflects the query (URL contains
  `s=testing` OR visible posts mention "testing").

### TC-703 — Blog post: an article opens, has H1 and author meta
- Open the first blog post listed on `/blog/`.
- Verify it has an H1 and a published date.

### TC-801 — Careers: list shows at least one open position
- Open `/careers/`.
- Verify at least one job link is visible.

### TC-802 — Careers: job search filters the list
- Open `/careers/`.
- Type "QA" into the keyword search.
- Trigger search.
- Verify the displayed result count decreases OR every visible job
  title contains "QA"/"Tester".

### TC-803 — Careers: opening a job posts shows job details
- Open `/careers/`.
- Click the first job in the list.
- Verify URL is under `/careers/...` and the page has an H1.

### TC-901 — Contact page: office sections render
- Open `/contact/`.
- Verify at least six office headings are visible (HCM, Da Nang,
  Ha Noi, Hue, Tokyo, Singapore).

### TC-902 — Contact form: required fields are present (name, email, message)
- Open `/contact/`.
- Verify Name, Work email, and Message inputs are visible on the
  in-page form.

### TC-903 — Contact form: client-side validation rejects empty submit
- Open `/contact/`.
- Click Send without filling the form.
- Verify the form does not navigate away (URL still `/contact/`)
  and at least one validation indication is visible on a required
  field. Form is **not** actually submitted.

### TC-904 — Contact form: client-side validation rejects malformed email
- Open `/contact/`.
- Fill Name="QA Bot", Email="not-an-email", Message="ping".
- Click Send.
- Verify the email field shows an invalid state and submission is
  blocked. Form is **not** actually submitted.

### TC-1001 — SEO: every catalog page has a non-empty meta description
- For every URL in the catalog, verify
  `meta[name="description"]` has length ≥ 30 characters.

### TC-1002 — SEO: every catalog page has Open Graph tags
- For every URL in the catalog, verify
  `meta[property="og:title"]` and `meta[property="og:type"]` are
  present.

### TC-1101 — Robots: `/robots.txt` declares the sitemap
- Fetch `/robots.txt`.
- Verify it contains a `Sitemap:` directive pointing at
  `/sitemap.xml`.

### TC-1102 — Sitemap: `/sitemap.xml` is well-formed XML and lists `/`
- Fetch `/sitemap.xml`.
- Verify content-type is XML and the body contains
  `https://www.orientsoftware.com/`.

### TC-1201 — 404: an unknown URL renders a not-found page
- Open `/this-page-does-not-exist-qa-test/`.
- Verify HTTP status is 404 and the body shows a not-found indicator
  (title or H1 contains "404" / "not found").
