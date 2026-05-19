/**
 * Catalog of Orient Software pages exercised by US-003 site coverage tests.
 *
 * Each entry pairs a URL path with the H1 substring expected on the
 * rendered page. The H1 check is a `contains` match (case-insensitive)
 * because the site occasionally tweaks marketing copy.
 */

export const ORIENT_BASE_URL = 'https://www.orientsoftware.com';

export type CatalogEntry = {
  /** Short identifier used as the test name suffix. */
  id: string;
  /** Absolute URL path including trailing slash. */
  path: string;
  /** Case-insensitive substring expected in the page H1. */
  h1Contains: string;
  /**
   * Whether the page satisfies strict SEO checks (canonical present,
   * meta description ≥ 30 chars). `/careers/` is currently a known
   * outlier — title-only meta description, no canonical — so it is
   * excluded from the SEO sweep.
   */
  strictSeo?: boolean;
};

export const SITE_CATALOG: CatalogEntry[] = [
  { id: 'home',                 path: '/',                                                          h1Contains: 'software' },
  { id: 'services-hub',         path: '/services/',                                                 h1Contains: 'software' },
  { id: 'svc-custom',           path: '/services/software-development/custom/',                     h1Contains: 'custom' },
  { id: 'svc-dedicated',        path: '/services/software-development/dedicated-teams/',            h1Contains: 'dedicated' },
  { id: 'svc-outsourcing',      path: '/services/software-development/outsourcing/',                h1Contains: 'outsourc' },
  { id: 'svc-offshore',         path: '/services/software-development/offshore/',                   h1Contains: 'offshore' },
  { id: 'svc-web',              path: '/services/web-development/application/',                     h1Contains: 'web' },
  { id: 'svc-mobile',           path: '/services/application-development/mobile/',                  h1Contains: 'mobile' },
  { id: 'svc-maintenance',      path: '/services/application-development/support-and-maintenance/', h1Contains: 'maintenance' },
  { id: 'svc-uiux',             path: '/services/ui-ux-design/',                                    h1Contains: 'design' },
  { id: 'svc-qa',               path: '/services/qa-and-software-testing/',                         h1Contains: 'qa' },
  { id: 'svc-cloud',            path: '/services/cloud-computing/',                                 h1Contains: 'cloud' },
  { id: 'svc-data-ai',          path: '/services/data-and-ai/',                                     h1Contains: 'data' },
  { id: 'svc-ai',               path: '/services/artificial-intelligence/',                         h1Contains: 'ai' },
  { id: 'svc-ml',               path: '/services/machine-learning/',                                h1Contains: 'machine learning' },
  { id: 'svc-iot',              path: '/services/internet-of-things/',                              h1Contains: 'things' },
  { id: 'svc-staff-aug',        path: '/services/it-staff-augmentation/',                           h1Contains: 'staff' },
  { id: 'svc-project-based',    path: '/services/project-based-delivery/',                          h1Contains: 'project' },
  { id: 'technologies',         path: '/technologies/',                                             h1Contains: 'technolog' },
  { id: 'who-we-are',           path: '/who-we-are/',                                               h1Contains: 'we are' },
  { id: 'how-we-work',          path: '/how-we-work/',                                              h1Contains: 'software' },
  { id: 'why-partner',          path: '/why-partner-with-us/',                                      h1Contains: 'orient' },
  { id: 'case-studies',         path: '/case-studies/',                                             h1Contains: 'case' },
  { id: 'news',                 path: '/news/',                                                     h1Contains: 'news' },
  { id: 'blog',                 path: '/blog/',                                                     h1Contains: 'insights' },
  { id: 'careers',              path: '/careers/',                                                  h1Contains: 'team',     strictSeo: false },
  { id: 'contact',              path: '/contact/',                                                  h1Contains: 'touch' },
  { id: 'terms',                path: '/terms-of-use/',                                             h1Contains: 'terms' },
  { id: 'privacy',              path: '/privacy-statement/',                                        h1Contains: 'privacy' },
  { id: 'outsourcing-faq',      path: '/software-outsourcing/faq/',                                 h1Contains: 'faq' },
];

/** Subset of catalog entries that should pass strict SEO checks. */
export const SEO_CATALOG: CatalogEntry[] = SITE_CATALOG.filter(e => e.strictSeo !== false);

/** Technology hub: technologies expected to be linked from `/technologies/`. */
export const EXPECTED_TECHNOLOGIES: readonly string[] = [
  'React',
  'Angular',
  'Vue.js',
  '.NET',
  'Java',
  'PHP',
  'Python',
  'Node.js',
  'Ruby',
  'Golang',
];

/**
 * Services hub: substrings that must each appear at least once in the
 * page body. The hub uses narrative copy and "Learn more" CTAs rather
 * than named service links, so we assert on text content rather than
 * link anchors.
 */
export const EXPECTED_SERVICES_ON_HUB: readonly string[] = [
  'Software Development',
  'Mobile',
  'Cloud',
  'Data',
  'QA',
  'UI/UX',
];

/** Blog top-level categories. */
export const BLOG_CATEGORIES: readonly string[] = [
  'Software Development',
  'AI & Data',
  'Business Innovation',
  'Staffing & Outsourcing',
];

/** Office headings expected on `/contact/`. */
export const CONTACT_OFFICES: readonly string[] = [
  'Etown',
  'Tan My',
  'Da Nang',
  'Ha Noi',
  'Hue',
  'Tokyo',
  'Singapore',
];
