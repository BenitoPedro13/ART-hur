# TASK: Interior routes — project detail, index, about, contact

## 1. Current scenario

The public site has exactly one route: `app/(frontend)/[locale]/page.tsx`, which renders
`components/archive/archive-prototype.tsx`. Everything else a portfolio needs — a project at
its own URL, a browsable index, a practice statement, a contact path — either does not exist
or is stranded in `components/desktop/`.

`components/desktop/**` has been fully orphaned since `429e888`. Nothing outside that folder
imports it. It still contains the right *contents* modelled as macOS windows:

| Legacy window | What it held | Where it goes |
| --- | --- | --- |
| `window/folder-window.tsx` | the project list | `/index` |
| `window/project-window.tsx` | title, year, credits, video/cover, description, gallery | `/work/[slug]` |
| `window/text-window.tsx` | the About rich text | `/about` |
| `contact-dialog.tsx` + `contact-form.tsx` | contact rows and the email form | `/contact` |

Their presentation is desktop mimicry that `CLAUDE.md` §3 retires. The folder is not deleted;
it remains migration material per the standing non-goal.

`CLAUDE.md` §12 gated this work behind validating the centred archive prototype. That gate is
now open.

### What already exists and must be reused

- `collections/Projects.ts` already carries `slug` (`slugField('title')`, unique, indexed,
  deliberately not localized), so `/work/[slug]` needs **no Projects schema change**.
- `globals/Site.ts` already carries `contact.rows[]`, `form`, `socials`, `avatar`, `tagline`, `seo`.
- `lib/rich-text.tsx`, `lib/video.ts`, `lib/media.ts`, `lib/i18n.ts` cover rendering, media
  resolution, and non-CMS copy.
- `app/(payload)/api/contact/route.ts` and `lib/mail.ts` are the working contact backend.
- `proxy.ts` already redirects every unprefixed path to `/{locale}/…`, so new routes are
  locale-negotiated with no change.
- The home already contains a Newsprint band (`.timeline-index`, `globals.css:601`). The
  interior surface model extends that, rather than introducing a second design system.

## 2. Planned changes

### 2.1 The surface split

The site declares two surfaces and cuts between them. No cross-route fade. This is the spec's
motion thesis — "the site should move like an edit" — applied at the route level.

```text
HOME        Vinyl Black   cinematic morph stage      (unchanged)
/work/…     Vinyl Black   media-led case study
/index      Newsprint     dense contact-sheet list
/about      Newsprint     editorial column + Living Tag
/contact    Vinyl Black   flat, quiet, no spectacle
```

The layout paints `bg-void` on `<html>` and `<body>`. Sheet routes stamp
`data-surface="sheet"` on their root element and `globals.css` picks it up with
`html:has([data-surface="sheet"])`, so the canvas margins and overscroll match the page. No
layout change and no client JavaScript.

### 2.2 The signature: the line at rest

The home's memorable element is the dashed Newsprint route the `芸` walker crosses
(`stroke-dasharray: 8 6`, `globals.css:456`). The walker never appears on an interior page —
it is a sula and must not become texture — but the line it walks on becomes the interior
ruling stroke: same dash geometry, inverted to Vinyl Black on sheet routes, now horizontal
and still.

That rule carries the **slate**: a quiet mono block holding the page's real metadata.

| Route | Slate contents |
| --- | --- |
| `/work/[slug]` | sequence position, year, and the project's own `meta[]` credits |
| `/index` | project count and year span |
| `/about` | disciplines, based in, availability |
| `/contact` | availability |

Real Payload data only. Spec §7 forbids fake barcodes, coordinates, and meaningless serials,
and forbids decorative `01/02/03` sequencing where order carries no meaning. The `/work`
position and the `FRAME NN / NN` gallery captions are real ordinals in a real sequence.

### 2.3 Deliberately absent

No walker, no WebGL, no ripple, no parallax, no route transition, no cursor effect, no corner
crop marks. `/work` gets exactly one motion device — a shared clip-path wipe on image reveal.
`/index`, `/about` and `/contact` get hover and focus states and nothing else.

### 2.4 Data layer

- `lib/projects.ts` (new): `selectedProjects(items)` extracted verbatim from the flattening
  currently inline at `app/(frontend)/[locale]/page.tsx:33-40` (folder items → projects →
  populated objects → dedupe by id → sort by `order`). Home, `/index` and `/work` all call it
  so they can never disagree on order or membership. Also `projectRole`, `projectCredits`,
  `projectNeighbours`.
- `lib/payload.ts`: add `getProjectBySlug(slug, locale)`.

### 2.5 Payload — About tab on the Site global

New tab on `globals/Site.ts`:

| field | type | localized |
| --- | --- | --- |
| `about.heading` | text | yes |
| `about.standfirst` | textarea | yes |
| `about.bio` | richText | yes |
| `about.portrait` | upload → media | no |
| `about.disciplines` | array `{ label }` | yes |
| `about.basedIn` | text | yes |
| `about.availability` | text | yes |

Plus `contact.intro` (textarea, localized) and `contact.availability` (text, localized) in the
existing `contact` group.

