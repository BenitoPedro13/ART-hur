import { notFound } from "next/navigation"

import { ArchivePrototype } from "@/components/archive/archive-prototype"
import { isLocale } from "@/lib/i18n"
import { getDesktopItems, getSite } from "@/lib/payload"
import type { Project } from "@/payload-types"

/**
 * Rendered per request rather than prerendered.
 *
 * Two reasons: the build machine has no reason to hold database credentials,
 * and an editor changing content in /admin should see it live without waiting
 * for a redeploy.
 */
export const dynamic = "force-dynamic"

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const [site, items] = await Promise.all([
    getSite(locale),
    getDesktopItems(locale),
  ])

  const projects = items
    .flatMap((item) => (item.type === "folder" ? (item.projects ?? []) : []))
    .filter((project): project is Project => typeof project === "object")
    .filter(
      (project, index, all) =>
        all.findIndex((candidate) => candidate.id === project.id) === index
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const contactHref = site.contact?.rows?.find((row) => row.href)?.href ?? null

  return (
    <ArchivePrototype
      contactHref={contactHref}
      locale={locale}
      ownerName={site.ownerName}
      projects={projects}
      tagline={site.tagline ?? null}
    />
  )
}
