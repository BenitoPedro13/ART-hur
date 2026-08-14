import type { Metadata } from "next"

import { defaultLocale, locales, type Locale } from "./locales"
import type { Site } from "@/payload-types"

/**
 * The site's absolute origin.
 *
 * Every OG and canonical tag needs an absolute URL, and a crawler that reads a
 * preview deployment's tags pointing at production would index the wrong host.
 * So the order is: an explicit override first, then whatever host Vercel gave
 * this deployment, then localhost for development.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return new URL(explicit)

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim()
  if (vercel) return new URL(`https://${vercel}`)

  return new URL("http://localhost:3000")
}

/**
 * Every locale's URL for one path, plus the canonical.
 *
 * Slugs are not localized, so a project is genuinely the same document at
 * `/pt/work/x` and `/en/work/x` — exactly the case `hreflang` exists for.
 * `x-default` points at the default locale so a crawler with no language
 * preference has somewhere defined to land.
 */
function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  const clean = path.replace(/^\/+|\/+$/g, "")
  const suffix = clean ? `/${clean}` : ""

  const languages: Record<string, string> = {}
  for (const code of locales) {
    languages[code] = `/${code}${suffix}`
  }
  languages["x-default"] = `/${defaultLocale}${suffix}`

  return {
    canonical: `/${locale}${suffix}`,
    languages,
  }
}

/** Trims a description to something a search result will actually show. */
function clamp(
  text: string | null | undefined,
  limit = 165
): string | undefined {
  if (!text) return undefined

  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= limit) return flat

  // Cut on a word boundary so the ellipsis does not land mid-word.
  return `${flat.slice(0, flat.lastIndexOf(" ", limit - 1))}…`
}

/**
 * One metadata shape for every route.
 *
 * Centralised because the parts that are easy to get subtly wrong — absolute
 * OG URLs, per-locale canonicals, the `og:locale`/`og:locale:alternate` pair,
 * a Twitter card that does not silently fall back to a bare summary — should
 * be decided once rather than per page.
 */
export function buildMetadata({
  description,
  image,
  imageAlt,
  imageHeight,
  imageWidth,
  locale,
  path,
  site,
  title,
  type = "website",
}: {
  description?: string | null
  /** Absolute or root-relative; `metadataBase` resolves the relative case. */
  image?: string | null
  imageAlt?: string | null
  /**
   * The image's true pixel size. Arthur's covers are portrait, so declaring a
   * stock 1200×630 would tell every social platform to crop a tall photograph
   * as though it were a landscape card. Omitted when unknown — no dimensions
   * is honest; wrong dimensions is not.
   */
  imageWidth?: number | null
  imageHeight?: number | null
  locale: Locale
  /** Path after the locale segment, e.g. `work/casa-264` or '' for the home. */
  path: string
  site: Site
  /** Page title. Omit on the home so the site title stands alone. */
  title?: string | null
  type?: "website" | "article" | "profile"
}): Metadata {
  const siteName = site.seo?.siteTitle || site.ownerName
  const resolvedDescription = clamp(description ?? site.seo?.siteDescription)
  const resolvedImage = image ?? undefined

  const images = resolvedImage
    ? [
        {
          url: resolvedImage,
          alt: imageAlt ?? siteName,
          ...(imageWidth && imageHeight
            ? { width: imageWidth, height: imageHeight }
            : {}),
        },
      ]
    : undefined

  return {
    title,
    description: resolvedDescription,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type,
      siteName,
      title: title ?? siteName,
      description: resolvedDescription,
      url: `/${locale}${path ? `/${path}` : ""}`,
      locale,
      alternateLocale: locales.filter((code) => code !== locale),
      /**
       * Omitted entirely, not set to `undefined`, when there is no explicit
       * image. Next only merges an `opengraph-image` file-convention route in
       * when the field is absent — present-but-undefined counts as set, and
       * the generated card silently never attaches.
       */
      ...(images ? { images } : {}),
    },
    twitter: {
      // `summary_large_image` is the only card that does the work justice; a
      // portfolio previewing as a thumbnail defeats the point. Routes with a
      // generated card inherit theirs from the file convention.
      card: "summary_large_image",
      title: title ?? siteName,
      description: resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage] } : {}),
    },
  }
}

/**
 * The person behind the archive, as a schema.org node.
 *
 * Shared by the home and /about so both describe the same entity with the same
 * `@id` — that identity is what lets a crawler merge them into one profile
 * instead of two unrelated pages that happen to share a name.
 */
export function personSchema(
  site: Site,
  locale: Locale
): Record<string, unknown> {
  const base = siteUrl().origin
  const disciplines = (site.about?.disciplines ?? [])
    .map((discipline) => discipline.label)
    .filter(Boolean)

  const email = site.contact?.rows?.find((row) =>
    row.href?.startsWith("mailto:")
  )?.href

  return {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: site.ownerName,
    url: `${base}/${locale}/about`,
    description: site.about?.standfirst ?? site.tagline ?? undefined,
    email: email ? email.slice(7) : undefined,
    knowsAbout: disciplines.length > 0 ? disciplines : undefined,
    address: site.about?.basedIn
      ? { "@type": "PostalAddress", addressLocality: site.about.basedIn }
      : undefined,
    sameAs: (site.socials ?? [])
      .map((social) => social.url)
      .filter((url) => /^https?:\/\//i.test(url)),
  }
}

/** The site itself, tied to its author. */
export function websiteSchema(
  site: Site,
  locale: Locale
): Record<string, unknown> {
  const base = siteUrl().origin

  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: site.seo?.siteTitle || site.ownerName,
    url: `${base}/${locale}`,
    description: site.seo?.siteDescription ?? undefined,
    inLanguage: locale,
    author: { "@id": `${base}/#person` },
  }
}
