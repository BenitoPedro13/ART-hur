import type { DesktopItem, Project } from "@/payload-types"

/**
 * The archive's project order.
 *
 * Projects are curated by dropping them into a folder desktop item, so the
 * public sequence is whatever those folders contain — not every row in the
 * collection. The home timeline, /index, and /work all read the sequence from
 * here so they can never disagree about membership, order, or a project's
 * position in it.
 */
export function selectedProjects(items: DesktopItem[]): Project[] {
  return items
    .flatMap((item) => (item.type === "folder" ? (item.projects ?? []) : []))
    .filter((project): project is Project => typeof project === "object")
    .filter(
      (project, index, all) =>
        all.findIndex((candidate) => candidate.id === project.id) === index
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * `meta` is a free-form credit list, so there is no dedicated role field. The
 * first credit is the one the editor put first, which is the closest thing to
 * a declared role. Returns null rather than inventing one.
 */
export function projectRole(project: Project): string | null {
  return project.meta?.[0]?.value ?? null
}

/** Every credit as label/value pairs, with blank rows dropped. */
export function projectCredits(
  project: Project
): { label: string; value: string }[] {
  return (project.meta ?? [])
    .filter((credit) => credit.label && credit.value)
    .map((credit) => ({ label: credit.label, value: credit.value }))
}

/**
 * Position and neighbours for one project inside the sequence.
 *
 * `next` wraps to the first project so the case study always offers somewhere
 * to go; `previous` is left null at the start because walking backwards off
 * the front of an archive reads as an error, not a loop.
 */
export function projectNeighbours(projects: Project[], slug: string) {
  const index = projects.findIndex((project) => project.slug === slug)

  if (index === -1) {
    return { index: -1, total: projects.length, next: null, previous: null }
  }

  return {
    index,
    total: projects.length,
    next: projects.length > 1 ? projects[(index + 1) % projects.length] : null,
    previous: index > 0 ? projects[index - 1] : null,
  }
}

/** Two-digit ordinal for display, e.g. `03`. Sequence positions are 1-based. */
export function frameNumber(index: number): string {
  return String(index + 1).padStart(2, "0")
}

/** The archive's year span, e.g. `2024 — 2026`, or a single year, or null. */
export function yearSpan(projects: Project[]): string | null {
  const years = projects
    .map((project) => project.year)
    .filter((year): year is string => Boolean(year))
    .sort()

  if (years.length === 0) return null

  const first = years[0]
  const last = years[years.length - 1]

  return first === last ? first : `${first} — ${last}`
}

/**
 * How many gallery stills a project carries.
 *
 * The archive's real projects arrive as photo sequences with no credits and no
 * description, so the frame count is often the only concrete thing there is to
 * say about one in a list. It is real data, unlike a placeholder role.
 */
export function projectFrameCount(project: Project): number {
  return project.gallery?.length ?? 0
}
