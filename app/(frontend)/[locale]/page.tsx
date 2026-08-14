import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArchivePrototype } from "@/components/archive/archive-prototype"
import { OpeningSequence } from "@/components/site/opening-sequence"
import { SiteFooter } from "@/components/site/site-footer"
import { compact, StructuredData } from "@/components/site/structured-data"
import { getDictionary, isLocale } from "@/lib/i18n"
import { getDesktopItems, getSite } from "@/lib/payload"
import { selectedProjects, yearSpan } from "@/lib/projects"
import { buildMetadata, personSchema, websiteSchema } from "@/lib/seo"

/**
 * Rendered per request rather than prerendered.
 *
 * Two reasons: the build machine has no reason to hold database credentials,
 * and an editor changing content in /admin should see it live without waiting
 * for a redeploy.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  // A database blip must not take the page down; the layout supplies a title.
  let site: Awaited<ReturnType<typeof getSite>>
  try {
    site = await getSite(locale)
  } catch {
    return {}
  }

  const metadata = buildMetadata({
    locale,
    path: "",
    site,
    description: site.tagline ?? site.seo?.siteDescription,
    // No `image`: opengraph-image.tsx supplies an authored card, and an
    // explicit value here would take precedence over the file convention.
  })

  // The home is the one page whose title should not gain the "— ART'hur"
  // suffix the layout template appends.
  return {
    ...metadata,
    title: { absolute: site.seo?.siteTitle || site.ownerName },
  }
}

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

  // Shared with /index and /work so all three agree on order and membership.
  const projects = selectedProjects(items)

  const dictionary = getDictionary(locale)

  /**
   * The plate states real archive facts, the way every slate on the site does.
   * Resolved here on the server so the opening never waits on a fetch.
   */
  const openingMeta = [
    // No owner row: the wordmark directly above already says the name.
    {
      label: dictionary.projects,
      value: String(projects.length).padStart(2, "0"),
    },
    { label: dictionary.year, value: yearSpan(projects) ?? "—" },
  ]

  const schema = {
    "@context": "https://schema.org",
    "@graph": [compact(websiteSchema(site, locale)), compact(personSchema(site, locale))],
  }

  return (
    <>
      <StructuredData data={schema} />
      <OpeningSequence dictionary={dictionary} meta={openingMeta} />
      <ArchivePrototype
        locale={locale}
        ownerName={site.ownerName}
        projects={projects}
        tagline={site.tagline ?? null}
      />
      {/*
        The colophon closes the archive on the same Newsprint the index band
        opened, so the page ends on a surface rather than cutting back to the
        room. It is also the only place the home offers the sound control, the
        language switch, and a direct contact path — none of which the
        cinematic stage above may carry.
      */}
      <div className="timeline-colophon">
        <SiteFooter dictionary={dictionary} locale={locale} site={site} />
      </div>
    </>
  )
}
