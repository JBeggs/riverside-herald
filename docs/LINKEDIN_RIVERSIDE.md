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
4. The dialog pre-fills **title + full article body** (including a References section if it is in your HTML) and the public URL — edit freely before posting.
5. A **preview image** at the top of the dialog shows the hero/social image used for link previews (not uploaded as a separate LinkedIn attachment).
6. **Post** (text longer than 3,000 characters is trimmed on submit).

### Posting as **3 Pillars** (Company page)

- `default_organization_id` must be the **numeric** LinkedIn Company Page ID (from the page URL), e.g. `12345678` — not `urn:li:organization:…` (Admin accepts either; the server normalizes).
- Your LinkedIn app must include **`w_organization_social`**; use **Connect LinkedIn** again after adding it.
- The authorizing user must be an **admin** of that Company Page in LinkedIn.
- If the dialog shows organization ID saved but “posting not ready”, reconnect LinkedIn so the new scope is on the stored token.

See also: [LINKEDIN_SETUP.md](../../django-crm/docs/linkedin/LINKEDIN_SETUP.md) in the Django repo.

## Important: what the API post does (and what it does not)

- **Server `POST /api/linkedin/share/`** creates a **text-only** UGC post (`shareMediaCategory: NONE`). LinkedIn does **not** receive your hero image through this API — there is no attachment.
- If the post body includes your **article URL**, LinkedIn **may** show a **link preview card** (title, description, image). That card is built by LinkedIn **scraping** your live article page **Open Graph** tags (`og:title`, `og:image`, etc.), not from the editor hero field directly.
- **Stale previews**: LinkedIn caches link previews aggressively. After changing title, SEO fields, or hero/social image, use **[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)** (inspect your article URL) to refresh the cache before judging the result.
- **`NEXT_PUBLIC_SITE_URL`** must match the URL you share; wrong origin breaks absolute `og:image` URLs and preview fetches.

### Getting the hero into the preview

- Prefer a **Featured image** backed by **`featured_media`** (upload or library) so Django returns `file_url` for OG tags.
- If you use Django’s **`social_image`** on the article, the site now prefers that image for **`og:image`** over `featured_media` when both exist.
- The article route is **`force-dynamic`** so metadata is not served from a stale static cache after edits.
