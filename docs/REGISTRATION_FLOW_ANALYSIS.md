# Registration Flow Analysis

## What Registration Does

### When `company_name` is PROVIDED (Business Registration):

1. **Creates User Account** ✅
   - Creates Django `User` with provided email, password, username
   - Sets first_name and last_name if provided

2. **Creates EcommerceCompany** ✅
   - Creates new `EcommerceCompany` record
   - Sets user as `owner` of the company
   - Company status: `'trial'` (pending approval)
   - Company plan: `'free'`
   - Generates unique slug from company name

3. **Creates News Profile** ✅
   - Creates `Profile` record in `news` app
   - Role: `'author'` (so they can create content)
   - `is_verified`: `False`

4. **Creates Registration Deal** ✅
   - Creates a CRM `Deal` for the registration
   - Links deal to company via `registration_deal` field

5. **Sends Notifications** ✅
   - Sends FCM notifications to staff
   - Creates staff message about new registration

6. **Does NOT Create Business Record** ❌
   - **NO `Business` record is created in the `news` app**
   - The `Business` model is separate from `EcommerceCompany`
   - Users must manually create a business listing after registration

### When `company_name` is NOT PROVIDED (User Registration):

1. **Creates User Account** ✅
   - Creates Django `User`

2. **Connects to Riverside Herald Company** ✅
   - Finds or creates "Riverside Herald" `EcommerceCompany`
   - Adds user as member of that company

3. **Creates News Profile** ✅
   - Creates `Profile` with role `'user'` (default)
   - `is_verified`: `False`

4. **Does NOT Create Business Record** ❌
   - Regular users don't get businesses

## Summary

**Registration creates:**
- ✅ User account
- ✅ EcommerceCompany (or connects to existing)
- ✅ News Profile
- ✅ Registration Deal (for business registrations)

**Registration does NOT create:**
- ❌ Business record (in `news.Business` model)
- ❌ Business listing

## Business Creation Flow

After registration, business owners need to:
1. Log in
2. Navigate to `/businesses/add` (or profile page)
3. Fill out business creation form
4. Submit to create `Business` record

The `Business` record is separate from `EcommerceCompany`:
- `EcommerceCompany`: Multi-tenancy company (for the platform)
- `Business`: Business directory listing (for the news site)

## Recommendation

Consider auto-creating a `Business` record when a business registers:
- Use company name as business name
- Use company details as business details
- Set owner to the registering user
- This would streamline the onboarding process

