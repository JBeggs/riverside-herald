# CORS Configuration Fix

## Problem
The frontend is getting CORS errors when trying to connect to the Django backend at `https://3pillars.pythonanywhere.com/api`.

## Solution

You have two options:

### Option 1: Allow All Origins (Development Only) ⚠️

**For local development only**, you can temporarily allow all origins by setting an environment variable:

```bash
# In your Django backend environment (PythonAnywhere or local)
export CORS_ALLOW_ALL_ORIGINS=True
```

Or update `django-crm/webcrm/settings.py` line 483:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

**⚠️ WARNING**: Never use this in production! It's a security risk.

### Option 2: Add Your Frontend Origin (Recommended)

Add your frontend's origin to the `CORS_ALLOWED_ORIGINS` list in `django-crm/webcrm/settings.py`.

**If your frontend is running locally:**
- Check what URL you're accessing it from (e.g., `http://192.168.1.103:3000`)
- Add that exact URL to the list

**If your frontend is deployed:**
- Add your production frontend URL (e.g., `https://your-frontend-domain.com`)

### Current CORS Settings

The backend already includes:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://192.168.1.100:3000`
- `http://192.168.1.103:3000` (just added)

### After Making Changes

1. **If running locally**: Restart your Django development server
   ```bash
   python manage.py runserver
   ```

2. **If on PythonAnywhere**: 
   - Reload your web app from the PythonAnywhere dashboard
   - Or restart via console: `touch /var/www/yourusername_pythonanywhere_com_wsgi.py`

### Verify CORS Headers

You can test if CORS is working by checking the response headers:
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: authorization,content-type,x-company-id" \
     -X OPTIONS \
     https://3pillars.pythonanywhere.com/api/auth/login/ \
     -v
```

You should see `Access-Control-Allow-Origin` in the response headers.

### Allowed Headers

The backend already allows these headers (including `X-Company-Id`):
- `authorization`
- `content-type`
- `x-company-id`
- And others...

### Troubleshooting

1. **Check your frontend URL**: Make sure you're accessing the frontend from the exact URL listed in `CORS_ALLOWED_ORIGINS`
2. **Check browser console**: Look for the exact origin being blocked
3. **Check Django logs**: Look for CORS-related errors in your Django logs
4. **Clear browser cache**: Sometimes cached CORS responses can cause issues

