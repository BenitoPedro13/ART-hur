import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContactForm } from "@/components/site/contact-form"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Slate, slateRows } from "@/components/site/slate"
import { compact, StructuredData } from "@/components/site/structured-data"
import { getDictionary, isLocale } from "@/lib/i18n"
import { mediaOgSize, mediaUrl } from "@/lib/media"
import { getSite } from "@/lib/payload"
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
    return { title: dictionary.contactLabel }
  }

  return buildMetadata({
    locale,
    path: "contact",
    site,
    title: site.contact?.title ?? dictionary.contactLabel,
    description:
      site.contact?.intro ??
      site.contact?.availability ??
      site.seo?.siteDescription,
    image: mediaUrl(site.seo?.ogImage, "hero"),
    imageAlt: site.ownerName,
    ...mediaOgSize(site.seo?.ogImage),
  })
}

/** Strips the scheme so a row reads `arthur@…` rather than `mailto:arthur@…`. */
function destination(href: string): string {
  if (href.startsWith("mailto:")) return href.slice(7)
  if (href.startsWith("tel:")) return href.slice(4)

  try {
    const url = new URL(href)

    return `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}`
  } catch {
    return href
  }
}

/**
 * Contact. No spectacle.
 *
 * The spec's region table gives this page a sula maximum of none, and forbids
 * assertive elements inside task-bound UI, so there is no mark, no oversized
 * type, no motion beyond a rule sliding in under the pointer. Every route is a
 * plain server-rendered anchor: the details resolve with JavaScript off, which
 * the accessibility section requires. The form is the convenience, not the path.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const site = await getSite(locale)

  const rows = site.contact?.rows ?? []
  const socials = site.socials ?? []
  const form = site.form

  const slate = slateRows([
    { term: dictionary.availability, value: site.contact?.availability },
  ])

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${siteUrl().origin}/${locale}/contact`,
    inLanguage: locale,
    mainEntity: compact(personSchema(site, locale)),
  }

  return (
    <div className="shell-page" data-surface="room">
      <StructuredData data={schema} />
      <SiteHeader
        active="contact"
        dictionary={dictionary}
        locale={locale}
        ownerName={site.ownerName}
      />

      <main className="shell-main contact-page">
        <div className="shell-inner">
          <h1 className="type-heading-m contact-heading">
            {site.contact?.title ?? dictionary.contactLabel}
          </h1>

          {site.contact?.intro ? (
            <p className="type-body-l contact-intro">{site.contact.intro}</p>
          ) : null}

          <Slate rows={slate} className="contact-slate" />

          {rows.length > 0 ? (
            <ul className="contact-rows">
              {rows.map((row) => (
                <li key={row.id ?? row.href}>
                  <a className="contact-row" href={row.href}>
                    <span className="contact-row-label">{row.label}</span>
                    {row.subtitle ? (
                      <span className="contact-row-subtitle font-data">
                        {row.subtitle}
                      </span>
                    ) : null}
                    <span className="contact-row-destination font-data">
                      {destination(row.href)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {socials.length > 0 ? (
            <section
              className="contact-socials"
              aria-label={dictionary.elsewhere}
            >
              <p className="font-data shell-muted">{dictionary.elsewhere}</p>
              <ul className="contact-socials-list font-data">
                {socials.map((social) => (
                  <li key={social.id ?? social.url}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {form?.enabled ? (
            <section
              className="contact-form-section"
              aria-label={form.heading ?? undefined}
            >
              <hr className="rule-dashed" />
              {form.heading ? (
                <h2 className="type-heading-m contact-form-heading">
                  {form.heading}
                </h2>
              ) : null}
              {form.intro ? (
                <p className="contact-form-intro">{form.intro}</p>
              ) : null}
              <ContactForm dictionary={dictionary} form={form} />
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter dictionary={dictionary} locale={locale} site={site} />
    </div>
  )
}
