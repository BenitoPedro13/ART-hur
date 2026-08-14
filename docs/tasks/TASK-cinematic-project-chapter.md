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
9. **Reverse travel is deterministic.** Every image, background, text, mask, and glyph state derives from scroll progress so reverse scrolling produces the exact inverse transition.
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
- The capture's elapsed time reflects the user's scroll pauses, not prescribed animation duration. Implementation must map the same behavior continuously to scroll progress.
- The center crop confirms that image registration is stable. The transition language is displacement, dissolve, blur, crop, tone, and authored darkness, not camera travel.

### External component audit

Two React Bits components are approved, each with one specific job.

#### `MorphSlider`, adapted as a controlled morph canvas

- **Storytelling job:** provide the WebGL displacement transition that melts the centered current project image into the centered next or previous project image.
- **Intensity layer:** primary background/media morph. The shader must remain subordinate to the walking glyph and project content.
- **Existing regional sula:** the walking glyph. Therefore use one restrained `melt` profile, low aberration, no pointer ripples, no carousel controls, and no autoplay.
- **Keyboard and touch:** native document scroll remains the only controller. Remove MorphSlider's drag, arrow-key carousel, buttons, indicators, and `aria-roledescription="carousel"` behavior.
- **Reduced motion:** bypass shader displacement and show the nearest centered project state immediately.
- **SSR and failure:** render a centered DOM image fallback before WebGL initializes and retain it if WebGL is unavailable or its context is lost.
- **Ownership:** install the official source, then adapt its OGL engine to accept `fromIndex`, `toIndex`, `progress`, and direction from the timeline scroll engine. Remove GSAP sequencing because scroll progress is the source of truth.
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
3. Set the section's scroll distance from the number of projects so every adjacent project pair receives a deliberate transition interval.
4. Track native window scroll with one passive listener and `requestAnimationFrame`.
5. Convert scroll position into normalized progress from `0` to `1` without intercepting wheel, touch, or keyboard scrolling.
6. Draw a responsive curved dotted timeline as SVG.
7. Position one ART'hur glyph on the SVG path with `getPointAtLength()` using normalized scroll progress.
8. Place quiet project nodes along the same path at equal timeline intervals.
9. Keep the project media centered behind the path and use the adapted React Bits `MorphSlider` WebGL canvas to melt adjacent project covers in place.
10. Morph the surrounding DOM layers from the same `localProgress` value:

- opacity
- scale
- crop or clip shape and focal position
- blur
- grayscale/brightness balance
- background tone and texture
- title and metadata blur, opacity, scale, and small local displacement

11. Keep the stage, media canvas, and text anchor centered. No project layer may translate laterally with overall timeline progress.
12. Update React state only when the nearest active project changes. Per-frame glyph, shader, image, background, and text updates should use refs or controlled uniforms rather than rerendering the whole component on every scroll event.
13. Display title, year, role, and sequence position as restrained layers that morph with the project.
14. Remove previous/next arrows, side-by-side project exposure, and the large track-list footer from the sticky experience.
15. Add a compact text index after the timeline as the complete keyboard and low-motion browsing alternative.
16. Let compact-index selections scroll the native document to the selected timeline node.
17. Keep the existing content-managed contact link in the quiet global header.
18. Use the Living Tag only once in the header. The moving glyph is a transformed timeline marker, not a second full wordmark.
19. Update README and the current delivery section of `CLAUDE.md` after the timeline architecture is implemented and verified.

### Technical model

```text
native document scroll
        ↓
tall timeline section, approximately one viewport per project interval
        ↓
sticky 100svh visual stage
        ├── fixed centered DOM image fallback
        ├── fixed centered React Bits/OGL morph canvas
        ├── fixed centered background and typography layers
        ├── SVG dotted curve
        ├── moving ART'hur glyph
        ├── project nodes
        └── morphing active project metadata
```

Scroll progress calculation:

```text
progress = clamp(
  (window.scrollY - sectionTop) /
  (sectionHeight - viewportHeight),
  0,
  1
)
```

Project interpolation:

```text
projectPosition = progress × (projectCount - 1)
fromIndex = floor(projectPosition)
toIndex = min(fromIndex + 1, projectCount - 1)
localProgress = projectPosition - fromIndex
```

Only the adjacent `from` and `to` states should be visually prominent during a transition. They occupy the same centered slot.

### Reduced-motion behavior

When `prefers-reduced-motion: reduce` is active:

- preserve native scrolling and the complete timeline
- snap the glyph to the nearest project node instead of continuously gliding
- switch backgrounds at the nearest node without scale, clip, or filter interpolation
- keep active title and metadata immediate
- retain the compact index and all project access

### Mobile behavior

- Keep the same sticky timeline model.
- Use a simplified but still curved path sized for the portrait viewport.
- Keep the moving glyph and cross-morphing backgrounds.
- Reduce peripheral labels and decorative grid lines before reducing the active project information.
- Avoid horizontal overflow and avoid converting the design into stacked cards.

### Performance boundaries

- WebGL is approved for the centered React Bits morph canvas.
- Keep a DOM fallback for reduced motion, failed initialization, context loss, and unsupported devices.
- Do not load or autoplay every project video.
- Preload only the current and adjacent project textures where practical.
- Use one passive scroll listener and one scheduled animation frame.
- Cancel the frame and listener on unmount.
- Pause per-frame work while the timeline is fully outside the viewport where practical.
- Keep React state changes to project-node boundaries.

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
- [ ] Glyph position changes continuously along the SVG path during normal-motion scrolling
- [ ] Glyph snaps to project nodes under reduced motion
- [ ] Adjacent project backgrounds cross-morph continuously between nodes
- [ ] Image canvas, full-stage background, title, and metadata remain centered at every quarter interval
- [ ] No project card, image panel, or camera translates laterally with global scroll progress
- [ ] React Bits MorphSlider source is adapted to controlled scroll uniforms with no carousel controls, autoplay, drag, or carousel ARIA
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
