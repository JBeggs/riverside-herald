# Riverside Herald — LinkedIn posting

Manual **Post to LinkedIn** lives in the article editor **Publish** step (admin and editor roles).

## Environment (`river-side-herald/.env`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Django API base (e.g. `https://3pillars.pythonanywhere.com/api`) |
| `NEXT_PUBLIC_DEFAULT_COMPANY_ID` | Riverside `EcommerceCompany` UUID — sent as `X-Company-Id`; LinkedIn tokens attach to this company |
| `NEXT_PUBLIC_COMPANY_SLUG` | `riverside-herald` |
| **`NEXT_PUBLIC_SITE_URL`** | Public site origin **without** trailing slash (e.g. `https://your-riverside-domain.com`) — used to build `/articles/{slug}` in the post |

Do **not** put LinkedIn client secrets in Next.js env; secrets stay in Django Admin / server env (`LINKEDIN_CLIENT_SECRET`, etc.).

## Django (one-time)

1. **LinkedIn Global Settings**: Client ID, Client Secret, **Default company** = Riverside company, **`default_organization_id`** = numeric LinkedIn Company Page ID (for “Company page” posts).
2. **LinkedIn app**: Redirect URL must match the API callback (e.g. `https://3pillars.pythonanywhere.com/api/linkedin/callback/`).
3. **Products**: Sign In with LinkedIn + Share on LinkedIn + organization posting (`w_organization_social`) as required by LinkedIn for page posts.
4. Complete OAuth: use **Connect LinkedIn** in the editor dialog (opens `GET /api/linkedin/auth-url/`) while logged in as **news admin** or **editor**.

## User flow

1. Edit article → **Publish** step → **Post to LinkedIn**.
2. If not connected, **Connect LinkedIn** (new tab), then try again.
3. Choose **Personal profile** or **Company page** (page requires `default_organization_id` on server).
4. Edit post text if needed → **Post**.

See also: [LINKEDIN_SETUP.md](../../django-crm/docs/linkedin/LINKEDIN_SETUP.md) in the Django repo.
