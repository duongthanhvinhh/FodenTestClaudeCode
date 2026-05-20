/**
 * OrangeHRM shared test data and configuration.
 *
 * The OrangeHRM specs always target an absolute URL via the page-object
 * `open()` methods, so they are not affected by the global `baseURL`
 * defined in playwright.config.ts.
 */
export const orangeHrm = {
  baseURL: process.env.ORANGEHRM_URL ?? 'https://opensource-demo.orangehrmlive.com',
  paths: {
    login: '/web/index.php/auth/login',
    dashboard: '/web/index.php/dashboard/index',
    forgotPassword: '/web/index.php/auth/requestPasswordResetCode',
    adminUsers: '/web/index.php/admin/viewSystemUsers',
    addUser: '/web/index.php/admin/saveSystemUser',
  },
  admin: {
    username: process.env.ORANGEHRM_ADMIN_USER ?? 'Admin',
    password: process.env.ORANGEHRM_ADMIN_PASS ?? 'admin123',
  },
  invalid: {
    username: 'WrongUser_xyz',
    password: 'wrongPass_xyz',
  },
  messages: {
    invalidCredentials: 'Invalid credentials',
    required: 'Required',
    alreadyExists: 'Already exists',
    passwordsDoNotMatch: 'Passwords do not match',
    minPasswordChars: 'Should have at least 8 characters',
    invalid: 'Invalid',
  },
  // An employee name prefix that reliably yields autocomplete suggestions on
  // the OrangeHRM demo seed data — "Linda Anderson Jr." is one of the canonical
  // demo employees.
  employeePickerPrefix: 'Linda',
} as const;

/**
 * Generate a unique test username — combines timestamp and random suffix to
 * keep concurrent workers (and other testers on the public demo) clear of
 * each other.
 */
export function uniqueUsername(prefix: string = 'qa'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
