# ART'hur — Brand, Visual Identity, and Experience Specification

**Status:** Direction-ready specification  
**Project:** Arthur's personal portfolio  
**Working title:** **ART'hur**  
**Format:** Immersive, art-directed portfolio with an editorial street-culture layer  
**Primary source material:** Arthur's current portfolio, MILEZ reference, YK Produce reference, `portfolio-template`, and Blessed Moon

---

## 1. Product definition

### Subject

Arthur is a visually literate creative whose taste sits between art direction, hip-hop, street culture, contemporary fashion, and digital craft.

### Audience

Creative directors, studios, agencies, artists, labels, collaborators, and culturally aware clients who make an aesthetic judgment before they read a résumé.

### The site's single job

Make a visitor feel Arthur's point of view quickly, then make his work effortless to inspect and Arthur effortless to contact.

### Positioning

**Arthur does not decorate culture. He composes with it.**

The portfolio should feel like entering a living archive: part studio wall, part contact sheet, part music-video title sequence, part personal operating system. It must never feel like a generic “creative developer” landing page with effects added afterward.

---

## 2. Reference analysis

The three supplied screen recordings were inspected with `ffprobe` and representative contact sheets extracted with `ffmpeg`.

| Reference | Runtime | Capture | What to retain |
|---|---:|---:|---|
| Arthur's current portfolio | 53.14 s | 3420 × 2062, 60 fps | Personal-computer metaphor, discoverability through objects/windows, playful self-authorship, a portfolio that behaves like a place rather than a document. |
| MILEZ portfolio | 88.24 s | 3420 × 2062, 60 fps | Oversized editorial typography, assertive pacing, full-bleed image treatment, deliberate transitions, and the confidence to let one composition dominate a viewport. |
| YK Produce portfolio | 54.26 s | 3420 × 2062, 60 fps | Cinematic media-first storytelling, motion as navigation, strong project sequencing, and a production-culture sensibility rather than a software-product sensibility. |

### Synthesis

The new site should not clone any reference. Its useful intersection is:

1. **Arthur's current site supplies the spatial model.** The visitor explores a personal creative environment.
2. **MILEZ supplies typographic confidence.** Type can occupy the screen and become image.
3. **YK Produce supplies cinematic rhythm.** Work is introduced through movement, crops, sequence, and sound-aware pacing.
4. **The new identity supplies the differentiator.** Hip-hop and street culture appear through authentic production artifacts, not spray-paint decoration pasted onto a conventional site.

### What not to copy

- Do not make a literal macOS clone. The operating-system idea is a starting architecture, not the final brand.
- Do not use graffiti type for body copy, navigation, form controls, or every heading.
- Do not stack unrelated WebGL, glow, text, cursor, and parallax effects to manufacture an “Awwwards” feel.
- Do not reproduce another creator's transitions one-for-one.
- Do not let immersion hide project names, roles, dates, credits, or contact information.

---

## 3. Brand platform

### Brand idea

**A living archive with rhythm.**

Arthur's work is presented like collected evidence from a creative practice: frames, marks, notes, credits, edits, posters, files, and fragments. The experience has the cadence of a track: introduction, build, verse, break, and release.

### Name treatment

Use **ART'hur** as an editorial signature, not as the only spelling of his name.

- **ART** foregrounds the practice.
- The apostrophe is the hinge or cut.
- **hur** returns the mark to the person.
- In metadata, accessibility labels, long-form copy, and formal credits, use **Arthur**.

Recommended lockups:

- `ART'hur`
- `ART / hur`
- `ARTHUR — ART DIRECTION & [confirmed discipline]`

Do not invent a professional title until Arthur confirms it.

### Essence

**Taste in motion.**

### Promise

A clear, memorable point of view expressed with care from concept through final frame.

### Values

- **Taste before noise**
- **Culture with context**
- **Craft in the cut**
- **Play with control**
- **Credit the collaborators**
- **Make the work felt, then understood**

### Personality

