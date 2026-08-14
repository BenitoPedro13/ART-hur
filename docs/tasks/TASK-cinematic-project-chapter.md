# TASK: Scroll-linked project timeline

## 1. Current scenario

The first ART'hur reference-led prototype correctly removed the inherited desktop simulation, but it still presents projects as a carousel with a central media frame, previous/next controls, and a large track list.

The supplied `docs/milez-home-example.mov` and the user's highlighted reference frame establish a more specific target:

- one full-viewport stage remains sticky while the document scrolls normally
- a curved dotted timeline crosses the stage
- a branded glyph travels physically along that line according to scroll progress
- each timeline node represents a project
- the active project changes as the glyph reaches its node
- project backgrounds continuously cross-morph into one another between nodes
- titles, year, role, and neighboring work remain quiet overlays around the dominant atmosphere
- the persistent header stays minimal

This is not a project-detail chapter and not a carousel. The home experience is a scroll-scrubbed project timeline.

The previous cinematic-chapter implementation was never committed. It was discarded before this corrected plan was written. The repository is restored to the last verified archive prototype.

### Reference observations

The reference frame uses one composed field rather than separate cards:

- a dark, full-screen background made from overlapping project imagery and oversized authored marks
- tiny fixed navigation at the top
- a curved dotted route with several visual nodes
- one active glyph attached to the route
- central project context and quiet bottom project labels
- previous and next project identity implied through the in-place morph rather than visible side-by-side cards

ART'hur should borrow this interaction model, not MILEZ's Japanese lettering, brand marks, assets, exact curve, or exact layout.

### Frame-study method

The motion direction is now grounded in two source captures rather than a single still:

- `docs/timeline-swings.mov`, the interaction reference
- `docs/ART'hur.mov`, the current ART'hur implementation capture

Both files were inspected with `ffprobe` and sampled with `ffmpeg` at four full-resolution frames per second, twice the requested minimum. The source files are 3420 × 2062 H.264 captures. The reference is 7.776667 seconds long and produced 31 sampled frames. The ART'hur capture is 21.835 seconds long and produced 87 sampled frames. Derived PNG frames and contact sheets live only in Jcode scratch storage, not in the repository.

This comparison must be completed before another source-code pass. The videos remain ignored and unmodified.

### Comparative motion findings

The user's review of both captures establishes the decisive distinction:

1. **The project composition stays centered.** The reference is not a laterally moving world and must not become an open horizontal carousel. The image field remains anchored in one central stage while its visual state changes.
2. **The glyph provides the travel.** Scroll moves the authored glyph along the curved route. The project canvas itself does not follow the glyph sideways.
3. **Every project layer morphs in place.** The centered image, full-stage background, oversized authored mark, title, year, role, crop, tone, and local contrast all interpolate into the previous or next project.
4. **The morph is more than opacity.** Adjacent states may crossfade, but they must also interpolate scale, focal crop, mask or clip geometry, blur, brightness, grayscale, texture, and typography displacement so the result feels like one composition changing identity.
5. **Only two adjacent states dominate.** The current and next or previous project overlap in the same centered visual slot. Other projects remain mounted but visually absent.
6. **The dotted route is connective tissue, not the main graphic.** It stays thin and quiet while the marker walks across it.
7. **The marker needs authored locomotion.** It must rotate to the route tangent and use a restrained distance-driven gait that reverses correctly with scroll direction.
8. **Typography morphs with the image.** Titles and metadata do not remain fixed while only the photograph changes, and they do not move in from offscreen as carousel labels.
9. **Reverse travel is deterministic.** Scroll selects a destination project. A separate eased transition value drives image, background, text, mask, path, and glyph states so reverse selection produces the inverse transition without scrubbing every effect directly from wheel distance.
10. **No lateral camera movement.** Viewport anchoring remains stable at every quarter-interval between projects.

### Corrective requirements from the video comparison

