# TASK: Home colophon, and the gallery rhythm class bug

## 1. Current scenario

### The gallery bug

`app/(frontend)/[locale]/work/[slug]/page.tsx` builds each gallery figure's class from the
authored `GALLERY_RHYTHM`:

```tsx
className={`work-figure${slot.lift ? "work-figure-lift" : ""}`}
```

The separator is missing. Every slot with `lift: true` — indices 2 and 4 of the six-step
rhythm, so frames 3, 5, 9, 11, … — renders as the single class
`work-figurework-figure-lift`, which matches nothing in `globals.css`.

`.work-figure` is what gives the figure `grid-column: 1 / -1` inside the twelve-column
`.work-sequence`, plus its own nested twelve-column grid. Without it the figure auto-places
into **one** of the sequence's twelve columns and stops being a grid, so:

- the figure collapses to roughly 1/12 of the field,
- the image's inline `grid-column` has no grid to place into and is inert,
- the caption wraps under a thumbnail-sized frame.

Confirmed on the deployment as well as locally — `/en/work/dhiulia-souza` served
6 × `work-figure`, 3 × `work-figurework-figure-lift`.

### The missing colophon

`components/site/site-footer.tsx` is rendered by `/work/[slug]`, `/index`, `/about`, and
`/contact`. The home does not use it: `ArchivePrototype` ends on the `.timeline-index` band
and the document simply stops.

That leaves the home as the only route with **no sound control and no language switch**, which
`CLAUDE.md` §13 forbids ("never remove the visible control"), and with no non-cinematic contact
path, which §8 asks for.

`/index` already renders `SiteFooter` and always has; verified in the production HTML.

## 2. Planned changes

1. Insert the missing space in the gallery figure class.
2. Render `SiteFooter` on the home from `page.tsx`, as a server-rendered sibling of
   `ArchivePrototype` — `site` and `dictionary` are already resolved there, so the footer needs
   no new client boundary and adds no fetch.
3. Wrap it in `.timeline-colophon` and style that band in `globals.css`.

## 3. Why this framing

**The footer is reused verbatim, not reimplemented.** The archive should state its production
data in one voice on every route. Only the frame differs.

**The colophon continues the index band's Newsprint rather than declaring a surface.**
`[data-surface="sheet"]` cannot be used here: `html:has([data-surface="sheet"])` repaints the
whole document, and the room above it is the entire point of the home. So `.timeline-colophon`
sets `--surface-rule` / `--surface-muted` locally and paints `var(--foreground)`, exactly as
`.timeline-index` does. The two bands read as one sheet, and the page ends on a surface instead
of cutting back to black.

**Its `.shell-inner` is realigned to the index band's 2rem gutter** (1rem under 900px) instead
of the interior shell's `--shell-gutter` / 96rem cap, so the dashed rule lands on the same
edges as the rows above it.

**Utility type returns to the interior 0.6875rem floor.** The home's 0.48–0.54rem register is
the deliberate cinematic choice `CLAUDE.md` §12 protects for the *stage and the index band*.
A colophon is a contact path — its links have to be read and hit — and the component already
hardcodes `0.6875rem` on `.sound-toggle`, so anything smaller would disagree with itself.

**Intensity (§6): the colophon adds no sula.** It is core: quiet, functional, no mark, no
motion. The home's assertive elements remain the morphing atmosphere and the walker, both in
the stage region above.

## 4. Affected files

| File | Change |
| --- | --- |
| `app/(frontend)/[locale]/work/[slug]/page.tsx` | one-character fix to the figure class |
| `app/(frontend)/[locale]/page.tsx` | import and render `SiteFooter` inside `.timeline-colophon` |
| `app/(frontend)/globals.css` | `.timeline-colophon` band + its 900px gutter |

No schema change, no new dependency, no client component.

## 5. Content assumptions

The colophon shows only what an editor filled in: `site.contact.rows[]` and `site.socials[]`.
Both are currently **seed placeholders** (`arthur@example.com`, bare `instagram.com` /
`youtube.com` / `tiktok.com` roots). Nothing is invented by this change, but the home now
surfaces those placeholders at the end of the primary route, so they should be replaced with
Arthur's real contact details before launch.

## 6. Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm build` — clean.
- `git diff --check` — clean.
- Production build served locally: home emits `.timeline-colophon` + `.shell-footer`;
  `/en/work/dhiulia-souza` emits `work-figure work-figure-lift` (3), `work-figure` (6).
- Shipped CSS bundle carries the four `.timeline-colophon` rules, with the 1rem gutter
  correctly nested in `@media (max-width: 900px)`.

Not yet verified in a browser: the Chrome extension was not connected during this session, so
the colophon's rendered alignment against the index band, and the repaired gallery rhythm at
900px and 520px, are still unconfirmed visually.