- Visually confident
- Restless but edited
- Culturally fluent
- Warm behind the edge
- Precise without looking sterile
- Playful without becoming novelty software

### Voice

Short, direct, observant. Avoid agency jargon and self-mythologizing.

**Good:**

- “Selected work, unfinished thoughts, and things worth replaying.”
- “Arthur makes identities, images, and digital experiences.”
- “Role, collaborators, year, and what changed.”
- “Play project.”

**Avoid:**

- “I craft disruptive experiences at the intersection of innovation and culture.”
- “Welcome to my creative universe.”
- Vague claims such as “award-winning” without evidence.
- Forced slang.

---

## 4. Visual direction

### Direction name

## **Marked Frequencies**

An editorial interface built from contact sheets, wheatpaste layers, track metadata, crop marks, and the controlled interruption of a hand-made tag.

### Signature element

**The Living Tag** is a single calligraphic ART'hur mark drawn as a motion path. It behaves like a DJ tag or producer stamp, not a decorative repeating graffiti texture.

Uses:

- One reveal in the opening sequence.
- One persistent but quiet mark in the global shell.
- A transformed version as a project transition mask.

It must not appear more than once in a visual region. It is the site's primary **sula** element.

### Aesthetic risk

The site mixes a disciplined Swiss/editorial grid with a genuinely irregular hand-authored mark. The grid is strict enough that the tag feels human and disruptive rather than messy. This is more specific to Arthur than a generic black site with neon effects.

---

## 5. Colour system

These values define the art direction. During implementation they must be mapped to semantic tokens. Components must not consume raw hex values directly.

| Name | Hex | Semantic purpose |
|---|---|---|
| **Vinyl Black** | `#0B0B0A` | Primary room/background |
| **Newsprint** | `#E9E2D2` | Primary text and light surfaces |
| **Concrete** | `#9D9A92` | Muted text, metadata, inactive states |
| **Oxide Red** | `#D83823` | Primary brand assertion and active state |
| **Tape Yellow** | `#E7C64A` | Annotation, temporary mark, secondary emphasis |
| **Flash Blue** | `#4B61FF` | Rare digital counterpoint, link/focus accent where contrast passes |

### Colour behavior

- The default experience is Vinyl Black with Newsprint text.
- Oxide Red is the dominant assertion colour.
- Tape Yellow behaves like physical annotation and must stay sparse.
- Flash Blue is not a second main accent. It appears only in digital/system moments.
- Photography and project media are allowed to own their native colours.
- Every semantic text/surface pairing must meet WCAG contrast requirements.
- USVA's `ink`, `muted`, `faint`, surface, and action roles should be mapped to this palette rather than bypassed.

---

## 6. Typography

Graffiti is a material, not the typesetting system.

### Roles

| Role | Direction | Candidate typefaces | Rules |
|---|---|---|---|
| Display | Compressed, poster-like grotesk | **Archivo Black / Archivo Narrow**, **Anybody Condensed**, or a properly licensed alternative | Hero titles, project names, transitions. Tight leading, responsive optical sizing. |
| Reading | Neutral grotesk with warmth | **Instrument Sans** or **Geist Sans** | Descriptions, case-study narratives, form copy. |
| Utility | Monospaced production metadata | **IBM Plex Mono** or **Geist Mono** | Credits, years, file labels, timestamps, filters. |
| Hand mark | Custom ART'hur lettering or one licensed graffiti face | Commissioned/hand-drawn preferred | Logo, one-word stamps, occasional project annotation only. Never paragraphs. |

### Type behavior

- Project titles may crop beyond the viewport at desktop sizes but must remain fully available to assistive technology.
- Headline line breaks are art-directed at large breakpoints and fluid below them.
- Utility labels should feel like production notes, not terminal cosplay.
- Avoid the generic combination of a high-contrast serif and neutral sans.
- Do not use more than three font families plus the custom mark.

### Initial scale