- Replace the one-template model with per-project morph descriptors: image scale, focal crop, clip geometry, blur, tone, background treatment, title displacement, title scale, and metadata displacement.
- Keep every project layer centered in the same fixed stage coordinates. Do not translate the canvas horizontally with scroll.
- Interpolate only the adjacent `from` and `to` project states in place. Do not expose them as side-by-side cards or offscreen panels.
- Compute route tangent from nearby SVG path points and rotate the ART'hur marker to face travel direction. Add one restrained locomotion cycle tied to traveled distance, not elapsed time, so it also reverses correctly.
- Replace numbered circular nodes with quieter project-specific anchors. Node numbering may remain in the accessible index, not as the dominant visual language on the route.
- Morph title and metadata opacity, blur, scale, and local displacement together with the image and background.
- Reduce the fixed grid, global shade, giant repeated title layer, and marker badge. Preserve contrast locally around essential copy instead of darkening every project identically.
- Give each adjacent project pair its own centered morph profile while retaining one shared scroll engine.
- Verify the forward and reverse path at quarter-interval scroll positions, not only at project nodes.
- Treat the current `ART'hur.mov` as evidence of the gap, not as an approved visual state.

### Corrected 8 fps sequence reading

The second pass sampled 62 full-resolution frames from `timeline-swings.mov` at 8 fps and reviewed both the full viewport and a fixed center crop.

- From approximately 0.00–2.50 seconds, one project composition remains centered while its image, oversized mark, background tone, and copy change intensity together.
- Around 2.50–3.00 seconds, that centered composition collapses into a very dark bridge state. It does not travel sideways or expose a neighboring card.
- From approximately 3.00–6.00 seconds, the stage remains compositionally anchored while the quiet route and glyph preserve continuity through the dark interval.
- Around 6.00–7.00 seconds, the next centered project composition resolves into the same viewport slot.
- The capture's elapsed time reflects both scroll pauses and independently eased transitions. Scroll determines which project is selected, not every intermediate shader frame.
- The center crop confirms that image registration is stable. The transition language is displacement, dissolve, blur, crop, tone, and authored darkness, not camera travel.

### State-machine evidence from the reference console

The reference console exposes repeated pairs such as:

- `selectDescId` and `prevDescId`
- `goto: 3200`
- `_to: 3200` and `_to: 4000`

This confirms a discrete selection model:

1. Native scroll reaches a project threshold or `goto` position.
2. The selected description/project ID changes.
3. The previous ID is retained as the transition source.
4. An eased transition runs from previous to selected independently of additional wheel frames.
5. Reverse scrolling selects the previous ID and runs the inverse transition.

The visible path is also local, not a map of every project. Only the segment around the previous and selected projects is rendered. Its outer portions swing like an eased sine wave while its middle anchor remains compositionally centered. The path geometry is updated during the transition, and the glyph position must be recalculated from that live path on every transition tick so it never separates from the line.

### External component audit

Two React Bits components are approved, each with one specific job.

#### `MorphSlider`, adapted as a controlled morph canvas

- **Storytelling job:** provide the WebGL displacement transition that melts the centered current project image into the centered next or previous project image.
- **Intensity layer:** primary background/media morph. The shader must remain subordinate to the walking glyph and project content.
- **Existing regional sula:** the walking glyph. Therefore use one restrained `melt` profile, low aberration, no pointer ripples, no carousel controls, and no autoplay.
- **Keyboard and touch:** native document scroll remains the only controller. Remove MorphSlider's drag, arrow-key carousel, buttons, indicators, and `aria-roledescription="carousel"` behavior.
- **Reduced motion:** bypass shader displacement and show the nearest centered project state immediately.
- **SSR and failure:** render a centered DOM image fallback before WebGL initializes and retain it if WebGL is unavailable or its context is lost.
- **Ownership:** install the official source, then adapt its OGL engine to accept `fromIndex`, `toIndex`, transition progress, and direction from one shared transition controller. Retain or reuse the official GSAP sequencing model because scroll selects the target but does not scrub every shader frame.
- **Identity test:** use project focal points, ART'hur tones, and authored dark intervals. Do not preserve React Bits demo captions, radius, controls, or slider semantics.

Official registry source:

```bash
pnpm dlx shadcn@latest add @react-bits/MorphSlider-TS-CSS
```

#### `BlurText`, compact index heading

- **Storytelling job:** mark the transition from the immersive morphing archive into the complete textual index, resolving the phrase like an image coming into focus.
- **Intensity layer:** secondary index transition. It is not part of the timeline's primary centered-morph sula.
- **Existing regional sula:** the index has none. The walking glyph remains exclusive to the sticky timeline region.
- **Keyboard and touch:** presentational text only, so it must not alter interaction or reading order.
- **Reduced motion:** render the final text immediately with no blur or displacement.
- **SSR:** preserve readable source text and avoid making the index dependent on animation hydration.
- **Identity test:** re-token the component to ART'hur typography, timing, and neutral palette. Do not retain the React Bits demo treatment.

