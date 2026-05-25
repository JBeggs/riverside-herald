# Pre-publish review — technical leakage checklist

Use after a research run applies draft text, **before** setting status to published.

## Must not appear in published copy

- [ ] Product or platform names (3pillars, template repo names, internal codenames)
- [ ] API URLs, endpoint paths, or header names (`X-Company-Id`, JWT, etc.)
- [ ] Environment variable names (`SALES_INTAKE_NOTIFICATION_EMAILS`, etc.)
- [ ] Database models, table names, or field names (`FormSubmission`, `SiteSetting`, …)
- [ ] Crawler / scraper mechanics (Cloudflare bypass, CDP, Playwright, cookie export)
- [ ] File paths, monorepo layout, or “how we implemented it” step lists
- [ ] Named client businesses unless already public and approved for RSH

## Should appear (story is working if these do)

- [ ] Plain-language problem (lost enquiries, too many tools, part-time owner overload)
- [ ] Plain-language outcome (one queue, notification + record, checklist for trust)
- [ ] Local / South African context where relevant
- [ ] Neutral tone; claims tied to **References** section with https links
- [ ] No fabricated quotes or statistics without a cited source

## Quick scan

1. Search draft for: `api`, `.env`, `django`, `next`, `cursor`, `github`, `tenant`, `slug`, `POST`, `GET`.
2. If any match is **implementation detail**, rewrite that sentence for a general reader.
3. Confirm **References** bullets are markdown links with full `https://` URLs (CMS requirement).

## Sign-off

| Check | Editor | Date |
|-------|--------|------|
| Leakage scan | | |
| References valid | | |
| Headline/subtitle match brief intent | | |