- Display XL: `clamp(4.5rem, 14vw, 13rem)`
- Display L: `clamp(3rem, 8vw, 8rem)`
- Heading M: `clamp(2rem, 4vw, 4.5rem)`
- Body L: `clamp(1.1rem, 1.6vw, 1.5rem)`
- Body: `1rem–1.125rem`
- Utility: `0.6875rem–0.8125rem`, uppercase only where semantically useful

---

## 7. Graphic language

### Core materials

- Contact sheets and frame numbers
- Crop marks and registration marks
- Masking-tape annotations
- Scanned paper grain
- Photocopier thresholding
- Halftone used on selected transitions
- File names and credits as real metadata
- Hand-drawn arrows, circles, and strike-throughs derived from Arthur's own hand if possible

### Rules

- Texture must not lower text contrast.
- Grain belongs to atmosphere layers, not every card.
- Marks should point to or classify something real.
- Avoid fake barcodes, random coordinates, meaningless serial numbers, and decorative “01/02/03” sequencing when order carries no meaning.
- Use actual project metadata whenever a technical/editorial label appears.

### Image treatment

- Work imagery stays large, sharp, and native-colour by default.
- Hover or transition states may use threshold, halftone, RGB split, or frame-scrub effects.
- One treatment per moment. Do not combine blur, split, grain, tilt, glow, and displacement at once.
- Maintain deliberate focal crops with project-specific art direction.

---

## 8. Layout system

### Concept

A **modular archive desk** replaces the generic macOS desktop. Projects remain openable objects, but the shell feels authored for Arthur: a canvas with pinned work, a track strip, a contact sheet, and floating editorial panels.

### Desktop structure

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ART'hur       INDEX / INFO / SOUND                      LOCAL TIME  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│       OVERSIZED ACTIVE PROJECT TITLE                                │
│                                                                     │
│  [project fragment]      [living tag]          [project fragment]   │
│                                                                     │
│                 full-bleed media / scene                            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ 01 — PROJECT       02 — PROJECT       03 — PROJECT       PLAY  ↗   │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile structure

```text
┌──────────────────────────┐
│ ART'hur          MENU    │
├──────────────────────────┤
│                          │
│ ACTIVE PROJECT           │
│ TITLE                    │
│                          │
│ [full-width media]       │
│                          │
│ role / year / credits    │
│ View project         ↗   │
├──────────────────────────┤
│ next project             │
└──────────────────────────┘
```

### Grid

- Desktop: 12 columns with a narrow outer frame and flexible gutters.
- Tablet: 8 columns.
- Mobile: 4 columns.
- Most content aligns to the grid. The Living Tag and selected media crops may break it.
- Section transitions should use shared alignment points so motion feels composed.

---

## 9. Information architecture

### Primary routes

1. **Home / Selected work**
2. **Project detail** `/work/[slug]`
3. **Index** `/index`
4. **About** `/about`
5. **Contact** `/contact` or global contact drawer
6. **CMS** `/admin`, retained from the portfolio template if Payload remains the content layer

### Home sequence

1. **Opening mark** — concise load sequence, skip immediately on repeat visits.
2. **Thesis hero** — Arthur's name, confirmed discipline, one active project scene.
3. **Selected work sequence** — 4–8 projects, each allowed to own a viewport or major region.
4. **Practice statement** — one short paragraph and capabilities.
5. **Archive strip** — experiments, stills, posters, process, or cultural references if Arthur has permission to publish them.
6. **Contact release** — direct email/social links and availability.

### Project detail anatomy

- Project title
- One-sentence premise
- Hero media
- Arthur's role
- Year
- Client or self-initiated status
- Collaborators and credits
- Deliverables
- Context
- Selected process, only when it adds understanding
- Final work in an art-directed sequence
- Outcome or reflection, without fabricated metrics
- Next project

### Index

The index is the fast, low-motion alternative to the immersive home experience. It must expose all work in a compact list with year, discipline, role, and client.

---

## 10. Motion and interaction

### Motion thesis

The site should move like an edit, not like a screensaver.