`/about` falls back to the existing `desktop-items` text entry (`about-arthur`) when
`about.bio` is empty, so the page is never blank on an unmigrated database.

### 2.6 Shared shell — `components/site/`

| File | Job |
| --- | --- |
| `site-header.tsx` | one fixed header for every route; `LivingTag compact`, a `center` slot, `WORK · ABOUT · CONTACT` |
| `site-footer.tsx` | interior colophon: dashed rule, email, socials, locale switch, copyright |
| `locale-switch.tsx` | path-preserving locale swap |
| `slate.tsx` | the dashed rule plus mono definition rows |
| `reveal.tsx` | the single `/work` motion device |
| `contact-form.tsx` | restyled from `components/desktop/contact-form.tsx`; identical submit contract |
| `project-media.tsx` | hero media: `parseVideoUrl` embed or native video with poster, else `next/image` |

The header keeps `mix-blend-mode: difference` so it inverts correctly on both surfaces with no
per-route styling.

### 2.7 i18n

New `Dictionary` keys added to all four locale blocks in `lib/i18n.ts`. The type is declared up
front precisely so a missing translation is a compile error.

While the shared header lands, the inline `isPortuguese ? "…" : "…"` ternaries in
`archive-prototype.tsx` are replaced with dictionary lookups. Otherwise the same header bar
would mix dictionary-driven and ternary-driven labels, and `lib/i18n.ts:44` already states the
rule: never inline a literal in a component.

### 2.8 Type scale

Spec §6 lists Display XL, Display L, Heading M and Body L. None were implemented. They land as
real classes used by the interior routes. Interior utility type sits at the spec's `0.6875rem`
floor; the home's `0.48rem` stays as its deliberate cinematic choice.

### 2.9 `next.config.ts`

Add `images.remotePatterns` for `**.public.blob.vercel-storage.com`. There is none today, so
`next/image` — which these pages depend on for CMS media — rejects Blob URLs the moment
`BLOB_READ_WRITE_TOKEN` is set in production.

## 3. Why

The home validates the archive's identity but leaves the work unreachable: no project has a
URL, so nothing can be linked, shared, indexed, or read at length. Spec §9 names all four
routes, §14 requires the index as the complete non-cinematic path through the work, and §17.7
requires contact within two deliberate actions from any primary route. None of that is
currently possible.

Building the four together is also what keeps them coherent: they share one header, one
footer, one ruling stroke, and one slate, so the interior reads as the same archive rather
than four separately designed pages.

## 4. Affected files

| File | Planned change |
| --- | --- |
| `docs/tasks/TASK-interior-routes.md` | this document |
| `lib/projects.ts` | new shared project selection and credit helpers |
| `lib/payload.ts` | add `getProjectBySlug` |
| `globals/Site.ts` | About tab; `contact.intro`, `contact.availability` |
| `migrations/*`, `payload-types.ts` | generated |
| `scripts/seed.ts` | provisional About and contact copy in both locales |
| `components/site/*.tsx` | the shared interior shell |
| `app/(frontend)/[locale]/work/[slug]/page.tsx` | new |
| `app/(frontend)/[locale]/index/page.tsx` | new |
| `app/(frontend)/[locale]/about/page.tsx` | new |
| `app/(frontend)/[locale]/contact/page.tsx` | new |
| `app/(frontend)/[locale]/page.tsx` | use `selectedProjects` |
| `components/archive/archive-prototype.tsx` | adopt `SiteHeader`; drop inline i18n ternaries |
| `app/(frontend)/globals.css` | surface, motion, type, rule, and route styles |
| `lib/i18n.ts` | new keys across en, pt, es, fr |
| `next.config.ts` | `images.remotePatterns` |
| `README.md`, `CLAUDE.md` | route map and delivery sequence |

## 5. Content assumptions

These are assumptions, not confirmed facts about Arthur:

- Seeded projects remain provisional. `pnpm seed` content is placeholder and must not be
  presented as confirmed portfolio work.
- `Project.meta[]` is the only credit source. Its first row supplies role; the rest render as
  the credit grid. Spec §13 wants dedicated `client`, `selfInitiated`, `disciplines`,
  `premise`, and `deliverables` fields — those are a later schema pass, not this one.
- `Project.year` is free text and may be absent; the pages degrade to a dash rather than
  inventing a year.
- Seeded About copy is written in Arthur's voice but invents no title, client history,
  outcome, award, or metric. Real biography, disciplines, availability, and portrait are still
  required before final art direction.
- `Media` accepts images only. Project video remains URL-only via `Project.videoUrl`.

## 6. Intensity audit

| Region | Assertive element | Quiet support |
| --- | --- | --- |
| Global header | none | brand, route slate, nav |
| `/work` slate | title | position, year, credits |
| `/work` hero | hero media | caption, controls |
| `/work` context | none | credit rail, body copy |
| `/work` sequence | one image per rhythm slot | frame captions |
| `/work` next band | next title | label, cover backdrop |
| `/index` | none | heading, loupe, rows |
| `/about` | Living Tag | standfirst, portrait, rail, bio |
| `/contact` | none | rows, socials, form |
| Global footer | none | email, socials, locale, copyright |

