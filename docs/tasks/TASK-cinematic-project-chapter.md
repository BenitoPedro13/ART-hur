# TASK: Cinematic project chapter

## 1. Current scenario

The first reference-led prototype successfully removed the inherited macOS desktop presentation, but it still behaves primarily as a slideshow. A giant title, central media card, previous/next arrows, and a large track list make project switching the dominant interaction.

Frame analysis of `docs/milez-home-example.mov` changes the implementation target. The 15.663-second recording was inspected with `ffprobe`, one-second and quarter-second `ffmpeg` contact sheets, scene-change detection, and larger transition keyframes. Its strongest relevant behavior is not a carousel:

- a tiny persistent navigation frame remains stable
- one project unfolds as a continuous cinematic chapter
- media, negative space, crops, masks, scale changes, and brief black pauses carry the sequence
- titles and metadata are present but restrained
- project selection appears at the release or transition point rather than competing with the active scene
- native page movement reveals the chapter instead of presenting every project as an equal card

The local recording is an article/project sequence at a `/article/...` URL even though the file is named as a home example. ART'hur should adopt its chapter logic without copying MILEZ branding, Japanese cultural material, exact compositions, or transitions.

Current Payload data already provides a cover, gallery images, year, credits, and description for each project. No schema change is required for this prototype revision.

### Content assumptions

- The first populated Payload project is the initial featured chapter.
- Existing project covers and gallery images are valid prototype media.
- Current titles, roles, years, credits, and descriptions are treated as CMS content, but no unconfirmed outcome, client claim, or metric will be invented.
- Some projects may have fewer than two gallery images. The chapter must adapt without empty visual slots.
- Final motion art direction still depends on approved source video and Arthur-authored marks.

## 2. Planned changes

1. Replace the slideshow-oriented home composition with one continuous active-project chapter.
2. Retain the tiny persistent ART'hur frame with identity, index/info anchors, and content-managed contact.
3. Recompose the active project into four native-scroll scenes:
   - **Opening scene:** dominant cover image, restrained project title, year, and role
   - **Context scene:** project metadata and one gallery image arranged as an editorial transition rather than a card
   - **Media scene:** remaining gallery media given the viewport with minimal interface competition
   - **Release scene:** quiet next-project preview and explicit next-project action
4. Remove previous/next arrows and the large track-list footer from the first-view interaction model.
5. Keep project switching available only at intentional release points:
   - the next-project action at the end of the chapter
   - a compact all-work index after the cinematic sequence
6. When a project changes, update the active content as one state transition and return to the chapter opening. Do not preload or render every full project video.
7. Use native scrolling and CSS sticky composition only where it clarifies the sequence. Do not intercept the wheel, simulate scroll, or create a second scroll container.
8. Use the active project's cover and populated gallery media with Payload focal points.
9. Keep animation to one authored entrance or cut per scene. Reduced motion must remove masks, scale changes, and smooth project-return behavior while preserving the complete chapter.
10. Preserve a layered mobile composition through overlaps and full-bleed media. Do not collapse the chapter into conventional stacked cards.
11. Keep the Living Tag quiet and singular in the persistent frame.
12. Update the README and the current delivery section in `CLAUDE.md` after the implementation reflects the new chapter architecture.

### Interaction model

- The active project is the page's narrative subject.
- Header links move to real landmarks within the same native document.
- The compact index changes the active project through keyboard-accessible buttons.
- The next-project release changes the active project and returns to the opening landmark.
- No interaction relies on cursor position, hover, sound, WebGL, or JavaScript-only visual meaning.

### Intensity audit

| Region        | Assertive element                | Quiet support                             |
| ------------- | -------------------------------- | ----------------------------------------- |
| Opening       | Cover media                      | Small title, year, role, persistent frame |
| Context       | One gallery composition          | Credits and project description           |
| Media         | Gallery image or paired sequence | Caption/index only                        |
| Release       | Next-project preview             | Next title and action                     |
| Compact index | None preferred                   | Text rows, year, active state             |

### Non-goals

- No Payload schema migration
- No dedicated `/work/[slug]` route in this task
- No autoplay sound or large video loading
- No copied MILEZ assets, typography, cultural marks, or one-for-one transitions
- No new UI or motion dependency
- No deletion of the inactive legacy `components/desktop/` code in this task

## 3. Why

The newly supplied MILEZ recording reveals that the desired quality comes from temporal composition within one project, not from making the project selector visually dramatic.

The current prototype still gives its strongest visual weight to a repeatable carousel template. That suppresses project-specific storytelling and keeps the work inside a visible interface frame. A continuous chapter lets the media own the viewport, makes transitions feel editorial rather than component-driven, and better incorporates YK Produce's media-first pacing.

This revision also follows the brand specification more closely:

- motion guides the chapter instead of advertising controls
- full-bleed media is the region's single assertive element
- metadata remains clear and credited
- the site feels cinematic through pacing and composition rather than effect count
- the CMS remains the technical foundation without dictating the presentation

## 4. Affected files

| File                                           | Planned change                                                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/tasks/TASK-cinematic-project-chapter.md` | Define the analyzed reference delta, implementation sequence, assumptions, non-goals, and acceptance checks before code changes.                          |
| `components/archive/archive-prototype.tsx`     | Replace slideshow controls and the dominant track list with a continuous project chapter, end release, and compact project index.                         |
| `app/(frontend)/globals.css`                   | Replace slideshow-stage rules with native-scroll cinematic scenes, sticky/layered media composition, responsive behavior, and reduced-motion equivalents. |
| `README.md`                                    | Describe the cinematic chapter prototype and clarify that MILEZ informs sequencing rather than a carousel layout.                                         |
| `CLAUDE.md`                                    | Update the current delivery sequence after the new chapter architecture is implemented and verified.                                                      |

## Verification and acceptance

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Prettier check for every changed file
- [ ] `git diff --check`
- [ ] First view has no previous/next arrow cluster or large track list
- [ ] Active project unfolds through at least opening, context/media, and release regions
- [ ] Persistent header remains quiet and keyboard reachable
- [ ] Cover and available gallery media use Payload alt text and focal points
- [ ] Missing gallery entries do not create empty chapter regions
- [ ] Next-project release and compact index are keyboard operable
- [ ] Project change returns to the opening without wheel interception or a nested scroll container
- [ ] Reduced motion preserves every scene and removes authored masks/scale transitions
- [ ] Desktop and 390px mobile views have no horizontal overflow
- [ ] Mobile preserves overlap and media dominance rather than card stacking
- [ ] No inherited desktop UI appears on the active route
- [ ] Reference `.mov` files remain ignored and unmodified
- [ ] Blessed Moon remains clean and untouched

## Outcome

Pending implementation. This task document is intentionally committed before source changes.