Installation must use the official React Bits shadcn registry command documented by the current project:

```bash
pnpm dlx shadcn@latest add @react-bits/BlurText-TS-CSS
```

### Content assumptions

- Populated Payload projects define timeline order.
- Project covers provide the morphing background layers.
- Year and the first credit provide the quiet active-project metadata.
- Existing gallery and description content remain available for later dedicated project routes, but are not required for this home timeline task.
- The Living Tag and its custom apostrophe path provide the source language for the moving ART'hur glyph.
- Final project video and Arthur-authored identity assets are still required for final art direction.

## 2. Planned changes

1. Replace the carousel stage with a tall native-scroll timeline section.
2. Keep one full-viewport visual stage sticky inside that section.
3. Set one native scroll threshold or `goto` position per project.
4. Track native window scroll with one passive listener and `requestAnimationFrame`.
5. Convert scroll position into a discrete target index without intercepting wheel, touch, or keyboard scrolling.
6. When the target index changes, retain the previous index and start one eased transition controller from `0` to `1`.
7. Draw only the local previous-to-selected curved dotted segment as SVG. Do not render the full path of all projects.
8. Morph the segment's outer control points during the transition while keeping its middle anchor stable.
9. Recompute the glyph with `getPointAtLength()` and the live path tangent on every transition tick so it remains attached to the swinging line.
10. Keep the project media centered behind the path and use the adapted React Bits `MorphSlider` WebGL canvas to melt the previous cover into the selected cover in place.
11. Morph the surrounding DOM layers from the same independently eased transition value:

- opacity
- scale
- crop or clip shape and focal position
- blur
- grayscale/brightness balance
- background tone and texture
- title and metadata blur, opacity, scale, and small local displacement

12. Keep the stage, media canvas, and text anchor centered. No project layer may translate laterally with overall timeline progress.
13. Update React state only when the selected project changes. Transition ticks update glyph, live path, shader, image, background, and text through refs or controlled uniforms.
14. Display title, year, role, and sequence position as restrained layers that morph with the project.
15. Remove previous/next arrows, side-by-side project exposure, and the large track-list footer from the sticky experience.
16. Add a compact text index after the timeline as the complete keyboard and low-motion browsing alternative.
17. Let compact-index selections scroll the native document to the selected project's `goto` position.
18. Keep the existing content-managed contact link in the quiet global header.
19. Use the Living Tag only once in the header. The moving glyph is a transformed timeline marker, not a second full wordmark.
20. Update README and the current delivery section of `CLAUDE.md` after the timeline architecture is implemented and verified.

### Technical model

```text
small directional wheel/touch-scroll gesture → immediate previous/next goto
        ↓ selected project changes after a short intent threshold
previous index + selected index
        ↓ independent eased transition, 0 → 1
sticky 100svh visual stage
        ├── fixed centered DOM image fallback
        ├── fixed centered React Bits/OGL morph canvas
        ├── fixed centered background and typography layers
        ├── one local SVG segment exiting both viewport edges
        ├── continuously breathing outer path controls with stable middle anchor
        ├── ART'hur glyph recalculated on the live path
        └── morphing active project metadata
```

Scroll selection model:

```text
accumulate the signed scroll delta while the sticky timeline is active

when abs(accumulatedDelta) crosses the small intent threshold:
  targetIndex = currentIndex + sign(accumulatedDelta)
  goto the target project's document anchor
  reset the accumulator
  begin the authored in-place visual transition
```

The threshold exists only to distinguish intent from trackpad noise. It must be small enough that one modest wheel notch or short touch-scroll movement selects the adjacent project. The user must never need to scroll halfway through a project-sized document interval before anything happens.

Transition model after `targetIndex` changes:

```text
fromIndex = previously selected project
toIndex = targetIndex
transitionProgress = ease(0 → 1 over the authored transition duration)

on each ambient path tick:
  keep the route entering and leaving through the viewport edges
  continuously breathe the outer control points
  preserve the registered middle anchor at the exact viewport center beneath the glyph
  recalculate glyph point and tangent from the live path

on each project transition tick:
  update WebGL morph uniforms
  update centered background and text layers
  add a stronger directional swing to the ambient path motion
  recalculate glyph point and tangent from the live path
```

