# Dashboard Troubleshooting Guide

## Common Issues and Solutions

### 1. 404 Errors on Dashboard/Profile

**Symptoms:**
- `Error loading dashboard: HTTP 404`
- `Error fetching profile: HTTP 404`

**Root Causes:**
1. **Missing Company ID**: The backend requires `X-Company-Id` header for most endpoints
2. **User not logged in**: Auth token missing or invalid
3. **Profile doesn't exist**: User hasn't been created in the system

**Solutions:**

#### A. Set Default Company ID
Add to `.env.local`:
```env
NEXT_PUBLIC_DEFAULT_COMPANY_ID=<your-company-id>
```

To find your company ID:
```bash
cd django-crm
python manage.py shell
>>> from ecommerce.models import EcommerceCompany
>>> company = EcommerceCompany.objects.filter(name__icontains='riverside').first()
>>> print(company.id)
```

#### B. Ensure User is Logged In
- Check browser cookies for `auth_token`
- Verify token is valid by checking Django admin or API

#### C. Create User Profile
Run the seed command:
```bash
cd django-crm
python manage.py create_riverside_herald_user
```

### 2. Site Settings 404 Errors

**Solution:**
- Site settings now allow public read access
- Still requires `X-Company-Id` header
- Set `NEXT_PUBLIC_DEFAULT_COMPANY_ID` in `.env.local`

### 3. Stats Endpoint 404

**Requirements:**
- User must be admin or editor
- User must have a profile with role set
- Company ID must be provided
- User must be associated with the company

**Check:**
```python
# In Django shell
from news.models import Profile
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(email='your@email.com')
profile = Profile.objects.get(user=user)
print(f"Role: {profile.role}")
print(f"Company: {profile.user.ecommercecompany_set.first()}")
```

### 4. Articles Not Loading

**Requirements:**
- Company ID must be provided
- User must be authenticated
- Articles must exist for the company

**Check:**
```python
# In Django shell
from news.models import Article
from ecommerce.models import EcommerceCompany

company = EcommerceCompany.objects.get(id=<your-company-id>)
articles = Article.objects.filter(company=company)
print(f"Articles count: {articles.count()}")
```

## Quick Fix Checklist

- [ ] `NEXT_PUBLIC_DEFAULT_COMPANY_ID` is set in `.env.local`
- [ ] User is logged in (check cookies)
- [ ] User has a Profile record in database
- [ ] User's Profile has correct role (admin/editor/author)
- [ ] User is associated with a company
- [ ] Backend server is running
- [ ] CORS is configured correctly
- [ ] API URL is correct in `.env.local`

## Testing Endpoints Manually

```bash
# Get your auth token (from browser cookies or login response)
TOKEN="your-jwt-token"
COMPANY_ID="your-company-id"

# Test profile endpoint
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Company-Id: $COMPANY_ID" \
     https://3pillars.pythonanywhere.com/api/news/profiles/me/

# Test stats endpoint
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Company-Id: $COMPANY_ID" \
     https://3pillars.pythonanywhere.com/api/news/stats/dashboard/
```

## Next Steps

If issues persist:
1. Check Django server logs for detailed errors
2. Verify database migrations are applied
3. Ensure all required data exists (company, profile, etc.)
4. Check network tab in browser DevTools for actual API responses

