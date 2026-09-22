# TASK: Public project list and archive

## Current scenario

The home, `/index`, and `/work` sequence came from `selectedProjects()`, which only
includes projects linked on a **folder** desktop item (e.g. `selected-work`). A new
Project document does not appear until it is added to that folder manually.

Routes already use `force-dynamic`, so caching is not the blocker.

## Planned changes

- Add `archived` (sidebar checkbox, default off) on `projects`.
- Add `getPublicProjects()` — all non-archived projects, sorted by `order`.
- Public routes and sitemap use `getPublicProjects()` instead of folder curation.
- `getProjectBySlug()` excludes archived documents (404 on `/work/[slug]`).
- Public `read` access hides archived rows from unauthenticated API reads.
- Postgres migration for `projects.archived`.

## Why

Editors expect a saved project to appear on the site immediately. Archive removes
work from the public sequence without deleting CMS data.

## Affected files

- `collections/Projects.ts`
- `lib/payload.ts`
- `lib/projects.ts`
- `app/(frontend)/[locale]/page.tsx`
- `app/(frontend)/[locale]/index/page.tsx`
- `app/(frontend)/[locale]/work/[slug]/page.tsx`
- `app/(frontend)/sitemap.ts`
- `app/(frontend)/[locale]/opengraph-image.tsx`
- `migrations/*`

## Assumptions

- `order` continues to control sequence (lower first). New projects default to `0`
  and may need a higher order to sit at the end.
- Folder desktop items remain for legacy desktop UI only.
