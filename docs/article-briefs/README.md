# Riverside Herald — local digital infrastructure article briefs

Paste-ready seeds for the **Cursor research workflow** in the article editor. References are drafted automatically by research runs; do not add them here.

## Guardrails

### Anonymous briefs (first run, second run, pilot)

- Riverside Herald **news/editorial** tone
- **No product names** (no 3pillars, no repo or client names)
- **No secrets:** no API paths, env vars, crawler bypass, database schemas, or build recipes
- **Safe to discuss:** market problems, outcomes, principles, SME benefits, trends

### Programming services briefs (third run)

- May reference **[past-and-present.co.za](https://past-and-present.co.za)** as live portfolio
- May name public stacks (Django, React, Next.js, Flutter, TypeScript, Tailwind)
- Same **no secrets** rule — no API paths, env vars, or bypass techniques

## Workflow

1. **Admin → Articles → Add** (save once so Research tab is available).
2. **Basic Info:** paste **Headline** → Title; **Subtitle** → Subtitle.
3. **Research tab:** paste the full **Editor brief** block from a pilot file (includes image direction + details), then pick a **Writing style** and **Reference density** before starting:
   - **Writing style** (default *Neighbourhood Report*): *Wire Brief* (short news), *Deep Read* (longform), *Editor's Column* (opinion), *Explainer* (restructures long briefs), *Riverside Herald AI Author* (spelling/grammar only — keeps pasted copy as close to original as possible).
   - **Reference density** (default *Moderate*, 6 sources): *Light* (3), *Standard* (10), *Full* (no cap, legacy). Fewer links read easier; the cap is also enforced when the article is applied.
   - Handy pairings: **Wire + Light** for short news; **Explainer + Moderate** for long briefs; **Deep Read + Standard** for features.
4. Run **Start research**; poll until complete; apply text (and hero if not “text only”).
5. For gallery images, use **Generate one gallery image** with a per-image prompt (photo, infographic, chart, or map). For long pieces, add a `##` section heading so the visual anchors to that part of the story.
6. Before publish, run through [REVIEW-CHECKLIST.md](./REVIEW-CHECKLIST.md).

## Files

| File | Purpose |
|------|---------|
| [first-run-all-10.md](./first-run-all-10.md) | All ten briefs (catalog) |
| [second-run-sa-news-10.md](./second-run-sa-news-10.md) | Ten briefs inspired by SA newspaper headlines (May 2026) |
| [third-run-programming-services-10.md](./third-run-programming-services-10.md) | Ten briefs on programming services (web, Django, Flutter, CMS, dashboards, scraping) — references past-and-present.co.za |
| [pilot/01-contact-form-black-hole.md](./pilot/01-contact-form-black-hole.md) | Pilot 1 |
| [pilot/04-enquiry-to-action-queue.md](./pilot/04-enquiry-to-action-queue.md) | Pilot 2 |
| [pilot/08-boring-infrastructure-boom.md](./pilot/08-boring-infrastructure-boom.md) | Pilot 3 |
| [REVIEW-CHECKLIST.md](./REVIEW-CHECKLIST.md) | Pre-publish redaction check |

## Pilot selection (first run)

These three cover the recent development themes without overlapping:

1. **Contact form black hole** — why enquiries get lost (problem framing).
2. **Enquiry to action queue** — stored leads + notifications (solution pattern, still anonymous).
3. **Boring infrastructure boom** — opinion flagship tying local commerce + trust (series anchor).

Suggested series tag when publishing: **Local digital infrastructure**.
