# Frontend API Conversion Progress

## Status: In Progress ⚠️

Converting Next.js frontend from Supabase to Django REST API.

---

## ✅ Completed

### Backend
- [x] Added Profile endpoint (`/api/news/profiles/me/`)
- [x] Added Stats endpoint (`/api/news/stats/dashboard/`)
- [x] All core endpoints implemented and tested

### Frontend Infrastructure
- [x] Created API client (`src/lib/api.ts`) - Client-side API client
- [x] Created Server API client (`src/lib/api-server.ts`) - Server-side API client
- [x] Updated AuthContext to use Django JWT authentication
- [x] Removed Supabase auth dependencies from AuthContext

### Pages Converted
- [x] Homepage (`src/app/page.tsx`) - ✅ Converted to use `serverNewsApi`
- [x] Articles List (`src/app/articles/page.tsx`) - ✅ Converted
- [x] Businesses List (`src/app/businesses/page.tsx`) - ✅ Converted
- [x] Article Detail (`src/app/articles/[slug]/page.tsx`) - ✅ Converted

---

## 🔄 In Progress

### Pages Remaining
- [ ] Business Detail (`src/app/businesses/[slug]/page.tsx`)
- [ ] Profile Page (`src/app/profile/page.tsx`)
- [ ] Dynamic Pages (`src/app/[slug]/page.tsx`)

### Components Remaining
- [ ] Header (`src/components/layout/Header.tsx`)
- [ ] Footer (`src/components/layout/Footer.tsx`)
- [ ] ArticleEditor (`src/components/articles/ArticleEditor.tsx`)
- [ ] EnhancedArticleEditor (`src/components/articles/EnhancedArticleEditor.tsx`)
- [ ] RelatedArticles (`src/components/articles/RelatedArticles.tsx`)
- [ ] BusinessEditModal (`src/components/businesses/BusinessEditModal.tsx`)
- [ ] BusinessEditButton (`src/components/businesses/BusinessEditButton.tsx`)
- [ ] BusinessAuthModal (`src/components/businesses/BusinessAuthModal.tsx`)
- [ ] BusinessSearchAndFilter (`src/components/businesses/BusinessSearchAndFilter.tsx`)
- [ ] ProfilePage (`src/components/profile/ProfilePage.tsx`)
- [ ] All profile sub-components

### Infrastructure Remaining
- [ ] Update middleware (`src/middleware.ts`) - Remove Supabase auth checks
- [ ] Update environment variables documentation
- [ ] Remove Supabase dependencies from package.json (optional)

---

## 📋 Conversion Checklist

### For Each File:

1. **Replace Supabase imports:**
   ```typescript
   // OLD
   import { createClient } from '@/lib/supabase-server'
   const supabase = await createClient()
   
   // NEW
   import { serverNewsApi } from '@/lib/api-server'
   // or for client components:
   import { newsApi } from '@/lib/api'
   ```

2. **Replace Supabase queries:**
   ```typescript
   // OLD
   const { data } = await supabase
     .from('articles')
     .select('*')
     .eq('status', 'published')
   
   // NEW
   const data = await serverNewsApi.articles.list({ status: 'published' })
   ```

3. **Update data transformations:**
   - API returns different structure (nested objects vs joins)
   - Handle pagination (`results` array vs direct array)
   - Map field names if different

4. **Update authentication:**
   ```typescript
   // OLD
   const { data: { user } } = await supabase.auth.getUser()
   
   // NEW
   import { useAuth } from '@/contexts/AuthContext'
   const { user } = useAuth()
   ```

---

## 🔑 Key Differences

### Data Structure
- **Supabase**: Returns data directly from `.select()`
- **Django API**: Returns paginated results with `results` array (if paginated) or direct array

### Authentication
- **Supabase**: `supabase.auth.getUser()` for server components
- **Django API**: JWT token in `Authorization` header, company ID in `X-Company-Id` header

### Error Handling
- **Supabase**: `{ data, error }` pattern
- **Django API**: Throws exceptions, catch with try/catch

### Field Names
- Some field names may differ (e.g., `author_id` vs `author`)
- Nested relationships handled differently

---

## 🚨 Important Notes

1. **Company Context Required**: All tenant-scoped endpoints need `X-Company-Id` header
   - Set via `apiClient.setCompanyId(companyId)`
   - Retrieved from login/registration response
   - Stored in localStorage

2. **Server vs Client Components**:
   - Server Components: Use `serverNewsApi` from `api-server.ts`
   - Client Components: Use `newsApi` from `api.ts`
   - Auth Context: Use `useAuth()` hook

3. **Pagination**: API may return paginated results
   ```typescript
   const response = await serverNewsApi.articles.list()
   const articles = response.results || response // Handle both cases
   ```

4. **Image URLs**: 
   - Media objects have `file_url` property
   - May need to handle missing images with fallbacks

---

## 📝 Next Steps

1. Continue converting remaining pages
2. Convert all components
3. Update middleware
4. Test all functionality
5. Remove Supabase dependencies (optional)
6. Update environment variables

---

## 🐛 Known Issues

- Profile endpoint may need adjustment for user data structure
- Some nested relationships may need additional API calls
- Image handling may need updates for media objects

---

*Last updated: [Current Date]*