Only the adjacent `from` and `to` states should be visually prominent during a transition. They occupy the same centered slot.

### Reduced-motion behavior

When `prefers-reduced-motion: reduce` is active:

- preserve native scrolling and the complete timeline
- change the selected project immediately at the threshold
- keep one static edge-to-edge path and snap the glyph to its selected stable state
- switch backgrounds without shader displacement, path swing, scale, clip, blur, or filter interpolation
- keep active title and metadata immediate
- retain the compact index and all project access

### Active-image hover distortion

Use the React Bits `RippleDistortion` component as a restrained interaction layer over the centered active project image.

- `MorphSlider` remains the sole project-to-project transition renderer.
- Mount the ripple layer inside the fixed centered media frame, above the stable MorphSlider image.
- Reveal and enable it only while a fine pointer hovers the media frame and no project transition is active.
- Hide it before a project transition starts so it cannot replace or obscure the authored cross-project morph.
- Feed it only the currently selected project's resolved hero image.
- Tune strength, swirl, rings, dispersion, tint, and glint to ART'hur's restrained marked-frequency language rather than the React Bits demo defaults.
- Preserve image focal clarity. The hover should feel like a local liquid disturbance, not a permanent full-image filter.
- Disable wave input and animation for reduced motion, touch-only interaction, failed WebGL initialization, hidden documents, and inactive hover state.
- Keep the underlying MorphSlider/DOM image visible as the fallback at all times.

### Mobile behavior

- Keep the same sticky timeline model.
- Use a simplified but still curved path that continues through both portrait viewport edges.
- Keep the moving glyph and cross-morphing backgrounds.
- Reduce peripheral labels and decorative grid lines before reducing the active project information.
- Avoid horizontal overflow and avoid converting the design into stacked cards.

### Performance boundaries

- WebGL is approved for the centered React Bits morph canvas.
- A second OGL canvas is approved only as the active-image hover ripple and must remain idle or unmounted while inactive.
- Keep a DOM fallback for reduced motion, failed initialization, context loss, and unsupported devices.
- Do not load or autoplay every project video.
- Preload only the current and adjacent project textures where practical.
- Use a small signed-delta intent accumulator while the sticky timeline is active.
- One modest wheel notch or short touch-scroll gesture must trigger the adjacent project goto.
- Synchronize the document to the selected project's anchor without scrubbing the visual transition.
- Use one low-cost animation ticker for the continuously breathing path and attached glyph.
- Layer the project transition envelope onto that same ticker rather than creating a second perpetual loop.
- Cancel the transition, frame, and listener on unmount.
- Pause the ambient ticker when the document is hidden and restart it without a phase jump.
- Keep WebGL and typography transition work paused while the selected project is stable.
- Keep React state changes to project selection boundaries.

### Intensity audit

| Region          | Assertive element                     | Quiet support                 |
| --------------- | ------------------------------------- | ----------------------------- |
| Sticky timeline | Morphing project atmosphere           | Header, metadata, dotted line |
| Timeline route  | Moving ART'hur glyph                  | Static project nodes          |
| Active project  | Background and current title together | Year, role, position          |
| Compact index   | None preferred                        | Text rows and active state    |

### Non-goals

- No project-detail chapter in this task
- No dedicated `/work/[slug]` route
- No autoplay sound
- No interactive carousel behavior inside the WebGL component
- No horizontal camera or side-by-side project travel
- No direct wheel-to-shader scrubbing after the selected project threshold is known
- No long dead scroll interval before an adjacent project is selected
- No full multi-project route or project nodes visible at once. The single local segment must still exit through both screen edges.
- No copied MILEZ glyphs, Japanese marks, assets, curve, or exact transition timings
- No Payload schema migration
- No deletion of inactive legacy desktop components

## 3. Why

The user explicitly wants the timeline interaction visible in the reference: scroll drives the route, the glyph walks the curve, and project atmospheres morph behind it.

The current prototype expresses project selection through conventional controls. That makes the interface feel like a designed carousel rather than one centered composition changing identity. A scroll-linked curve and in-place WebGL morph make navigation the core authored moment while keeping the glyph as ART'hur's recognizable movement.

