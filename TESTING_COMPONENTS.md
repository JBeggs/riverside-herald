# River Side Herald – Testing Components

Component inventory and testing structure. See [docs/TESTING_COMPONENTS.md](../docs/TESTING_COMPONENTS.md) for ecosystem overview.

---

## Component Inventory

### Lib

| Module | Path | Test Status |
|--------|------|-------------|
| api | src/lib/api.ts | Tested (api.test.ts) |
| api-server | src/lib/api-server.ts | Not tested |
| types | src/lib/types.ts | Not tested |
| validation | src/lib/validation.ts | Not tested |
| image-utils | src/lib/image-utils.ts | Not tested |
| enhanced-types | src/lib/enhanced-types.ts | Not tested |
| business-products | src/lib/business-products.ts | Not tested |
| supabase | src/lib/supabase.ts | Not tested |
| supabase-server | src/lib/supabase-server.ts | Not tested |

### Contexts

| Context | Path | Test Status |
|---------|------|-------------|
| AuthContext | src/contexts/AuthContext.tsx | Not tested |
| ToastContext | src/contexts/ToastContext.tsx | Not tested |

### Auth Components

| Component | Path | Test Status |
|-----------|------|-------------|
| LoginForm | src/components/auth/LoginForm.tsx | E2E only |
| SignUpForm | src/components/auth/SignUpForm.tsx | E2E only |
| AuthButton | src/components/auth/AuthButton.tsx | Not tested |
| AuthModal | src/components/auth/AuthModal.tsx | Not tested |
| AuthMessage | src/components/auth/AuthMessage.tsx | Not tested |

### Layout Components

| Component | Path | Test Status |
|-----------|------|-------------|
| Header | src/components/layout/Header.tsx | Not tested |
| ClientHeader | src/components/layout/ClientHeader.tsx | Not tested |
| MobileNav | src/components/layout/MobileNav.tsx | Not tested |
| Footer | src/components/layout/Footer.tsx | Not tested |
| FooterClient | src/components/layout/FooterClient.tsx | Not tested |

### Articles Components

| Component | Path | Test Status |
|-----------|------|-------------|
| ArticleCard | src/components/ui/ArticleCard.tsx | Not tested |
| ArticleEditor | src/components/articles/ArticleEditor.tsx | Not tested |
| ArticleEditorModal | src/components/articles/ArticleEditorModal.tsx | Not tested |
| EnhancedArticleEditor | src/components/articles/EnhancedArticleEditor.tsx | Not tested |
| RelatedArticles | src/components/articles/RelatedArticles.tsx | Not tested |
| ShareButtons | src/components/articles/ShareButtons.tsx | Not tested |
| BusinessLinkedArticleCreator | src/components/articles/BusinessLinkedArticleCreator.tsx | Not tested |

### Business Components

| Component | Path | Test Status |
|-----------|------|-------------|
| BusinessSearchAndFilter | src/components/businesses/BusinessSearchAndFilter.tsx | Not tested |
| BusinessCreationWizard | src/components/businesses/BusinessCreationWizard.tsx | Not tested |
| BusinessEditModal | src/components/businesses/BusinessEditModal.tsx | Not tested |
| BusinessEditButton | src/components/businesses/BusinessEditButton.tsx | Not tested |
| FeaturedBusinessCard | src/components/businesses/FeaturedBusinessCard.tsx | Not tested |
| ProductPreview | src/components/businesses/ProductPreview.tsx | Not tested |
| ProductGallery | src/components/businesses/ProductGallery.tsx | Not tested |
| BusinessAuthModal | src/components/businesses/BusinessAuthModal.tsx | Not tested |

### Dashboard Components

| Component | Path | Test Status |
|-----------|------|-------------|
| DashboardOverview | src/components/dashboard/DashboardOverview.tsx | Not tested |
| DashboardLayout | src/components/dashboard/DashboardLayout.tsx | Not tested |
| ArticlesList | src/components/dashboard/ArticlesList.tsx | Not tested |
| CategoryManager | src/components/dashboard/CategoryManager.tsx | Not tested |

### Profile Components

| Component | Path | Test Status |
|-----------|------|-------------|
| ProfilePage | src/components/profile/ProfilePage.tsx | Not tested |
| AdminSection | src/components/profile/AdminSection.tsx | Not tested |
| BusinessOwnerSection | src/components/profile/BusinessOwnerSection.tsx | Not tested |
| PersonalInfoSection | src/components/profile/PersonalInfoSection.tsx | Not tested |
| SubscriberSection | src/components/profile/SubscriberSection.tsx | Not tested |
| NotificationSettings | src/components/profile/NotificationSettings.tsx | Not tested |
| AuthorDashboard | src/components/profile/AuthorDashboard.tsx | Not tested |

### Admin / Media

| Component | Path | Test Status |
|-----------|------|-------------|
| MediaLibrary | src/components/admin/MediaLibrary.tsx | Not tested |
| MediaPicker | src/components/media/MediaPicker.tsx | Not tested |

### UI

| Component | Path | Test Status |
|-----------|------|-------------|
| Toast | src/components/ui/Toast.tsx | Not tested |
| RegistrationButtons | src/components/features/RegistrationButtons.tsx | Not tested |

---

## Test Coverage Status

| Type | Exists | Gaps |
|------|--------|------|
| Unit | api.test.ts | validation, image-utils, contexts |
| Integration | None | AuthContext, ToastContext |
| E2E | login.cy.js | register, articles, admin, businesses |

---

## Component-to-Test Mapping

| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| api.ts | Yes | - | - |
| AuthContext | - | Add | - |
| ToastContext | - | Add | - |
| LoginForm | Add (mocked signIn) | - | Yes |
| SignUpForm | Add (mocked signUp) | - | Add |
| ArticleEditor, EnhancedArticleEditor | Add | - | Add (admin) |
| BusinessCreationWizard, BusinessEditModal | Add | - | Add |
| DashboardOverview, ArticlesList | - | Add (mocked API) | Add |
| ProfilePage, AdminSection | - | - | Add (role-based) |

---

## data-cy Registry

| Selector | Location |
|----------|----------|
| login-username | LoginForm |
| login-password | LoginForm |
| login-submit | LoginForm |
| register-first-name | SignUpForm |
| register-last-name | SignUpForm |
| register-email | SignUpForm |
| register-password | SignUpForm |
| register-submit | SignUpForm |

---

## Test File Layout

```
river-side-herald/
├── src/
│   ├── test/setup.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── api.test.ts
│   ├── contexts/
│   │   └── AuthContext.tsx  (add AuthContext.test.tsx)
│   └── components/
│       └── auth/
│           └── LoginForm.tsx  (add LoginForm.test.tsx)
├── cypress/
│   ├── config.js
│   ├── support/e2e.js
│   └── e2e/
│       ├── login.cy.js
│       └── register.cy.js  (add)
└── vitest.config.ts
```
