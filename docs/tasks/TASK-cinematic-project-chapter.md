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
- adjacent projects visible as atmospheric neighbors rather than equal navigation cards

ART'hur should borrow this interaction model, not MILEZ's Japanese lettering, brand marks, assets, exact curve, or exact layout.

### Frame-study method

The motion direction is now grounded in two source captures rather than a single still:

- `docs/timeline-swings.mov`, the interaction reference
- `docs/ART'hur.mov`, the current ART'hur implementation capture

Both files were inspected with `ffprobe` and sampled with `ffmpeg` at four full-resolution frames per second, twice the requested minimum. The source files are 3420 × 2062 H.264 captures. The reference is 7.776667 seconds long and produced 31 sampled frames. The ART'hur capture is 21.835 seconds long and produced 87 sampled frames. Derived PNG frames and contact sheets live only in Jcode scratch storage, not in the repository.

This comparison must be completed before another source-code pass. The videos remain ignored and unmodified.

### Comparative motion findings

The 4 fps study changes the implementation target in several important ways:

1. **The reference behaves as one navigable visual world, not a sequence of full-screen slides.** Adjacent project scenes remain spatially present beyond the active center. Scrolling changes the camera/composition through that world. ART'hur currently replaces one viewport-filling cover with another, so the transition still reads as a slideshow even though opacity, scale, clipping, and filtering are interpolated.
2. **The dotted route is connective tissue, not the main graphic.** In the reference it is thin, low-contrast, oblique, and allowed to cross imagery and empty space. The current centered sine-like route, numbered circular nodes, and bright active marker read as a conventional infographic laid on top of the work.
3. **The marker needs authored locomotion.** The reference marker is visually attached to the route and its travel reads directionally. ART'hur currently translates a rigid circular badge to points on the path without tangent rotation, directional facing, squash, step, or any other internal gait. It moves, but it does not yet “walk.”
4. **The scene morph is spatial before it is chromatic.** Reference imagery changes through overlapping crops, panel displacement, scale, depth, and the reveal of the neighboring composition. ART'hur primarily crossfades two full-bleed layers and adds a symmetric inset clip, which produces a dissolve with a shrinking rectangle rather than one scene becoming another.
5. **Typography belongs to each project scene.** In the reference, labels and large authored marks occupy different positions and scales per project, with active information staying restrained. ART'hur keeps one fixed centered title template and swaps its content at the nearest-node boundary. This makes every project inherit the same composition and causes the title to dominate the photography.
6. **Project spacing is art-directed, not mechanically equal.** The reference route has uneven visual beats and different amounts of negative space around each node. ART'hur distributes all nodes uniformly along one reusable curve and gives every transition the same geometry.
7. **Reverse travel is part of the behavior.** The reference capture moves through transitions in both directions. Every transform, reveal, marker orientation, and typography state must therefore be a deterministic function of scroll progress. No one-way entrance animation or stateful transition may be required for the composition to look correct.
8. **Darkness is a compositional buffer, not an empty loading state.** The reference contains very dark intervals around approximately 3.00–5.75 seconds, but faint route, neighboring imagery, and spatial continuity retain orientation. ART'hur should permit quiet low-information passages without allowing the screen to become an unexplained blank or letting the next cover suddenly replace it.
9. **The current capture changes scenes too literally.** FFmpeg scene analysis finds many pronounced whole-frame changes in `ART'hur.mov` from 6.00 through 20.75 seconds, while the shorter reference concentrates its strongest changes around 2.25–3.00 and 6.00 seconds. Capture speed is user-controlled and cannot define duration, but the distribution confirms that ART'hur's full-frame layers create repeated scene cuts instead of a smaller number of continuous spatial swings.
10. **The fixed grid and oversized title are over-authored support elements.** They repeat unchanged across all ART'hur projects, suppress project-specific image character, and compete with the route. The reference spends its boldness on the moving world and marker, while navigation, grid lines, and metadata recede.

### Corrective requirements from the video comparison

- Replace the one-path/one-template model with per-project scene descriptors: route point, camera offset, image crop, image panel bounds, title position, title scale, tone, and neighboring-scene exposure.
- Interpolate the scene camera and adjacent project descriptors continuously from scroll progress. Do not make a full-viewport cover opacity crossfade the primary morph.
- Keep two neighboring project compositions partially mounted and spatially visible so the user can see where the marker came from and where it is going.
- Compute route tangent from nearby SVG path points and rotate the ART'hur marker to face travel direction. Add one restrained locomotion cycle tied to traveled distance, not elapsed time, so it also reverses correctly.
- Replace numbered circular nodes with quieter project-specific anchors. Node numbering may remain in the accessible index, not as the dominant visual language on the route.
- Move active and neighboring typography with the scene descriptors. Avoid one large centered heading shared by every project.
- Reduce the fixed grid, global shade, giant repeated title layer, and marker badge. Preserve contrast locally around essential copy instead of darkening every project identically.
- Give each adjacent project pair its own transition composition while retaining one shared scroll engine.
- Verify the forward and reverse path at quarter-interval scroll positions, not only at project nodes.
- Treat the current `ART'hur.mov` as evidence of the gap, not as an approved visual state.

### External component audit

**React Bits `BlurText`** is approved for the compact index heading only.

- **Storytelling job:** mark the transition from the immersive moving archive into the complete textual index, resolving the phrase like an image coming into focus.
- **Intensity layer:** secondary index transition. It is not part of the timeline's primary moving-world sula.
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
9. Keep all project cover layers mounted behind the path and cross-morph adjacent projects by updating:
   - opacity
   - scale
   - crop or clip shape
   - grayscale/brightness balance
10. Update React state only when the nearest active project changes. Per-frame glyph and background updates should mutate scoped element styles/attributes through refs rather than rerendering the whole component on every scroll event.
11. Display active-project title, year, role, and sequence position as restrained overlays.
12. Show previous and next project titles as atmospheric edge labels rather than arrow controls.
13. Remove the previous/next arrow cluster and large track-list footer from the sticky experience.
14. Add a compact text index after the timeline as the complete keyboard and low-motion browsing alternative.
15. Let compact-index selections scroll the native document to the selected timeline node.
16. Keep the existing content-managed contact link in the quiet global header.
17. Use the Living Tag only once in the header. The moving glyph is a transformed timeline marker, not a second full wordmark.
18. Update README and the current delivery section of `CLAUDE.md` after the timeline architecture is implemented and verified.

### Technical model

```text
native document scroll
        ↓
tall timeline section, approximately one viewport per project interval
        ↓
sticky 100svh visual stage
        ├── mounted Payload cover layers
        ├── SVG dotted curve
        ├── moving ART'hur glyph
        ├── project nodes
        ├── active project metadata
        └── neighboring project labels
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

Only the adjacent `from` and `to` cover layers should be visually prominent during a transition.

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

- No WebGL is required.
- Do not load or autoplay every project video.
- Only the first background image is priority-loaded.
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
- No WebGL or shader dependency
- No copied MILEZ glyphs, Japanese marks, assets, curve, or exact transition timings
- No Payload schema migration
- No deletion of inactive legacy desktop components

## 3. Why

The user explicitly wants the timeline interaction visible in the reference: scroll drives the route, the glyph walks the curve, and project atmospheres morph behind it.

The current prototype expresses project selection through conventional controls. That makes the interface feel like a designed carousel rather than a spatial sequence. A scroll-linked curve converts navigation into the core authored moment and gives ART'hur a recognizable behavior that can be branded through its own moving glyph.

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
