import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { LivingTag } from "@/components/brand/living-tag"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Slate, slateRows } from "@/components/site/slate"
import { compact, StructuredData } from "@/components/site/structured-data"
import { getDictionary, isLocale } from "@/lib/i18n"
import { mediaAlt, mediaDimensions, mediaOgSize, mediaUrl } from "@/lib/media"
import { getDesktopItems, getSite } from "@/lib/payload"
import { RichText, type RichTextValue } from "@/lib/rich-text"
import { buildMetadata, personSchema, siteUrl } from "@/lib/seo"

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
  try {
    site = await getSite(locale)
  } catch {
    return { title: dictionary.aboutLabel }
  }

  const portrait = site.about?.portrait ?? site.avatar

  return buildMetadata({
    locale,
    path: "about",
    site,
    // `profile` rather than `website`: this page is about a person.
    type: "profile",
    title: dictionary.aboutLabel,
    description:
      site.about?.standfirst ?? site.tagline ?? site.seo?.siteDescription,
    image: mediaUrl(portrait, "hero") ?? mediaUrl(site.seo?.ogImage, "hero"),
    imageAlt: site.ownerName,
    ...mediaOgSize(portrait ?? site.seo?.ogImage),
  })
}

/**
 * The practice statement.
 *
 * This is the one page where the Living Tag earns full size. It is the site's
 * sula and the spec caps it at one per region, so it appears here at display
 * scale and nowhere else on the page — no oversized heading competing with it,
 * no second mark in the body.
 *
 * Sits on the Newsprint sheet: this is reading, not projection.
 */
export default async function AboutPage({
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

  const about = site.about ?? {}

  /**
   * Before the About tab existed, the biography lived in a text desktop item.
   * Falling back to it means an unmigrated or unedited database still renders a
   * real page instead of a blank column.
   */
  const legacyBio = items.find(
    (item) => item.type === "text" && item.body
  )?.body
  const bio = (about.bio ?? legacyBio) as RichTextValue

  const portrait = about.portrait ?? site.avatar
  const portraitUrl = mediaUrl(portrait, "card")
  const { width, height } = mediaDimensions(portrait)

  const disciplines = (about.disciplines ?? [])
    .map((discipline) => discipline.label)
    .filter(Boolean)

  const rows = slateRows([
    { term: dictionary.practice, value: disciplines.join(", ") || null },
    { term: dictionary.basedIn, value: about.basedIn },
    { term: dictionary.availability, value: about.availability },
  ])

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${siteUrl().origin}/${locale}/about`,
    inLanguage: locale,
    mainEntity: compact(personSchema(site, locale)),
  }

  return (
    <div className="shell-page" data-surface="sheet">
      <StructuredData data={schema} />
      <SiteHeader
        active="about"
        dictionary={dictionary}
        locale={locale}
        ownerName={site.ownerName}
      />

      <main className="shell-main about-page">
        <div className="shell-inner">
          <h1 className="about-mark">
            <LivingTag className="type-display-xl" />
          </h1>

          {(about.standfirst ?? site.tagline) ? (
            <p className="type-body-l about-standfirst">
              {about.standfirst ?? site.tagline}
            </p>
          ) : null}

          <Slate rows={rows} className="about-slate" />

          <div className="about-body">
            {portraitUrl ? (
              <figure className="about-portrait">
                <Image
                  src={portraitUrl}
                  alt={mediaAlt(portrait, site.ownerName)}
                  width={width}
                  height={height}
                  sizes="(max-width: 900px) 60vw, 30vw"
                  className="about-portrait-image"
                />
              </figure>
            ) : null}

            <div className="about-prose">
              {about.heading ? (
                <h2 className="type-heading-m about-heading">
                  {about.heading}
                </h2>
              ) : null}

              <RichText value={bio} className="type-body-l" />

              <p className="about-cta">
                <Link
                  href={`/${locale}/contact`}
                  className="shell-text-link font-data"
                >
                  {dictionary.navContact} →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter dictionary={dictionary} locale={locale} site={site} />
    </div>
  )
}
