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

The public site should behave as a sequence of authored project scenes, not a dashboard.

The reference-led home composition should prioritize:

1. quiet persistent identity and navigation
2. one dominant project scene
3. oversized active-project typography
4. full-bleed or strongly cropped media
5. useful role, year, and credit metadata
6. an archive or project sequence control
7. a direct contact path

Mobile must preserve the same hierarchy without pretending to be a desktop. Stack title, media, metadata, action, and next-project navigation clearly.

No scroll-jacking. Native scrolling is the source of truth.

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

Avoid:

- generic fades as the only transition language
- stacked glow, parallax, cursor, WebGL, and text effects
- autoplay audio
- loading every project video on first view

Requirements:

- usable first view without WebGL or video
- optimized poster for LCP media
- lazy loading for non-active media
- videos must have accessible names and pause/control behavior when meaningful
- reduced motion preserves all content and hierarchy, removes scrubbing/parallax, and makes state changes immediate

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

## 12. Current delivery sequence

The current priority is not the complete site. It is a focused identity prototype:

1. replace the inherited desktop presentation with a MILEZ-informed archive scene
2. prove one active-project title/media transition
3. expose project sequence, role, year, and credits clearly
4. keep the CMS data foundation intact
5. validate the direction before expanding into project detail, index, about, and contact routes

Real project content and Arthur-authored marks are still required before final art direction is considered complete.