### Choreography

- **Opening:** the ART'hur mark draws once while one image resolves from halftone to full colour.
- **Project change:** title and media share one transition. Prefer masks, cuts, and directional wipes over generic fades.
- **Scroll:** one dominant pinned or scrubbed sequence at a time.
- **Hover:** project labels reveal useful metadata or scrub a short preview.
- **Case study:** calmer than the homepage. Reading should not fight ambient motion.
- **Contact:** no spectacle. Fast, legible, dependable.

### Sound

Sound is optional and muted by default.

- A visible sound control is required before any non-essential audio plays.
- Use original or properly licensed audio only.
- Do not autoplay audio on mobile.
- UI sounds should be sparse and quieter than project media.
- Reduced-motion mode should also reduce audiovisual transition intensity.

### Cursor

A custom cursor is allowed only on fine-pointer devices. It may show contextual verbs such as `OPEN`, `PLAY`, or `DRAG`, but the native pointer/focus semantics must remain clear.

### Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Remove smooth scrolling and parallax.
- Replace scrubbed media with static poster frames.
- Render the Living Tag in its completed state.
- Keep route and state changes immediate or use short opacity transitions.
- Preserve the complete content and hierarchy.

---

## 11. USVA intensity contract

This is a hard implementation rule.

> Core recedes. Patterns structure. Motion guides. Sula asserts. Atmospheres are the room.

### Region definition

A region is a bounded area competing for one attention focus: hero, one project viewport, one modal/drawer, one case-study chapter, or the footer/contact release.

### Rules

1. **Core primitives recede.** Buttons, inputs, cards, labels, drawers, and dialogs are quiet and functional.
2. **Patterns structure.** Project grids, navigation, gallery layouts, and metadata rows organize content without becoming the spectacle.
3. **Motion guides.** It explains active project, navigation direction, opening, closing, or sequence.
4. **Sula asserts.** At most one sula element per region. For ART'hur this is usually the Living Tag, an active-project type treatment, or one high-intensity media transition. Never all three.
5. **Atmospheres are the room.** Grain, ambient video, background fields, and colour wash sit behind the hierarchy.
6. Never place a sula element inside dense, task-bound UI such as the contact form, CMS, filters, or project metadata table.
7. If a region already contains a visually dominant full-bleed video, the video counts as its assertive element.

### Region audit table

| Region | Core | Pattern | Motion | Sula maximum | Atmosphere |
|---|---|---|---|---|---|
| Opening hero | Quiet nav/button | Hero composition | Mark draw + image resolve | Living Tag | Grain/room tone |
| Project viewport | Metadata/link | Media/title layout | Shared project transition | Media **or** display title | Native project colour |
| Index | Buttons/links | Dense list | Row focus only | None preferred | Flat surface |
| Case-study chapter | Controls/captions | Editorial grid | Image reveal | One standout media piece | Paper/grain optional |
| Contact | Form controls | Two-column layout | Drawer/open state | None | Flat surface |

---

## 12. Component strategy

### Principle

Use libraries as sources of proven behavior and accessible primitives. Do not let the visual language become a collage of component-demo aesthetics.

### Priority order

1. **USVA** for authored primitives and selected structural patterns.
2. **shadcn/ui** for missing accessible primitives and project-owned source code.
3. **AlignUI** for specific production-ready structures after reading its component documentation.
4. **React Bits** for one or two focused motion/text/media behaviors.
5. **Aceternity UI** for a carefully selected immersive effect when it survives the intensity audit.
6. Custom components for the Living Tag, project transitions, media choreography, and the archive shell.

### Candidate components

**USVA**

- Button
- Drawer
- Dialog
- Chip
- Card with quiet skin
- Scroll-area or navigation patterns where appropriate
- Form primitives for contact

Install through the shadcn-compatible registry, for example:

```bash
pnpm dlx shadcn@latest add https://usva.build/r/button.json
```

**shadcn/ui**