This approach also satisfies the existing specification:

- native scrolling remains the source of truth
- one dominant movement guides each region
- the background atmosphere carries the room
- the glyph is the single sula interruption
- controls and metadata recede
- the experience remains usable without WebGL or video
- the compact index provides the low-motion alternative

## 4. Affected files

| File                                           | Planned change                                                                                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/tasks/TASK-cinematic-project-chapter.md` | Replace the incorrect chapter plan with this corrected scroll-timeline plan before implementation.                                                                        |
| `components/archive/archive-prototype.tsx`     | Implement scroll measurement, SVG path nodes, moving ART'hur glyph, adjacent background interpolation, active metadata, neighboring labels, and compact index navigation. |
| `components/RippleDistortion.jsx`              | Add and adapt the React Bits hover distortion with inactive-loop suspension, reduced-motion handling, context cleanup, and the supplied JavaScript + CSS API.             |
| `components/RippleDistortion.css`              | Scope the ripple canvas as a full-frame overlay without changing media-frame geometry.                                                                                    |
| `app/(frontend)/globals.css`                   | Replace carousel presentation rules with the sticky timeline stage, morphing atmosphere, responsive curve composition, and reduced-motion states.                         |
| `README.md`                                    | Describe the scroll-linked timeline prototype and its reference relationship.                                                                                             |
| `CLAUDE.md`                                    | Record the timeline as the current delivery architecture and explicitly reject translating MILEZ into a carousel.                                                         |

## Verification and acceptance

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Prettier check for every changed file
- [ ] `git diff --check`
- [ ] Timeline section uses native document scroll with no nested scroll container
- [ ] Visual stage remains sticky for the project sequence
- [ ] One modest wheel notch or short touch-scroll gesture immediately selects the adjacent project
- [ ] The document goto position synchronizes to that project without directly scrubbing the visual transition
- [ ] The glyph route transform stays locked to the exact viewport center
- [ ] Only the glyph's internal walker animates its walking cycle while idle
- [ ] Scroll only selects a target project; the visual morph completes on its own authored easing
- [ ] Holding scroll still after a threshold does not freeze a transition midway
- [ ] Only one local path segment is visible, and it enters and exits through the left and right screen edges
- [ ] Path outer sections keep breathing while the selected project is idle
- [ ] Project transitions add a stronger directional swing while the middle anchor remains stable
- [ ] Glyph position and tangent are recalculated after every ambient and transition path update
- [ ] Glyph snaps to project nodes under reduced motion
- [ ] Adjacent project backgrounds cross-morph continuously between nodes
- [ ] Image canvas, full-stage background, title, and metadata remain centered at every quarter interval
- [ ] No project card, image panel, or camera translates laterally with global scroll progress
- [ ] React Bits MorphSlider source is adapted to controlled scroll uniforms with no carousel controls, autoplay, drag, or carousel ARIA
- [ ] Hovering the stable centered project image reveals the React Bits RippleDistortion layer
- [ ] RippleDistortion is hidden during project morph transitions and updates to the newly active hero afterward
- [ ] RippleDistortion does not animate while inactive, reduced motion is active, or the document is hidden
- [ ] The underlying project image remains visible if RippleDistortion cannot initialize
- [ ] WebGL melt reverses deterministically when scrolling upward
- [ ] DOM fallback remains visible if WebGL is unavailable or reduced motion is enabled
- [ ] Only node-boundary changes trigger active-project React state updates
- [ ] Previous/next arrow cluster is absent
- [ ] Large carousel track list is absent from the sticky stage
- [ ] Active title, year, role, and position remain legible
- [ ] Previous and next project labels remain atmospheric and nonessential
- [ ] Compact index is keyboard operable and scrolls to the selected node
- [ ] Header and contact remain keyboard reachable
- [ ] Desktop and 390px mobile views have no horizontal overflow
- [ ] Mobile retains the curved path, moving glyph, and morphing background
- [ ] Reduced motion preserves all projects and project selection
- [ ] Empty or single-project data fails gracefully
- [ ] No inherited desktop UI appears
- [ ] Reference `.mov` files remain ignored and unmodified
- [ ] Blessed Moon remains clean and untouched

## Outcome

Pending implementation. This corrected plan must be committed before source files are changed.
