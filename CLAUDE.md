# ART'hur Repository Guide

## 1. Project

ART'hur is Arthur's motion-led portfolio and living creative archive.

The site direction is **Marked Frequencies**: a strict editorial frame interrupted by authored marks, contact-sheet logic, production metadata, and cinematic media sequencing.

The complete brand and experience source of truth is:

- `docs/BRAND-AND-EXPERIENCE-SPEC.md`

The current implementation task must also have a document in `docs/tasks/` before code changes begin.

## 2. Visual source hierarchy

Use this order when visual or interaction references disagree:

1. The local MILEZ screen recording, `docs/MILEZ-portfolio.mov`, and the live archive at `https://milez.jp/archive/`
2. The decisions in `docs/BRAND-AND-EXPERIENCE-SPEC.md`
3. Arthur's supplied portfolio and content
4. The YK Produce recording for cinematic pacing and media sequencing
5. The inherited `portfolio-template` only for technical architecture and CMS behavior

MILEZ is the primary archive composition reference. Study its confidence, negative space, full-viewport scenes, restrained persistent navigation, layered media, typographic hierarchy, and deliberate transitions. YK Produce is the complementary motion reference: study its media-first staging, scale changes, hard black-and-white contrast, persistent production controls, and cinematic section pacing. Do not reproduce either site's branding, cultural motifs, exact layouts, assets, or transitions one-for-one.

ART'hur must remain recognizably Arthur through its palette, credits, project material, editorial signature, and Living Tag.

## 3. Foundation versus presentation

The inherited template is a **data and CMS foundation**, not the intended visual design.

Keep where useful:

- Next.js App Router and localized routes
- TypeScript and Tailwind CSS v4
- Payload CMS, media, projects, site settings, and Vercel Blob
- Contact data and accessible primitives
- Server-side content fetching

Replace or retire from the public experience:

- literal macOS or desktop simulation
- wallpaper, lock screen, calendar, icons, dock, and window chrome
- generic portfolio-template layouts
- UI that makes the site feel like software rather than an authored archive

Code under `components/desktop/` is migration material. Do not preserve its appearance merely because it exists.

## 4. Brand invariants

- Use `ART'hur` as the editorial signature and `Arthur` in human-readable prose, metadata, and accessibility labels.
- Brand idea: **A living archive with rhythm.**
- Essence: **Taste in motion.**
- Voice: short, direct, observant, and culturally fluent. Avoid agency jargon, forced slang, and invented claims.
- Do not invent Arthur's title, client history, project outcomes, awards, or metrics.
- Starter seed content is explicitly provisional. Never present it as confirmed portfolio content.

### Palette

Consume semantic tokens rather than raw hex values in components:

- Vinyl Black: room/background
- Newsprint: primary text and light surfaces
- Concrete: metadata and inactive states
- Oxide Red: primary assertion and active state
- Tape Yellow: annotation and temporary emphasis
- Flash Blue: rare digital or focus counterpoint

### Typography

- Archivo: display titles and brand mark
- Instrument Sans: readable UI and body copy
- IBM Plex Mono: years, indices, credits, timecode, and production data
- Custom lettering is reserved for the Living Tag or Arthur-authored marks, not navigation or body copy

## 5. Experience rules

The public site should behave as a sequence of authored project scenes, not a dashboard or carousel.

The reference-led home composition should prioritize:

1. quiet persistent identity and navigation
2. one dominant project scene
3. oversized active-project typography
4. full-bleed or strongly cropped media
5. useful role, year, and credit metadata
6. an archive or project sequence control
7. a direct contact path

The current home uses one fixed centered composition. Project image, atmosphere, title, and metadata morph in place. They never travel laterally as an open carousel.

One modest wheel notch or short touch-scroll gesture selects the adjacent project and synchronizes the native document to that project's anchor. The selected visual transition then completes independently with authored easing. Do not require users to scroll halfway through a project interval, and do not directly scrub shader progress from wheel distance.

The local route is one dotted Newsprint-white line that exits both screen edges as a single continuous curve. It breathes as one slow seesaw about its middle anchor, which stays fixed at the viewport center, and it never gains a transition-only swing: a project change leans the line to a new rest angle and leaves it there. On first load the 82 × 82 `芸` walker enters from beyond the right edge and eases to that center anchor while the route fades up and settles into its angle. Afterwards the walker holds the anchor, plays its 15-frame gait only during the entrance and project transitions, flips when navigating backward, and holds a neutral frame while idle.

Mobile must preserve the same centered hierarchy, edge-to-edge route, walker, and in-place morph without converting the experience into stacked cards.

## 6. Intensity contract

This rule is mandatory:

> Core recedes. Patterns structure. Motion guides. Sula asserts. Atmospheres are the room.

A region is one bounded attention area such as a hero, project viewport, dialog, project chapter, or contact release.

- Core controls are quiet and functional.
- Patterns organize project navigation, metadata, and editorial grids.
- Motion explains sequence, direction, opening, or state change.
- Use at most one sula element in a region.
- A dominant full-bleed video already counts as the region's assertive element.
- The Living Tag is a signature, not a repeating texture.
- Do not combine an oversized tag, aggressive title treatment, and high-intensity media transition in the same region.

## 7. Motion and media

