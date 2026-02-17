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

npm run dev
```

- Home: http://localhost:3000
- Admin: http://localhost:3000/admin
- Articles: http://localhost:3000/articles

---

## Integration Testing

### Recommended Tools

- **Vitest** or **Jest** + React Testing Library
- Mock `next/navigation`, `next/headers`, and API clients

### What to Test

- Client components with `@testing-library/react`
- Server components by rendering (run in Node)
- Mock `serverNewsApi` and `newsApi` for pages that fetch from Django

### Example Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
# or: npm install -D jest jest-environment-jsdom @testing-library/react
```

---

## End-to-End Testing

### Recommended Tool

**Cypress**. See [docs/CYPRESS_GUIDE.md](../docs/CYPRESS_GUIDE.md) for setup and best practices.

### Prerequisites

- Django running at `http://localhost:8000`
- Riverside Herald company and test users (admin, editor, business_owner)

### Critical Flows to Test

- Auth: login, logout, token refresh
- Article list and detail
- Admin: create/edit article, manage site settings
- Business directory
- Role-based access: editor vs admin vs business_owner redirects

### Cypress Config

Use `baseUrl: 'http://localhost:3000'` in `cypress.config.js`.

---

## Best Testing Practices

- Same Next.js practices as past-and-present; add news-specific flows
- **Test admin flows**: login as admin, create/edit article, manage site settings
- **Test role-based access**: editor vs admin vs business_owner; verify redirects
- **Mock `serverNewsApi` and `newsApi`** for integration tests
- **E2E**: test article creation, business directory, profile, admin settings
- **Use `baseUrl`** in Cypress config for cleaner paths; use `data-cy` for stable selectors; log in via `cy.request()` + `cy.session()` for speed; use `beforeEach` for shared setup, not `afterEach` for cleanup
- **Test auth flow** (login, logout, token refresh) as a critical path

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
