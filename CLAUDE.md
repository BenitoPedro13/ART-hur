# Workflow Guidelines — Blessed Moon Studio (Marketing Website)

> This file follows a portable process template (plan before you touch anything, lean on
> existing tooling while you work, treat documentation as part of the deliverable when you
> finish) instantiated for this specific project. Section 0 is project-specific; sections
> 1–4 are the portable rules with paths and examples adapted to this repo.
>
> The philosophy in one line: **Plan before you write, lean on existing tooling while you
> work, and treat documentation as part of the deliverable when you finish.**

---

## 0. Project context — Blessed Moon Studio website

**Design-handoff route scope complete.** Next.js + Tailwind v4 + shadcn/ui are installed, the
brand design tokens are wired into the dark theme (`TASK-scaffold-nextjs.md`), and all four
routes are implemented (`TASK-finish-studio-subpages.md`). The full
design handoff lives in `docs/design-handoff.md` (screens, tokens, interactions, files) plus
`docs/design/wireframes.dc.html` (static wireframe reference) and
`docs/design/screenshots/*.png` (captures of the four selected screens).
`docs/design-handoff.md` is the source of truth for structure, copy, and design tokens — do
not duplicate its content here; this file covers *how to work*, not *what to build*. The root
`README.md` is the implementation README (setup, scripts, status).

Blessed Moon Studio is a software/web design agency. This repo is its marketing site:
homepage + Work, About, Contact subpages. Chosen direction: **dark, terminal/TUI-inspired,
full-bleed WebGL ASCII canvas background that morphs on scroll**, amber (`#ff6a1f`) accent
on near-black, sharp corners throughout (no border-radius — intentional, part of the TUI
aesthetic).

### Brand identity (for copy, tone, and component decisions)

- **Essence:** Illuminated precision. **Promise:** digital systems that are considered,
  reliable, and elevated. **Positioning:** technology that works with quiet excellence.
- **Audience:** founders, CTOs, and product leaders of growing companies who value
  craftsmanship and clear thinking over hype or lowest price.
- **Values:** Clarity, Craft, Integrity, Quiet confidence, Long-term thinking, Respect for
  attention and time — these are the About page's values chips; do not rephrase them.
- **Personality:** calm, precise, modern, slightly enigmatic, quietly premium (dark
  sophistication + warm orange light + technical soul).
- **Voice:** measured, clear, confident without volume; technical when needed, always
  human. Reference lines: *"Clarity is the feature."* (used as the hero headline),
  *"Built to last longer than the brief."* (About teaser heading).
- Any new copy written for this site (microcopy, error states, CTAs) should sound like it
  was written by the same voice — if it reads like generic SaaS marketing copy, it's wrong
  for this brand.

### Stack (per `docs/design-handoff.md` "About the Design Files")

