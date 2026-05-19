/**
 * Shared test data. Per-user-story data may live alongside the spec, but
 * credentials and reusable constants belong here so they're sourced from
 * one place and can be swapped via env vars in CI.
 */
export const users = {
  standard: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: process.env.PASSWORD ?? 'secret_sauce',
  },
  locked: {
    username: process.env.LOCKED_USER ?? 'locked_out_user',
    password: process.env.PASSWORD ?? 'secret_sauce',
  },
  problem: {
    username: process.env.PROBLEM_USER ?? 'problem_user',
    password: process.env.PASSWORD ?? 'secret_sauce',
  },
  invalid: {
    username: 'no_such_user',
    password: 'wrong_password',
  },
} as const;