Motion should feel like an edit, not a screensaver.

Prefer:

- cuts, masks, directional wipes, crops, and project-aware transitions
- one dominant movement per region
- transitions shared by the active title and media
- restrained hover metadata or preview behavior
- React Bits `MorphSlider` for the controlled in-place project transition
- React Bits `RippleDistortion` only as the stable active-image hover layer

Avoid:

- generic fades as the only transition language
- stacked glow, parallax, cursor, WebGL, and text effects
- running the hover ripple or walking sequence while inactive
- autoplay audio
- loading every project video on first view

Requirements:

- usable first view without WebGL or video
- optimized poster for LCP media
- lazy loading for non-active media
- videos must have accessible names and pause/control behavior when meaningful
- reduced motion preserves all content and hierarchy, removes scrubbing/parallax, and makes state changes immediate
- the underlying image remains visible if either WebGL component fails
- the route and neutral walker remain usable without motion

## 8. Accessibility

- All project navigation must work with keyboard and touch.
- Keep visible focus states using semantic tokens.
- Aim for 44 × 44 CSS pixel targets where practical.
- Preserve selectable text and semantic landmarks.
- Images need meaningful alt text from Payload.
- The custom mark needs the accessible text equivalent `ART'hur`.
- Contact details must remain reachable without cinematic interactions.
- The eventual `/index` route is the complete low-motion alternative to the immersive home.

## 9. Component sourcing

Use libraries for accessible behavior, not for their demo aesthetics.

Priority:

1. USVA
2. shadcn/ui
3. AlignUI
4. React Bits
5. Aceternity UI
6. custom code for the archive shell, Living Tag, and project transitions

For shadcn components, use the CLI workflow:

```bash
pnpm dlx shadcn@latest docs <component>
pnpm dlx shadcn@latest view <component>
pnpm dlx shadcn@latest add <component>
```

For USVA, use its shadcn-compatible registry. Read current AlignUI, React Bits, and Aceternity documentation before introducing them.

Before adding an external component, document:

- its user or storytelling job
- its intensity layer
- the region's existing sula
- keyboard, touch, reduced-motion, and SSR behavior
- why it strengthens Arthur's identity instead of resembling a component demo

If a dependency is not necessary, do not add it.

## 10. Next.js and React workflow

This repository uses a Next.js version with breaking changes beyond general model knowledge.

Before editing Next.js behavior, read the relevant version-matched guide in `node_modules/next/dist/docs/` as required by `AGENTS.md`.

- Prefer Server Components for routes and data fetching.
- Keep client boundaries narrow and limited to real interaction.
- Use `next/image` for managed images.
- Do not duplicate server-fetched content into another client request without a concrete need.
- Keep URL, locale, metadata, and Payload failures graceful.

## 11. Work sequence

Before implementation:

1. inspect the relevant reference recording and current source
2. read the matching specification section
3. write or update `docs/tasks/TASK-*.md`
4. list current scenario, planned changes, why, and affected files
5. identify content assumptions and state them explicitly

During implementation:

1. preserve CMS and data behavior unless the task requires a schema change
2. keep the public hierarchy legible before motion
3. build the reduced-motion path alongside the animated path
4. keep changes scoped to ART'hur
5. avoid editing ignored reference recordings

After implementation:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Also run `git diff --check`, inspect responsive behavior, test keyboard navigation, and verify reduced motion for interaction-heavy work.

Update `README.md`, the active task document, and this guide when architecture or workflow changes. Commit coherent ART'hur changes as work progresses.

## 12. Route and surface model

The archive stage is validated and the interior routes are built. The public
site is now:

| Route | Surface | Assertive element |
| --- | --- | --- |
| `/{locale}` | room | morphing project atmosphere |
| `/{locale}/work/[slug]` | room | hero media |
| `/{locale}/index` | sheet | none |
| `/{locale}/about` | sheet | the Living Tag |
| `/{locale}/contact` | room | none |

Two surfaces, cut between with no fade: the **room** is Vinyl Black for
media-led routes, the **sheet** is Newsprint for reading. Interior pages stamp
`data-surface` on their root element; `globals.css` paints the canvas to match.

The dashed route the `芸` walker crosses on the home page becomes the interior
ruling stroke — same 8/6 dash, horizontal and still — carrying a slate of real
production metadata. The walker, the morph canvases, and the ripple layer stay
exclusive to the home. Do not repeat them on an interior route.

Interior utility type sits at the spec's `0.6875rem` floor. The home's
`0.48rem` is a deliberate cinematic choice and does not propagate.

Real project content is photo sequences with no credits or description, so the
case study is built around the gallery, and any slate row without a value is
dropped rather than filled with "to be confirmed".

## 13. Seeds are destructive

`pnpm seed` and `pnpm seed:demo` are for empty or placeholder databases only.
They upsert by slug, which includes the `selected-work` folder and the entire
Site global — so running one against real content orphans the curated projects
and replaces Arthur's copy with placeholders.

`assertSeedSafe` now aborts when it finds a project no seed owns. Never pass
`--force` to get past it without asking first. Check the database before
seeding, not after.

Real project content is in place. Arthur-authored marks, a confirmed biography,
and per-project credits and context are still required before final art
direction is complete.
