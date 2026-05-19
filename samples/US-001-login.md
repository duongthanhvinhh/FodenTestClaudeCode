# US-001 — User Login

**Project:** SauceDemo Storefront
**Epic:** Authentication
**Story points:** 3
**Assignee:** _unassigned_
**Reporter:** product@example.com
**Status:** Ready for QA
**Component:** Web / Frontend
**Labels:** auth, login, web

---

## User Story

**As a** registered customer
**I want to** sign in to the storefront with my username and password
**So that** I can browse products, manage my cart, and place orders.

## Acceptance Criteria

**AC-1 — Valid credentials**
- Given I am on the login page (`/`)
- When I enter a valid username and password and submit
- Then I am taken to the inventory page (`/inventory.html`)
- And the page title contains "Swag Labs"

**AC-2 — Invalid credentials**
- Given I am on the login page
- When I enter an unknown username or wrong password and submit
- Then I remain on the login page
- And I see the error: "Epic sadface: Username and password do not match any user in this service"

**AC-3 — Locked-out user**
- Given I am on the login page
- When I enter the credentials of a locked-out user and submit
- Then I remain on the login page
- And I see the error: "Epic sadface: Sorry, this user has been locked out."

**AC-4 — Missing username**
- Given I am on the login page
- When I submit the form with the username field empty
- Then I see the error: "Epic sadface: Username is required"

**AC-5 — Missing password**
- Given I am on the login page with a username entered
- When I submit the form with the password field empty
- Then I see the error: "Epic sadface: Password is required"

## Test Environment

- **URL:** https://www.saucedemo.com
- **Browsers:** Chromium (CI), Chrome / Edge (manual)
- **Users:** `standard_user`, `locked_out_user`
- **Password:** `secret_sauce`

## Out of Scope

- Password reset flow (separate story)
- Social login (not implemented)
- Session timeout behaviour (covered by US-005)
