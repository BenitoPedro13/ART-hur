import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { IndexList } from "@/components/site/index-list"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Slate, slateRows } from "@/components/site/slate"
import { StructuredData } from "@/components/site/structured-data"
import { getDictionary, isLocale } from "@/lib/i18n"
import { mediaAlt, mediaOgSize, mediaUrl } from "@/lib/media"
import { getDesktopItems, getSite } from "@/lib/payload"
import { selectedProjects, yearSpan } from "@/lib/projects"
import { buildMetadata, siteUrl } from "@/lib/seo"

/** Rendered per request for the same reason as the home; see that route. */
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const dictionary = getDictionary(locale)

  let site: Awaited<ReturnType<typeof getSite>>
  let projects: ReturnType<typeof selectedProjects> = []
  try {
    const [loadedSite, items] = await Promise.all([
      getSite(locale),
      getDesktopItems(locale),
    ])
    site = loadedSite
    projects = selectedProjects(items)
  } catch {
    return { title: dictionary.indexLabel }
  }

  const span = yearSpan(projects)

  return buildMetadata({
    locale,
    path: "index",
    site,
    title: dictionary.indexLabel,
    description: [
      `${projects.length} ${dictionary.projects.toLowerCase()}${span ? `, ${span}` : ""}.`,
      site.seo?.siteDescription,
    ]
      .filter(Boolean)
      .join(" "),
    // The lead project rather than the generic site poster: an index of work
    // should preview as work.
    image:
      mediaUrl(projects[0]?.cover, "hero") ??
      mediaUrl(site.seo?.ogImage, "hero"),
    imageAlt: projects[0]
      ? mediaAlt(projects[0].cover, projects[0].title)
      : site.ownerName,
    ...mediaOgSize(projects[0]?.cover ?? site.seo?.ogImage),
  })
}

/**
 * The index: every project, no cinema.
 *
 * This is the route the accessibility section owes the reader — a complete,
 * fast, keyboard-first path through the work that never depends on WebGL, a
 * scroll gesture, or the walker. So it flips to the Newsprint sheet: the
 * archive printed rather than projected.
 */
export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const [site, items] = await Promise.all([
    getSite(locale),
    getDesktopItems(locale),
  ])
  const projects = selectedProjects(items)

  const rows = slateRows([
    {
      term: dictionary.projects,
      value:
        projects.length > 0 ? String(projects.length).padStart(2, "0") : null,
    },
    { term: dictionary.year, value: yearSpan(projects) },
  ])

  const base = siteUrl().origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: dictionary.indexLabel,
    url: `${base}/${locale}/index`,
    inLanguage: locale,
    // An ordered list, because the archive's order is curated, not incidental.
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: projects.map((project, position) => ({
        "@type": "ListItem",
        position: position + 1,
        url: `${base}/${locale}/work/${project.slug}`,
        name: project.title,
      })),
    },
  }

  return (
    <div className="shell-page" data-surface="sheet">
      <StructuredData data={schema} />
      <SiteHeader
        active="index"
        dictionary={dictionary}
        locale={locale}
        ownerName={site.ownerName}
      />

      <main className="shell-main">
        <div className="shell-inner">
          {projects.length > 0 ? (
            <IndexList
              aside={
                <>
                  <p className="font-data shell-muted">
                    {dictionary.indexLabel}
                  </p>
                  <h1 className="type-heading-m index-heading">
                    {site.tagline ?? site.ownerName}
                  </h1>
                  <Slate rows={rows} className="index-slate" />
                </>
              }
              dictionary={dictionary}
              locale={locale}
              projects={projects}
            />
          ) : (
            <p className="font-data shell-muted">{dictionary.indexEmpty}</p>
          )}
        </div>
      </main>

      <SiteFooter dictionary={dictionary} locale={locale} site={site} />
    </div>
  )
}
