# River Side Herald – Testing Guide

Next.js 16 news platform. Consumes Django API for articles, businesses, site settings, and auth.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Django backend running at `http://localhost:8000`

### Run the App Locally

```bash
cd river-side-herald
npm install

# Create .env.local for local backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
echo "NEXT_PUBLIC_COMPANY_SLUG=riverside-herald" >> .env.local

npm run dev
```

- Home: http://localhost:3000
- Admin: http://localhost:3000/admin
- Articles: http://localhost:3000/articles

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Django API base URL |
| `NEXT_PUBLIC_COMPANY_SLUG` | `riverside-herald` | Company slug for auth and news |
| `NEXT_PUBLIC_DEFAULT_COMPANY_ID` | (optional) | Fallback company ID for server-side requests |

---

## Variable Alignment (Django API)

| Item | Value |
|------|-------|
| Company slug | `riverside-herald` |
| Auth storage keys | `auth_token`, `refresh_token`, `company_id` |
| Login request | `{ username, password, company_slug }` |
| Login response | `{ access, refresh, user, company }` |
| Register response (user/business) | `{ tokens: { access, refresh }, user, company }` |
| Register request (author) | `{ email, password, first_name, last_name, role?: 'author' }` |
| Register request (business) | `{ email, password, company_name, company_email, first_name, last_name }` |

---

## Unit Tests (Vitest)

```bash
cd river-side-herald
npm run test           # Run unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # Run with coverage report
```

### Coverage Reports

- **Text**: Printed to terminal
- **HTML**: `coverage/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI tools)

### Test Structure

```
river-side-herald/
├── vitest.config.ts
├── src/
│   ├── test/
│   │   └── setup.ts          # @testing-library/jest-dom, localStorage reset
│   └── lib/
│       ├── api.ts
│       └── api.test.ts       # authApi.login, register, logout, request headers
```

### What to Test

- `src/lib/api.test.ts` – API client, auth flows, token storage
- Client components with `@testing-library/react`
- Mock `fetch` or API clients for pages that fetch from Django

---

## Integration Testing

### Recommended Tools

- **Vitest** + React Testing Library
- Mock `next/navigation`, `next/headers`, and API clients

### What to Test

- Client components with `@testing-library/react`
- Server components by rendering
- Mock `serverNewsApi` and `newsApi` for pages that fetch from Django

---

## End-to-End Testing

### Recommended Tool

**Cypress**. See [docs/CYPRESS_GUIDE.md](../docs/CYPRESS_GUIDE.md) for setup and best practices.

### Prerequisites

- Django running at `http://localhost:8000`
- Riverside Herald company and test user

### Seed Django Test Data

From the `django-crm` directory, run:

```bash
cd django-crm
python manage.py seed_riverside_herald_e2e
```

This creates:
- **Riverside Herald company** (slug: `riverside-herald`) if not exists
- **Test user**: `testuser` / `testpass` (for login E2E tests)
- **News profile** (author role) for test user

### Run E2E Tests

1. Start Django: `python manage.py runserver 8000`
2. Start Next.js: `cd river-side-herald && npm run dev:e2e` (port 3000)
   - Use `dev:e2e` so the app uses `http://localhost:8000/api` (required for login/profile tests)
   - Or set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `.env.local` and run `npm run dev`
3. Run Cypress:
   ```bash
   cd river-side-herald
   npm run test:e2e
   ```
   Or open Cypress UI: `npm run test:e2e:open`

### E2E Environment Variables

- `CYPRESS_TEST_USER` (default: testuser)
- `CYPRESS_TEST_PASSWORD` (default: testpass)

### Critical Flows to Test

- Auth: login, logout, token refresh
- Article list and detail
- Admin: create/edit article, manage site settings
- Business directory
- Role-based access: editor vs admin vs business_owner redirects

### Cypress Config

Use `baseUrl: 'http://localhost:3000'` in `cypress.config.js`.

### data-cy Attributes

| Attribute | Location |
|-----------|----------|
| `login-username` | Login form username input |
| `login-password` | Login form password input |
| `login-submit` | Login submit button |
| `register-first-name` | SignUp form first name |
| `register-last-name` | SignUp form last name |
| `register-email` | SignUp form email |
| `register-password` | SignUp form password |
| `register-submit` | SignUp submit button |

---

## Best Testing Practices

- Same Next.js practices as past-and-present; use `data-cy` for stable selectors; log in via `cy.request()` + `cy.session()` for speed; use `beforeEach` for shared setup, not `afterEach` for cleanup
- **Test admin flows**: login as admin, create/edit article, manage site settings
- **Test role-based access**: editor vs admin vs business_owner; verify redirects
- **Mock `serverNewsApi` and `newsApi`** for integration tests
- **E2E**: test article creation, business directory, profile, admin settings

---

## Learning Focus

- Next.js App Router testing
- Server vs client components
- Mocking `next/navigation` and `next/headers`
- Role-based access testing
- News platform flows (articles, businesses, site settings)

---

## Suggested Test Order

1. Add Vitest/Jest + RTL; test one client component
2. Mock API and test a page that fetches data
3. Add Cypress; test login flow
4. Add E2E for article list and detail
5. Add E2E for admin (articles, site settings)
6. Add role-based access tests