- Dialog/Drawer fallback
- Form-related primitives
- Tooltip
- Visually hidden/accessibility utilities
- CMS/admin controls if required

Required workflow:

```bash
pnpm dlx shadcn@latest docs <component>
pnpm dlx shadcn@latest view <component>
pnpm dlx shadcn@latest add <component>
```

Never manually recreate a component that is meant to come from its CLI.

**AlignUI**

- Evaluate project list rows, tags, and metadata structures.
- Read the current official documentation at `https://alignui.com/docs/` before use.
- Use the official AlignUI CLI rather than copying stale snippets.
- Re-token components to ART'hur's semantic system.

**React Bits**

Potentially suitable: one text reveal, image trail, pixel transition, or cursor-adjacent behavior. Confirm the current installation instructions and component API before implementation.

**Aceternity UI**

Potentially suitable: Direction Aware Hover, Lens, Compare, Pixelated Canvas, or one shader/media treatment. Avoid generic Aurora, Meteors, Sparkles, Moving Border, and stacked glowing backgrounds unless a project itself calls for them.

### Rejection rule

Before adding any external component, answer:

1. What user or storytelling job does it perform?
2. Which intensity layer does it belong to?
3. Is another sula element already present in the region?
4. Does it work with keyboard, touch, reduced motion, and server rendering?
5. Can it be retokened without fighting its implementation?
6. Does it improve Arthur's identity or merely resemble an Awwwards demo?

If the last answer is the latter, do not add it.

---

## 13. Technical direction

### Base

Reiterate the existing `portfolio-template` rather than starting from a blank visual shell.

Retain where useful:

- Next.js App Router architecture
- TypeScript
- Tailwind CSS v4
- Payload CMS and its project/media collections
- Vercel Blob integration
- Localized route structure if Arthur needs multiple languages
- Window/project routing concepts
- Contact route and content-managed site settings

Refactor or replace:

- Literal desktop wallpaper/calendar/dock presentation
- Generic shadcn theme defaults
- macOS mimicry that does not express Arthur
- Window chrome that competes with project media
- Any component inventory copied into the project but unused

### Next.js rule

Before writing Next.js implementation code, read the relevant version-matched guides in `node_modules/next/dist/docs/` as required by the repository agent rules.

### Suggested content model additions

**Project**

- title
- slug
- year
- client
- selfInitiated
- disciplines
- role
- premise
- context
- narrative blocks
- collaborators/credits
- hero media
- gallery media with focal points
- video poster, captions, and transcript where relevant
- preview clip
- accent/theme override
- featured order
- external URL
- next-project override

**Site**

- short bio
- availability
- primary email
- social links
- default SEO image
- sound-enabled asset references
- homepage project order
- archive items

### Performance budgets

- A usable first view must not depend on WebGL.
- LCP media should use an optimized poster and preload only when justified.
- Do not ship all project videos on initial load.
- Use adaptive video sources and muted inline previews.
- Target a responsive 60 fps for primary transitions on capable devices, with a stable 30 fps degradation path.
- Pause offscreen video, canvas, and animation loops.
- Lazy-load project chapters and high-resolution media.
- No scroll-jacking. Native scrolling remains the source of truth.

---

## 14. Accessibility and usability

- All project navigation is keyboard reachable.
- The index provides a complete non-cinematic route through the work.
- Every video has a poster, accessible name, controls when meaningful, captions for spoken content, and a pause mechanism.
- Custom cursors never carry information alone.
- Graffiti/custom lettering has an accessible text equivalent.
- Focus states use a semantic high-contrast token and are never removed.
- Touch targets are at least 44 × 44 CSS pixels where practical.
- The opening sequence is skippable and does not replay on every route transition.
- Text remains selectable.
- Media masks and overlays never obscure essential copy.
- Contact details remain available even if JavaScript fails.

---

## 15. Content and asset request

Before final art direction, collect:

