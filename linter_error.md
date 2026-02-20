# River Side Herald – Linter Error Fix Plan

**Total: ~494 issues** (currently all warnings; plan to fix and optionally re-enable as errors)

---

## Summary by Rule Type

| Rule | Count | Effort | Priority |
|------|-------|--------|----------|
| `@typescript-eslint/no-explicit-any` | 304 | High | P2 |
| `@typescript-eslint/no-unused-vars` | 119 | Low | P1 |
| `react/no-unescaped-entities` | 33 | Low | P1 |
| `@next/next/no-img-element` | 14 | Medium | P2 |
| `react-hooks/exhaustive-deps` | 11 | Medium | P2 |
| `prefer-const` | 4 | Low | P1 |
| `@next/next/no-html-link-for-pages` | 4 | Low | P1 |
| `react-hooks/error-boundaries` | 3 | Medium | P2 |
| `react-hooks/set-state-in-effect` | 2 | Medium | P2 |

---

## Phase 1: Quick Wins (~160 issues, ~2–4 hours)

### 1.1 `@typescript-eslint/no-unused-vars` (119)

**Action:** Remove or prefix with `_`.

- **Unused imports:** Delete them.
- **Unused variables:** Remove or rename to `_var`, `_error`, etc.
- **Unused function params:** Rename to `_param` or omit if allowed.

**Files (high count):**
- `scripts/reset-database.ts` (8)
- `scripts/clear-*`, `scripts/add-*` (multiple)
- `src/components/profile/*`, `src/components/dashboard/*`
- Git scripts: `commit_push.js`, `merge_to_main.js`, `new_branch.js` – change `catch (_)` to `catch (_err)` or use `argsIgnorePattern` for `_`

### 1.2 `react/no-unescaped-entities` (33)

**Action:** Escape quotes in JSX.

- `'` → `&apos;` or `{'`'}`
- `"` → `&quot;` or `{'"'}`

**Files:** `RegistrationButtons.tsx`, `CategoryManager.tsx`, `NotificationSettings.tsx`, `BusinessSearchAndFilter.tsx`, `LoginForm.tsx`, `not-found.tsx` variants, etc.

### 1.3 `prefer-const` (4)

**Action:** Change `let` to `const` where not reassigned.

**Files:**
- `scripts/add-fambri-farms.ts`, `add-paddle-power.ts`, `add-rusty-feather.ts` – `foundImages`
- `scripts/add-test-users.ts` – `totalCount`

### 1.4 `@next/next/no-html-link-for-pages` (4)

**Action:** Replace `<a href="/path">` with `<Link href="/path">` for internal routes.

**Files:** Search for `<a href="/` in components.

---

## Phase 2: Medium Effort (~35 issues, ~4–8 hours)

### 2.1 `@next/next/no-img-element` (14)

**Action:** Replace `<img>` with Next.js `<Image />`.

**Files:**
- `BusinessEditModal.tsx`, `ArticlesList.tsx`, `ArticleCard.tsx`
- `BusinessOwnerSection.tsx`, `PersonalInfoSection.tsx`, `ProfilePage.tsx`
- `MediaPicker.tsx`, `DashboardOverview.tsx`

**Notes:** Add `width`/`height` or `fill`; use `unoptimized` for external URLs if needed.

### 2.2 `react-hooks/exhaustive-deps` (11)

**Action:** Fix dependency arrays.

- Add missing deps, or
- Wrap callbacks in `useCallback` and add to deps, or
- Add `// eslint-disable-next-line` with a short comment if the omission is intentional.

**Files:**
- `admin/articles/[slug]/page.tsx`, `admin/articles/page.tsx`, `admin/businesses/page.tsx`
- `CategoryManager.tsx`, `DashboardOverview.tsx`, `BusinessEditButton.tsx`, `BusinessEditModal.tsx`
- `cart/page.tsx` (if present)

### 2.3 `react-hooks/error-boundaries` (3)

**Action:** Move JSX out of try/catch; use error boundaries for render errors.

**File:** `src/app/admin/categories/page.tsx`

- Move data loading into the try block; return JSX outside.
- Or wrap the component tree in an error boundary.

### 2.4 `react-hooks/set-state-in-effect` (2)

**Action:** Avoid synchronous `setState` in `useEffect`.

**File:** `src/components/auth/AuthModal.tsx` (line 21)

- Use `isOpen` to derive initial mode instead of `setMode` in effect, or
- Use a key to reset when modal opens.

---

## Phase 3: High Effort – Replace `any` (304 issues, ~1–2 days)

### 3.1 Strategy

1. **Shared types first:** `src/lib/types.ts`, `enhanced-types.ts`, `validation.ts`
2. **API layer:** `src/lib/api.ts`, `api-server.ts` – use `Record<string, unknown>` or specific DTOs
3. **Components:** Replace `any` with props interfaces, `unknown`, or `Record<string, unknown>` where appropriate

### 3.2 Files by Area

**Core types (fix first):**
- `src/lib/types.ts` – 8
- `src/lib/enhanced-types.ts` – 7
- `src/lib/validation.ts` – 1

**API layer:**
- `src/lib/api.ts` – ~40
- `src/lib/api-server.ts` – ~25

**Components (by directory):**
- `src/components/businesses/` – BusinessEditModal, BusinessCreationWizard, etc.
- `src/components/dashboard/` – ArticlesList, CategoryManager, DashboardOverview
- `src/components/profile/` – ProfilePage, PersonalInfoSection, etc.
- `src/components/auth/` – LoginForm, SignUpForm
- `src/components/layout/` – Footer, Header
- `src/components/ui/` – ArticleCard
- `src/contexts/` – AuthContext

**App pages:**
- `src/app/admin/*` – admin pages
- `src/app/articles/*`, `src/app/businesses/*`
- `src/app/profile/page.tsx`, `src/app/page.tsx`, etc.

**Scripts & tests:**
- `scripts/*.ts` – use `unknown` or specific types for API responses
- `src/lib/api.test.ts`, `image-utils.test.ts`

### 3.3 Common Replacements

| Context | Replace `any` with |
|---------|--------------------|
| API response | `unknown` or typed interface |
| API payload | `Record<string, unknown>` or DTO |
| Error in catch | `unknown` (then narrow with `instanceof Error`) |
| Event handler | `React.ChangeEvent<HTMLInputElement>` etc. |
| Generic callback | `(item: unknown)` or proper type |
| JSON parse result | `unknown` |

---

## Suggested Order of Work

1. **Phase 1.1** – Unused vars (scripts + components)
2. **Phase 1.2–1.4** – Entities, prefer-const, Link
3. **Phase 2.3, 2.4** – Error boundaries, set-state-in-effect (2–3 files)
4. **Phase 2.1** – `Image` component (14 files)
5. **Phase 2.2** – `exhaustive-deps` (11 files)
6. **Phase 3** – Replace `any` in batches (types → api → components)

---

## Automation

- `npm run lint -- --fix` – fixes 4 auto-fixable issues
- Consider `// eslint-disable-next-line` only for rare, justified cases
- Prefer fixing the root cause over disabling rules

---

## Files Overview (74 files)

- **Scripts:** 18 files
- **App routes:** 18 files
- **Components:** 28 files
- **Lib/contexts:** 10 files

---

## After Fixes

When all issues are resolved, you can optionally:

1. Change rules from `'warn'` to `'error'` in `eslint.config.mjs`
2. Add a CI step that fails on new lint issues
3. Use `npm run lint` in pre-commit hooks