| Layer | Choice | Status |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript, Turbopack, `src/` dir, `@/*` alias) — always the latest stable major, never a pinned number (see §2.0) | scaffolded |
| Styling / components | **Tailwind CSS v4 + shadcn/ui** — CSS-first config in `src/app/globals.css` (no `tailwind.config.*`); brand tokens (bg `#050505`, accent `#ff6a1f`, radius `0`, fonts) wired into the `.dark` theme block; `button`, `input`, `textarea`, `card`, `select` primitives installed | scaffolded |
| Atmosphere effect | Full-bleed ASCII moon background, scroll-driven zoom/rotation/drift, built on canvasui.dev's **AsciiObject** component (via shadcn CLI — see §2, `TASK-ascii-canvas-layer.md`). A hand-written raw-WebGL2 version was tried first and dropped in favor of this: AsciiObject's edge-aware glyph matching, DRACO support, and reduced-motion handling all beat what was being hand-rolled. The scene runs in an **OffscreenCanvas worker** (`ascii-object.worker.ts`), with a main-thread fallback — see the scroll-journey row and `TASK-ascii-offscreen-worker.md`. Plus animate-ui's **StarsBackground** behind it. canvasui's **ParticleObject** was the closing-CTA moment until its particle moon read as a plain filled circle at that size and was removed (`TASK-ascii-offscreen-worker.md`); the homepage now closes on the shared `PageCta`, and `ParticleObject` keeps the same not-on-a-live-page status as `ParticleScroll`. `ParticleScroll` previously wrapped the homepage's post-Hero content as a content-dissolve panel with its own independent internal scroll — removed (`TASK-homepage-unify-scroll.md`): two disconnected scroll contexts was a real, repeated source of confusion, and the panel had to stay shorter than its content, capping section depth. The component stays in the codebase, just not wired into a live page — same status as `DecryptReveal`, whose native effect (like `ParticleScroll`'s) depends on the experimental, Chrome-only `html-in-canvas` API, gated per-origin by a Chrome Origin Trial (`TASK-html-in-canvas-origin-trial.md`) | built on homepage |
| Scroll journey | Lenis (`src/components/lenis-provider.tsx`) gives the whole site eased/smoothed native scroll — skipped entirely under `prefers-reduced-motion`. `ScrollStage` (`src/components/scroll-stage.tsx`) pins **one** section for a taller scroll range via `position: sticky` (no scroll-jacking) and exposes progress as `--stage-progress` for children to fade/scale/transform against; used on Hero, the shared `PageHero`, and the subpages' sections. `ScrollMorphStage` (`src/components/scroll-morph-stage.tsx`) pins **several** in one shared sticky frame, all mounted at once and crossfading — which is what makes a real shared-element handoff possible, since two `ScrollStage` pins are never simultaneously on screen and so nothing can travel between them. It drives the whole homepage body **and, since `TASK-subpage-morph-expansion.md`, `/work` and `/about`** — `/contact` and `/work/[slug]` deliberately take the window chrome without a pin (a form should open rather than unfold; a long case study inside a scroll-driven window nests two scroll contexts). See `TASK-apple-scroll-journey.md` / `TASK-homepage-unify-scroll.md` / `TASK-homepage-morph-redesign.md`. **Two rules for content inside a morph layer:** a layer animates `opacity` only (a per-frame `transform` on an ancestor makes Motion's layout measurement drift mid-flight, so the token lands wrong), and `Reveal` does not work in there (it's `whileInView`-driven and every layer is permanently inside the viewport) — use `morphDrift()` instead | built site-wide |
| Sound / loading | Opt-in sound system (`src/components/sound-provider.tsx`, muted by default) and an interactive terminal boot sequence on load (`src/components/boot-sequence.tsx`) — sound-enable prompt, then a real scroll-to-begin gate (keyboard/button equivalents, fallback timeout so it can never trap a visitor) — `TASK-sound-and-boot.md`, `TASK-boot-sequence-gate.md`. What it renders is a **fastfetch-style lockup** (`BootLockup` + `src/lib/boot-info.ts`): the pixel crescent at display size, aligned `key: value` facts that are true rather than a fake progress log, the site's palette as a swatch row, and a choreographed exit that dissolves onto the hero — `TASK-boot-fastfetch-lockup.md` | built site-wide (runs in the root layout) |
| Brand / SEO | Logo: a literal pixel-art crescent (`src/lib/logo-mark.ts`, one shared outline path) + `Blessed_Moon` wordmark, in the nav (`LogoMark`) and generated into the favicon, apple touch icon, and Open Graph/Twitter image via `next/og` `ImageResponse` (`src/app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, `twitter-image.tsx`). Metadata (title template, OG/Twitter tags, robots), `robots.ts`, `sitemap.ts` all target `src/lib/site-config.ts`'s `SITE_URL` — `TASK-seo-favicon-and-logo.md` | built |
| Pages | `/`, `/work`, `/about`, `/contact` per `docs/design-handoff.md` Screens | complete — all four routes built, statically generated, responsive, and included in the sitemap (`TASK-finish-studio-subpages.md`), then restructured onto the homepage's morphing-window system (`TASK-subpage-morph-expansion.md`) |
| Deployment target | Current production URL is `https://blessed-moon.vercel.app` (confirmed by the user, used as `SITE_URL` for SEO metadata) — whether that stays the final domain, or a custom domain gets attached later, is still open; don't assume otherwise without asking | live at a Vercel URL, final domain open |

**Version numbers written anywhere in this file or `docs/design-handoff.md` are a snapshot at
time of writing, not a pin.** Treat every one as potentially stale — see §2.0 before adding a
dependency.

### Things that must not break

- **No border-radius / sharp corners** — explicit intentional choice per the TUI aesthetic
  (`docs/design-handoff.md` Design Tokens; `--radius: 0rem` in `src/app/globals.css`). Don't
  let shadcn's default rounded corners slip back in on new components.
- **Dark theme only** — `<html class="dark">` is hardcoded in `src/app/layout.tsx`; this is
  not a site with a light-mode toggle, don't add one speculatively.
- **The ASCII effect must degrade gracefully.** Feature-detect WebGL support; a user without
  it should still get a fully readable, correctly laid-out page (plain dark background is an
  acceptable fallback) — never a blank or broken hero.
- **Section numbering (`01 / ABOUT`, `02 / SERVICES`, …) drives the scroll-morph keyframes**
  — it's a structural/interaction contract from the Dragonfly reference
  (`docs/design-handoff.md` References), not decorative. Don't renumber or drop a section
  without checking what keyframe it drove. On the homepage the `data-ascii-keyframe`
  attributes no longer sit on the sections themselves: absolutely positioned inside one
  sticky frame, all five report the same `getBoundingClientRect().top`, which the tracker
  can neither order nor interpolate between. `ScrollMorphStage` emits them as zero-size
  markers in its tall wrapper instead, at the scroll offset where each layer is centered.
- **Surfaces are cool, the accent is warm.** Every surface token in `globals.css` (`--border`,
  `--muted-foreground`, `--accent`, `--panel`, `--panel-edge`, `--cell-line`) carries a blue
  cast; the ground stays near-black and `#ff6a1f` stays the only hue with warmth. That
  contrast is what makes the amber read as light rather than as orange-on-grey — don't
  "fix" a surface token back to neutral white-alpha, and don't introduce a second accent
  colour, which is the wrong answer to a palette that feels thin.
- **The homepage body is ONE terminal window, not five panels.** `ScrollMorphStage` owns a
  single persistent `TerminalPanel`-styled frame whose width and height interpolate with
  scroll between each section's size, with the views crossfading inside it. It was built as
  five crossfading windows first and that was wrong: if the page's premise is one thing
  morphing, the window is a thing and it morphs too. The section eyebrow lives in that
  window's title bar — that's the one honest job for a number that isn't a sequence.
- **The homepage body's descending count (8 → 4 → 3 → 1) is the morph mechanism, not
  decoration** — each numeral is one DOM element handed between two sections via Motion's
  `layoutId` (`MorphToken`, `src/components/homepage/morph-count.tsx`). Changing a section's
  copy so its number no longer matches what the next section shows breaks the one thing the
  sequence is built around. Both sides of a handoff must stay in sync.
- **Every staged page shares the token *language*, never the *motif*.** An amber glyph at
  display size means "this is the object in flight" everywhere (`src/components/
  morph-tokens.ts`); what travels is chosen per page, because a motif copied across three
  pages is the same trick with meaning only the first time. `/` counts down (breadth →
  one commitment), `/work` travels the project name (the row you pick becomes the page,
  chained through each entry's `next →` line), `/about` travels `A → B → 0` (two pillars,
  zero layers between — the pillar letters are already in the data). Adding a stage to a
  new page means choosing what that page has to say, not reusing one of these. Amber's
  other job — small, on a control, meaning *interactive* — must never land on the same
  glyph, which is why `/work`'s index rows are a listing rather than three links.
- **One rAF loop, and reads never interleave with writes.** Every scroll-driven component
  subscribes to `src/components/frame-loop.ts`, which runs all `read` callbacks before any
  `write` callback. Seven components previously owned a loop each, and a write from one
  invalidated layout for the next one's read. Don't call `requestAnimationFrame` directly in
  a new component, and don't read layout (`getBoundingClientRect`, `getComputedStyle`) in a
  `write` — that silently reintroduces the thrash for everyone, not just the new component.
  `scroll-progress.ts` depends on this too: it now caches document-relative offsets and
  resolves from `scrollY`, which is only valid while everything it tracks is in normal
  document flow (`TASK-frame-budget-cleanup.md`). A genuinely independent nested scroller
  would break that assumption and require live rects again.
- **The moon's engine must stay DOM-optional, and nothing may statically import
  three.js into a page bundle.** `ascii-engine.ts` runs unmodified in a worker
  (`ascii-object.worker.ts`) and on the main thread; every global it needs that a
  worker lacks — canvas size, DPR, `prefers-reduced-motion`, both observers,
  `OrbitControls` — is injected or skipped at one guarded branch. Reaching for
  `window`/`document` anywhere else in that file breaks the worker path silently,
  because the fallback looks identical. `moon-transform.ts` is imported by both
  threads and must import nothing at all. Separately: the 660KB three.js chunk
  must never reach a page's main-thread bundle through a static import — the
  closing CTA's `ParticleObject` did exactly that and cancelled out most of the
  benefit of moving the moon off-thread, which is why the fallback engine is a
  dynamic `import()`. `/system` reports which path a device actually got
  (`data-moon-path`), since the two are deliberately indistinguishable by eye.
- **Performance claims here need medians of repeated runs, never a single measurement.**
  Run-to-run spread on the homepage is roughly ±1.5fps and ±1.5pp of dropped frames — the
  same size as most changes worth making. `pnpm run profile` handles this (discards a warmup run,
  reports a median) and aborts if the page didn't load cleanly, because a stale `next-server`
  serving 500s profiles *beautifully* while running no JavaScript at all. Both mistakes were
  made and nearly shipped as conclusions; see `TASK-frame-budget-cleanup.md` § Methodology.
- **The boot screen's animations must only ever supply an *earlier* state to fill backwards
  from.** Every element's base style is its final, visible state; the `@keyframes` add a
  hidden state before it (`animation-fill-mode: backwards`). A browser that drops the
  animation therefore shows a complete screen. Two previous versions of this overlay could
  render *nothing*, which is why animation had been removed from it entirely — inverting one
  of these into a `forwards` fill that ends on the visible state brings that failure back.
  The exit is the exception and is allowed `forwards`, because its elements are removed on a
  `setTimeout` either way — and that teardown must never be moved onto `animationend`.
- **Wireframe copy and section order are final** per `docs/design-handoff.md` ("Fidelity").
  Colors/type are a starting palette, not locked — but section content and structure should
  not be silently rewritten; if something in the wireframe seems wrong, flag it before
  changing it.

### Start here

1. `docs/design-handoff.md` — the design handoff: screens, copy, interactions, design
   tokens, files, references.
2. `docs/design/wireframes.dc.html` + `docs/design/screenshots/*.png` — visual reference for
   the four selected screens (`homepage-1c`, `work-1d`, `about-1e`, `contact-1f`).
3. **Current route scope is complete:** `/work`, `/about`, and `/contact` now extend the ASCII
   canvas keyframes across their own sections. Any new route or production integration still
   requires a task document before code changes.

---

## 1. Plan before executing — write a task document first

**Rule:** Before editing or creating **any** code file, write a task document at
`docs/tasks/TASK-<slug>.md` describing the work. No exceptions for "small" changes.

This applies from the very first scaffold commit: no code exists yet, so the initial
`create-next-app` scaffold gets a task document before any file is created.

### 1.1 Required sections

Every task document must contain these four sections, in this order:

1. **Current scenario** — how it works today. What exists, what's missing or blocked. For
   the first tasks, this is simply "wireframe-only, no app code."
2. **Planned changes** — what will change, file by file. New behaviour, not just "edit X."
   Note any alternatives considered and rejected.
3. **Why** — justification with context. What does this unblock, what does it cost?
4. **Affected files** — a table:

   | File | Change type | Notes |
   |------|-------------|-------|
   | `app/page.tsx` | new | homepage per wireframe `1c` |
   | `components/ascii-canvas.tsx` | new | WebGL ASCII background layer |

### 1.2 How to apply it

- **Write the document silently.** Create the file, then point the user at it or summarize
  in 2–3 lines, and wait for alignment on anything significant before writing code.
- **One document per task / unit of work.** Short kebab-case slug:
  `TASK-scaffold-nextjs.md`, `TASK-ascii-canvas-layer.md`, `TASK-homepage-sections.md`.
- **Keep it in sync** if the plan changes mid-task — it's a living record, not write-once.
- **The document is the contract.** When scope is unclear, the task doc is the source of
  truth for what was agreed.

### 1.3 Why this matters

The user wants review and alignment before code is written — avoids work that gets
rejected, and leaves a trail of *why* a decision (e.g. how the ASCII shader is structured,
how scroll keyframes map to sections) was made, which won't be obvious from the code alone
later.

---

## 2. Use CLIs, generators, and SDKs — don't write everything by hand

**Rule:** Prefer invoking existing, canonical tooling over hand-authoring files a tool can
generate correctly.

### 2.0 Assume your framework knowledge is outdated — check first, every time

Frontend tooling moves fast, and this stack adds a fast-moving browser API (WebGL/Canvas)
on top. Before scaffolding anything or writing framework-specific code:

1. **Go to the framework's own current docs first** — Next.js, Tailwind, shadcn/ui. Don't
   rely on remembered APIs or flags; they may already be wrong.
2. **Use the official CLI to scaffold/generate**, not a hand-written file:
   `pnpm create next-app@latest`, `pnpm dlx shadcn@latest init` / `add <component>`.
3. **shadcn/ui specifically**: not a versioned dependency installed once — components are
   pulled into the repo via its CLI and the CLI/registry conventions change. Re-check its
   docs each time rather than reusing a pattern from memory. **Before any UI work**, load
   the `frontend-design:frontend-design` skill first and build with shadcn components
   rather than hand-rolled markup/CSS.
4. **Take the current major version as authoritative** over anything written in this file.
   If Next.js's own site says a newer major is current and stable, use that, and update
   this file's stack table to match (§3.1).
5. **WebGL/Canvas browser support and technique specifics**: verify current behaviour
   against the offscreencanvas.com references and MDN before building the shader layer —
   don't guess at WebGL API shape from memory.

### 2.1 What this looks like in practice

- **Scaffolding & generators.** `pnpm create next-app@latest`, `pnpm dlx shadcn@latest add
  button input textarea card select`, `gh repo create`.
- **Run the command, then verify the output** rather than hand-recreating what a reliable
  generator already produces.
- **Use the agent's dedicated tools** (Read/Edit/Write/Grep) over improvised shell commands
  when one fits.
- **One package manager, decided at scaffold time, then never mixed.**

### 2.2 When to hand-write instead

No generator covers the ASCII/WebGL shader layer, scroll-morph keyframe logic, or the
specific restyling needed to match the design tokens — that's hand-written, matching
surrounding code style. If a WebGL API detail isn't something you can verify directly,
write `[VERIFY: ...]` rather than guessing.

### 2.3 Why this matters

Less human error, canonical and reproducible output, and — for the visual system
specifically — a result that actually matches shadcn's and Next.js's current conventions
instead of a stale pattern from training data.

---

## 3. Update documentation after executing

**Rule:** Before considering a task **done**, update all documentation affected by the
change.

### 3.1 What to check and update

- **`CLAUDE.md`** — if the change alters the stack, architecture, or any of §0's "things
  that must not break," update the corresponding section here.
- **`/system`** (`src/app/system/page.tsx`) — a new shared component added to
  `src/components/` gets a panel here as part of finishing its task; a shared component
  without a panel is an unfinished task, the same way a stale `README.md` is (see
  `TASK-system-design-page.md`).
- **`README.md`** — the *implementation* README (setup, scripts, status). Update when
  scripts, stack, or the "Status" section change.
- **`docs/design-handoff.md`** — the design spec (screens, tokens, interactions, references).
  Historical source of truth for *why* the design looks the way it does — update it only if
  a design decision genuinely changes (not just because the implementation differs slightly
  from the wireframe pixels).
- **`docs/tasks/`** — keep task docs in sync while work is in progress (§1.2).

### 3.2 How to apply it

Treat "docs updated" as an explicit checklist item before declaring a task complete. When
unsure whether a doc is affected, grep for the thing you changed (a section name, a design
token, a route) across `README.md`, `docs/design-handoff.md`, and `CLAUDE.md`.

### 3.3 Why this matters

The wireframe handoff already drifted once (this file previously described an unrelated
project). A doc that silently goes stale is how a future session ends up building against
the wrong spec.

---

## 4. Project conventions

**Rule:** Single Next.js app, not a monorepo — no need for workspace tooling unless a real
second package emerges.

- **Layout (current + proposed):**

  ```
  src/app/                  Next.js App Router routes: /, /work, /work/[slug], /about, /contact — built;
                             /system — hidden, noindex design-system page, unlinked — built;
                             icon.tsx, apple-icon.tsx, opengraph-image.tsx, twitter-image.tsx,
                             robots.ts, sitemap.ts — generated brand/SEO assets — built
  src/components/ui/        shadcn primitives (button, input, textarea, card, select) — scaffolded
  src/components/canvasui/  canvasui.dev components via shadcn CLI: AsciiObject — now just the
                             React wrapper over ascii-engine.ts (the headless engine, shared
                             verbatim by the main thread and ascii-object.worker.ts);
                             ParticleObject, ParticleScroll, DecryptReveal (installed, none
                             currently on a live page) — built
  src/components/animate-ui/ StarsBackground via shadcn CLI — built
  src/components/homepage/  homepage-only section composites (hero, about-teaser, services-focus,
                             how-we-work, selected-work, pricing-table) — built.
                             The five between Hero and the CTA are layers of one
                             ScrollMorphStage (see morph-count.tsx for the 8→4→3→1 motif they
                             hand between them); Hero keeps its own pin, and the page closes
                             on the shared PageCta
  src/components/work/      /work morph layers (work-index, work-case) — built
  src/components/about/     /about morph layers (about-principle, about-pillar,
                             about-dynamic) — built
  src/components/           shared composites (site-nav, site-footer, section-heading,
                             ascii-canvas, sound-provider, sound-toggle, boot-sequence,
                             logo-mark, scroll-stage, scroll-morph-stage, terminal-panel,
                             cell-grid, page-hero, page-cta, morph-tokens — the token type
                             language every staged page shares; frame-loop — the single
                             rAF conductor every scroll-driven component subscribes to) — built
  scripts/                   profile-scroll.mjs — performance harness (`pnpm run profile`;
                             `--mode scroll` for frame pacing, `--mode load` for cold-load blocking)
  src/lib/                   shadcn's cn() helper etc.; ascii-canvas/scroll-progress.ts —
                             scroll-position tracker driving the moon's morph;
                             ascii-canvas/moon-transform.ts — the morph→camera tables and
                             easing, imported by both threads so it must stay DOM-free; logo-mark.ts —
                             shared pixel-crescent path (+ LOGO_BOUNDS, the cells it fills);
                             boot-info.ts — the boot lockup's facts and swatches;
                             site-config.ts — SITE_URL — built
  public/sounds/              hover/click/toggle/ambient audio, CC0 — see README Credits
  public/models/               moon.glb — see TASK-ascii-canvas-layer.md for the asset pipeline
  docs/design-handoff.md    design spec (screens, tokens, interactions, references)
  docs/design/               wireframes.dc.html + screenshots/ (design reference assets)
  docs/tasks/                task docs (§1)
  ```

- **Package manager:** **pnpm** (decided at scaffold time via `TASK-scaffold-nextjs.md`),
  never mixed.
- **Styling:** Tailwind CSS v4 + shadcn/ui, restyled to the design tokens in
  `docs/design-handoff.md` (already wired into `src/app/globals.css`) — don't introduce a
  second styling system (CSS-in-JS, another component library) alongside it.

**Why:** this is a marketing site, not a distributed system — the process should stay
lightweight and match the size of the problem, not import heavyweight process from
unrelated prior projects.

### 4.1 Commit conventions

- **Commit automatically once a task doc's work is complete and verified** (build/lint
  passing) — don't wait to be asked for each one. This is a standing authorization scoped
  to work that followed the task-doc process in §1; it is not blanket permission for
  destructive git operations (force-push, `reset --hard`, etc.), which still require
  explicit confirmation.
- **No `Co-Authored-By` trailer.** Commit messages in this repo do not carry a Claude
  co-authorship line — user preference, applies to every commit here regardless of the
  harness's default.

---

## TL;DR

| Phase | Rule | Output |
|-------|------|--------|
| **Stack** | Next.js 16 + Tailwind v4 + shadcn/ui + canvasui.dev/animate-ui components (ASCII moon bg, particles, dissolve panel, star field) + sound + boot sequence + generated logo/favicon/OG/SEO | Single-app repo: `src/app/`, `src/components/`, `docs/tasks/` |
| **Before** | Write a task document first | `docs/tasks/TASK-<slug>.md`: current scenario, planned changes (file by file), why, affected-files table |
| **During** | Use CLIs / generators — `create-next-app`, shadcn CLI; never hand-roll what a generator produces | Canonical, reproducible output; `[VERIFY: ...]` inline for anything unconfirmed (esp. WebGL/browser APIs) |
| **After** | Update `README.md` / `docs/design-handoff.md` / `CLAUDE.md` as needed, then commit — auto-committed once verified | Docs in sync, a commit |

**The loop:** plan → align → build with tooling → document → commit → done. **Never
broken:** sharp corners / no border-radius, dark-only theme, graceful WebGL fallback,
section numbering driving the moon's morph, wireframe copy treated as a starting point (not
locked — confirmed by the user) with changes flagged in the relevant task doc.
