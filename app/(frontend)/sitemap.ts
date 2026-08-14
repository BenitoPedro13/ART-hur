import type { MetadataRoute } from "next"

import { defaultLocale, locales } from "@/lib/locales"
import { getDesktopItems } from "@/lib/payload"
import { selectedProjects } from "@/lib/projects"
import { siteUrl } from "@/lib/seo"

/**
 * Built per request, not at build time: projects are curated in /admin and a
 * sitemap frozen at the last deploy would advertise stale URLs.
 */
export const dynamic = "force-dynamic"

/**
 * Every public URL, in every locale.
 *
 * Each entry carries `alternates.languages` so a crawler learns the whole
 * translation set from one row rather than inferring it — the same relationship
 * the pages declare through `hreflang`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().origin

  const url = (locale: string, path: string) =>
    `${base}/${locale}${path ? `/${path}` : ""}`

  const languagesFor = (path: string) =>
    Object.fromEntries(locales.map((locale) => [locale, url(locale, path)]))

  function entriesFor(
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    lastModified?: Date
  ): MetadataRoute.Sitemap {
    return locales.map((locale) => ({
      url: url(locale, path),
      lastModified,
      changeFrequency,
      // The default locale is the one to rank; the others are alternates.
      priority: locale === defaultLocale ? priority : priority * 0.9,
      alternates: { languages: languagesFor(path) },
    }))
  }

  // A database outage should degrade the sitemap, not 500 it.
  let projects: Awaited<ReturnType<typeof selectedProjects>> = []
  try {
    projects = selectedProjects(await getDesktopItems(defaultLocale))
  } catch {
    projects = []
  }

  return [
    ...entriesFor("", 1, "weekly"),
    ...entriesFor("index", 0.9, "weekly"),
    ...entriesFor("about", 0.7, "monthly"),
    ...entriesFor("contact", 0.6, "yearly"),
    ...projects.flatMap((project) =>
      project.slug
        ? entriesFor(
            `work/${project.slug}`,
            0.8,
            "monthly",
            project.updatedAt ? new Date(project.updatedAt) : undefined
          )
        : []
    ),
  ]
}
