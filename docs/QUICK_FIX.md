# Quick Fix for 404 Errors

## The Seed Command DOES Create the Profile

The `create_riverside_herald_user.py` command **DOES create the profile** (lines 140-159).

## To Fix 404 Errors:

### 1. Run the Seed Command
```bash
cd django-crm
python manage.py create_riverside_herald_user
```

This will:
- ✅ Create the user
- ✅ Create/update the company
- ✅ **Create/update the Profile** (with role: admin by default)
- ✅ Print the Company ID you need

### 2. Copy the Company ID from Output
The command will output something like:
```
🏢 Company Details:
  ID: 123
```

### 3. Add to `.env.local`
```env
NEXT_PUBLIC_API_URL=https://3pillars.pythonanywhere.com/api
NEXT_PUBLIC_DEFAULT_COMPANY_ID=123
```

### 4. Restart Next.js Server
```bash
# Stop and restart your dev server
npm run dev
```

### 5. Login
Use the credentials from the seed command output:
- Email: (from seed output)
- Password: (from seed output)

## If Still Getting 404:

1. **Check if profile exists:**
```bash
cd django-crm
python manage.py shell
```
```python
from news.models import Profile
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(email='your@email.com')
try:
    profile = Profile.objects.get(user=user)
    print(f"✅ Profile exists: {profile.role}")
except Profile.DoesNotExist:
    print("❌ Profile missing - run seed command")
```

2. **Test the endpoint directly:**
```bash
# Get token from login
TOKEN="your-jwt-token"
COMPANY_ID="your-company-id"

curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Company-Id: $COMPANY_ID" \
     https://3pillars.pythonanywhere.com/api/news/profiles/me/
```

If this returns 404, the endpoint isn't registered. If it returns 200, the frontend isn't sending the right headers.