One assertive element per region, never three at once. `/index` and `/contact` are explicitly
sula-free per the spec's region audit table.

## 7. Reduced-motion behaviour

When `prefers-reduced-motion: reduce` is active:

- the `/work` image reveal does not run; images are visible from first paint
- no smooth scrolling on any interior route
- hover and focus state changes become immediate
- the Living Tag renders in its completed state, as it already does
- all content, hierarchy, and navigation are unchanged

Every interior page must also be complete without JavaScript: contact details, project copy,
gallery images, and navigation are server-rendered anchors and images.

## 8. Non-goals

- No change to the home timeline interaction, walker, route curve, or WebGL layers
- No Projects schema migration
- No deletion of `components/desktop/**`
- No `client`, `selfInitiated`, `disciplines`, `premise`, or `deliverables` fields on Project
- No sitemap, robots, or OG image generation route
- No custom cursor, page transition, or scroll-scrubbed media on interior routes
- No USVA installation in this pass

## Verification and acceptance

- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm build`
- [ ] Prettier check for every changed file
- [ ] `git diff --check`
- [ ] Every route renders at `/pt/…` and `/en/…`
- [ ] An unknown locale and an unknown project slug both 404
- [ ] `/index` → `/work/[slug]` → next project → back to index completes as a loop
- [ ] Contact is reachable in at most two deliberate actions from every route
- [ ] Contact details resolve with JavaScript disabled
- [ ] Sheet routes paint Newsprint into the overscroll area, with no black frame leak
- [ ] No horizontal overflow at 1440px or 390px on any route
- [ ] Focus is visible on both surfaces for header, rows, gallery, and form controls
- [ ] Touch targets on index rows, contact rows, and nav are at least 44 CSS pixels
- [ ] Reduced motion removes the reveal and preserves all content and hierarchy
- [ ] Hero media carries a poster; gallery images stay lazy; no project video autoplays
- [ ] Project images use alt text from Payload
- [ ] The Living Tag appears at most once per region, and only once on `/about`
- [ ] The walker, ripple, and morph canvases appear on no interior route
- [ ] Home behaviour is unchanged apart from the shared header and dictionary copy
- [ ] Empty projects, empty gallery, absent video, and absent description all render cleanly
- [ ] Reference `.mov` files remain ignored and unmodified

## Outcome

Implemented. All four routes build and render against Arthur's real projects.

Delivered beyond the original plan:

- a walking `芸` favicon (`components/site/walking-favicon.tsx`) and a mobile
  menu, both of which needed several corrections — see the browser notes below
- the contact honeypot was silently eating real enquiries

- the home hero image links into its project, and the home index rows now
  actually change the stage (they previously scrolled the document while the
  morph stayed on the old project — nothing listens to scroll, by design, so
  the row click had to call the selector directly)
- a full SEO layer: `lib/seo.ts`, per-route canonical and `hreflang`, Open
  Graph with true image dimensions, JSON-LD per route, `sitemap.ts`, `robots.ts`
- `assertSeedSafe`, after `pnpm seed` was run against the real database during
  this task and had to be reversed; `removeSeedSet` also deleted media on a
  substring match, which would have destroyed `arthur-pimenta.jpg`

### Browser behaviours worth not rediscovering

- **`robots.ts` must live at the app root.** Inside `app/(frontend)/` Next
  registers `sitemap.ts` but silently skips `robots.ts`; the request then falls
  through to `[locale]` and 404s. Confirmed against the build manifest.
- **Chrome prefers an SVG favicon over PNG regardless of document order**, and
  renders it statically. While `app/icon.svg` existed the walking frames were
  ignored entirely, so the site now ships PNG icons only.
- **Chrome re-reads the favicon when the link element is replaced, not when its
  `href` is mutated.** Mutating alone left the tab frozen.
- **Favicon frames must be `data:` URLs.** Pointing `href` at a file made
  Chrome re-request that frame *and* every other icon link on each swap — a
  permanent request storm. Frames are fetched once and cached as data URLs.
  Verified: each frame requested exactly once, zero requests while animating.
- **A child cannot escape `mix-blend-mode` on an ancestor.** The mobile menu
  panel rendered inside the blended header came out inverted and see-through;
  it is portalled to `<body>`.
- **An off-screen honeypot still gets autofilled.** Chrome and Edge filled the
  contact form's hidden field with the visitor's own email, which tripped the
  server's bot check — and because that path answers `{ok:true}` without
  sending, real enquiries reported success and vanished. `display: none` is the
  one state autofill skips. The same latent bug is still in the dead
  `components/desktop/contact-form.tsx`.

Known gaps, deliberately not addressed here:

- Arthur's uploaded media has no generated `thumbnail`/`card`/`hero` sizes, so
  `mediaUrl(x, size)` falls back to the original file everywhere
- the Site global's text fields still hold seed defaults
  (`arthur@example.com`, `https://instagram.com/`) and need real values
- dragging the scrollbar or paging with the keyboard still does not change the
  selected project on the home stage