- Arthur's confirmed title and disciplines
- 4–8 strongest projects
- Role and contribution for each project
- Client, year, collaborators, and publication permissions
- High-resolution stills and original video exports
- Portraits or candid studio imagery
- Existing sketches, handwriting, tags, signatures, or notebook marks
- Short biography and availability
- Social links and preferred contact method
- Music/audio rights information
- Whether Portuguese, English, or both are required

The hand-authored identity should be derived from Arthur's own marks where possible. A downloaded graffiti font is a fallback, not the brand concept.

---

## 16. Delivery phases

### Phase 0 — Content audit

- Confirm positioning, title, services/discipline, language, and featured work.
- Audit all media rights and credits.
- Select one representative project for the visual prototype.

### Phase 1 — Identity prototypes

Produce three focused artifacts, not three complete sites:

1. ART'hur wordmark and Living Tag motion study.
2. Hero/project transition prototype.
3. One project-detail chapter with real content.

Choose based on recognizability, content clarity, performance, and how authentically it reflects Arthur.

### Phase 2 — Foundation

- Fork/reiterate `portfolio-template` into this project.
- Configure semantic tokens and typography.
- Update Payload collections.
- Install USVA and other primitives through documented CLIs.
- Build accessibility and reduced-motion foundations first.

### Phase 3 — Core experience

- Global shell and navigation
- Home project sequence
- Project detail template
- Index
- About/contact
- Media pipeline

### Phase 4 — Signature motion

- Living Tag
- Project transition system
- Optional sound layer
- Custom cursor on fine pointers
- Project-specific media treatments

### Phase 5 — Verification

- Desktop, tablet, and mobile flows
- Keyboard-only navigation
- Reduced motion
- Screen-reader landmarks and labels
- Video pause/caption behavior
- Slow network and low-power device behavior
- Lighthouse and real-device performance
- CMS editing and publish workflow
- Broken-media fallbacks

---

## 17. Acceptance criteria

The direction is successful when:

1. A visitor can identify Arthur, his discipline, and a featured project within the first view.
2. The site is recognizably Arthur's without relying on his name or a stock graffiti font.
3. At most one sula element competes for attention in every audited region.
4. Project content remains clear with motion disabled.
5. Every featured project exposes role, year, credits, and meaningful media.
6. The index allows a visitor to browse all projects quickly.
7. The contact path takes no more than two deliberate actions from any primary route.
8. No external component retains an obvious library-demo appearance.
9. Initial content is usable without WebGL and before large videos load.
10. The site feels cinematic because of pacing and composition, not because of effect count.

---

## 18. Immediate implementation decisions

- **Keep:** portfolio-template's CMS/data foundation and the idea of explorable project objects.
- **Change:** literal desktop simulation into the Marked Frequencies archive shell.
- **Brand:** ART'hur as editorial signature, Arthur as the human-readable name.
- **Palette:** Vinyl Black, Newsprint, Concrete, Oxide Red, Tape Yellow, rare Flash Blue.
- **Signature:** one Living Tag per region at most.
- **Typography:** compressed grotesk + readable grotesk + production mono + custom hand mark.
- **Motion:** edited cuts, masks, and project-aware transitions. One dominant movement per region.
- **Components:** USVA first, then shadcn/AlignUI for behavior and structure, React Bits/Aceternity only for justified signature moments.
- **Next step:** collect real project content and build a one-project identity prototype before implementing the whole site.

---

## 19. Sources consulted

- Local `ART'hur/docs/arthur-current-portfolio.mov`
- Local `ART'hur/docs/MILEZ-portfolio.mov`
- Local `ART'hur/docs/YK-PRODUCE-portfolio.mov`
- Local `portfolio-template`
- Local Blessed Moon `CLAUDE.md`, package setup, and design handoff
- USVA LLM reference: `https://usva.build/llms.txt`
- React Bits: `https://reactbits.dev/`
- Aceternity UI components: `https://ui.aceternity.com/components`
- shadcn CLI documentation: `https://ui.shadcn.com/docs/cli`
- AlignUI documentation: `https://alignui.com/docs/`
