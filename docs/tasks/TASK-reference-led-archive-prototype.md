# TASK: Reference-led archive prototype

## 1. Current scenario

ART'hur currently renders the inherited `portfolio-template` as a literal computer desktop with a lock screen, wallpaper, menu bar, desktop icons, calendar, dock, draggable-style windows, and window-routed project content.

That presentation is not the intended design direction. The template should remain useful as a Next.js and Payload CMS foundation, but the public experience must be rebuilt around the supplied references.

The primary archive reference is the local `docs/MILEZ-portfolio.mov` recording and the live MILEZ archive at `https://milez.jp/archive/`. The relevant qualities are its quiet persistent frame, generous negative space, full-viewport project scenes, dominant image/title relationship, restrained navigation, layered editorial composition, and deliberate transitions. The local `docs/YK-PRODUCE-portfolio.mov` recording and `https://ykproduce.co.jp/` are the complementary motion reference for media-first staging, scale, contrast, and cinematic section pacing.

The project data currently available through Payload is provisional seed content. This task may use it to prove the interface and motion system, but it must not describe the placeholders as confirmed Arthur projects.

## 2. Planned changes

1. Replace the home route's inherited `Desktop` presentation with a new archive prototype.
2. Keep server-side Payload fetching and derive populated projects from the existing folder relationship.
3. Build a full-viewport selected-work scene with:
   - quiet ART'hur identity and navigation frame
   - oversized active project title
   - one dominant media field
   - role, year, and credit metadata
   - numbered archive sequence controls
   - direct contact link from content-managed site data
4. Give project changes one shared directional transition across title and media, with an immediate reduced-motion state.
5. Use the Living Tag once, quietly, as the global signature rather than repeating it as decoration.
6. Create a responsive mobile composition that stacks identity, title, media, metadata, and project sequence without any desktop metaphor.
7. Keep the old `components/desktop/` implementation in the repository temporarily as migration material, but remove it from the active home route.
8. Update the README to describe the reference-led prototype and the new repository guide.

This task does not add an external component library, change the Payload schema, implement every final route, or claim the placeholder media is final art direction.

## 3. Why

The user's clarified intent is to create an experience led primarily by MILEZ Archive, not maintain the portfolio template's existing design and layout.

A focused one-project identity prototype is also the next step required by `docs/BRAND-AND-EXPERIENCE-SPEC.md`. It tests the most important design decision before expanding scope: whether ART'hur can combine MILEZ-like typographic confidence and cinematic project sequencing with Arthur's own Marked Frequencies identity.

Keeping the CMS and data model while replacing the visual shell limits technical churn and creates a realistic path from provisional seed data to confirmed project content.

## 4. Affected files

| File                                                 | Change                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                          | Replace the copied Blessed Moon guide with ART'hur-specific rules and make MILEZ the primary visual reference.                  |
| `docs/tasks/TASK-reference-led-archive-prototype.md` | Record this implementation plan, assumptions, scope, and verification.                                                          |
| `app/(frontend)/[locale]/page.tsx`                   | Render the new archive experience while preserving server-side Payload fetching.                                                |
| `components/archive/archive-prototype.tsx`           | Add the narrow client boundary for active-project sequencing and accessible controls.                                           |
| `app/(frontend)/globals.css`                         | Replace desktop-oriented page atmosphere with the archive scene, transitions, responsive behavior, and reduced-motion handling. |
| `.prettierrc`                                        | Point the Tailwind formatter at the repository's actual global stylesheet path.                                                 |
| `README.md`                                          | Update the public implementation status and source-of-truth guidance.                                                           |

## Verification

- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `git diff --check`
- [x] Home no longer renders lock screen, desktop icons, calendar, dock, or window chrome
- [x] Project controls are keyboard reachable and expose an active state
- [x] Project title, year, role/credits, and media remain visible with reduced motion
- [x] Mobile composition does not recreate the desktop metaphor
- [x] Empty or unpopulated project relationships fail gracefully
- [x] No local reference recording is modified or committed

## Outcome

Implemented and browser-verified at desktop and mobile widths. The active home route now presents Payload projects as a layered editorial archive scene rather than a simulated desktop. Project changes share a directional title/media cut, the archive track exposes the full sequence, reduced motion removes the transition animations, and the existing CMS remains the source of project media and metadata.

The prototype was tested against the repository's current real Payload data. Final art direction still depends on confirmed project narratives, credits, and Arthur-authored identity assets.
