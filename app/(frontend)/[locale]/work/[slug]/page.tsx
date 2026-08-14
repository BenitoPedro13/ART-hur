import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ProjectHero } from "@/components/site/project-media"
import { Reveal } from "@/components/site/reveal"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Slate, slateRows } from "@/components/site/slate"
import { compact, StructuredData } from "@/components/site/structured-data"
import { formatPosition, getDictionary, isLocale } from "@/lib/i18n"
import {
  mediaAlt,
  mediaDimensions,
  mediaOgSize,
  mediaUrl,
  resolveMedia,
} from "@/lib/media"
import { getDesktopItems, getProjectBySlug, getSite } from "@/lib/payload"
import {
  frameNumber,
  projectCredits,
  projectFrameCount,
  projectNeighbours,
  selectedProjects,
} from "@/lib/projects"
import { RichText } from "@/lib/rich-text"
import type { Project } from "@/payload-types"
import { buildMetadata, personSchema, siteUrl } from "@/lib/seo"

/** Rendered per request for the same reason as the home; see that route. */
export const dynamic = "force-dynamic"

/**
 * The sequence rhythm.
 *
 * Arthur's projects arrive as photo sets of six to twelve frames, so the
 * gallery is the case study — not an appendix under an essay. A uniform grid
 * would flatten every set into the same contact sheet, so frames are placed on
 * a twelve-column field in a fixed, authored cadence: a full-width opener, then
 * halves, an offset, a large right-weighted frame. It repeats every six, which
 * is short enough to feel composed and long enough not to read as a pattern.
 *
 * Deterministic on purpose — the same project always looks the same.
 */
const GALLERY_RHYTHM = [
  { span: 12, start: 1, lift: false },
  { span: 6, start: 1, lift: false },
  { span: 5, start: 8, lift: true },
  { span: 8, start: 5, lift: false },
  { span: 5, start: 1, lift: true },
  { span: 6, start: 7, lift: false },
] as const

/**
 * A one-line description from real fields only.
 *
 * Most of Arthur's projects are photo sets with no written description, so
 * this assembles what exists — title, year, credits — instead of leaving the
 * meta description empty or inventing a blurb.
 */
function projectSummary(project: Project, ownerName: string): string {
  const credits = projectCredits(project)
    .map((credit) => `${credit.label}: ${credit.value}`)
    .join(" · ")

  const parts = [
    project.year ? `${project.title} (${project.year})` : project.title,
    credits || null,
    `${ownerName}.`,
  ].filter(Boolean)

  return parts.join(" — ")
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  let project: Awaited<ReturnType<typeof getProjectBySlug>>
  let site: Awaited<ReturnType<typeof getSite>>
  try {
    ;[project, site] = await Promise.all([
      getProjectBySlug(slug, locale),
      getSite(locale),
    ])
  } catch {
    return {}
  }

  if (!project) return {}

  return buildMetadata({
    locale,
    path: `work/${slug}`,
    site,
    type: "article",
    title: project.title,
    description: projectSummary(project, site.ownerName),
    // The project's own cover, so a shared link previews the actual work
    // rather than a generic site card.
    image: mediaUrl(project.cover, "hero"),
    imageAlt: mediaAlt(project.cover, project.title),
    ...mediaOgSize(project.cover),
  })
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)

  const [site, items, project] = await Promise.all([
    getSite(locale),
    getDesktopItems(locale),
    getProjectBySlug(slug, locale),
  ])

  if (!project) {
    notFound()
  }

  const projects = selectedProjects(items)
  const { index, total, next } = projectNeighbours(projects, slug)
  const credits = projectCredits(project)
  const frames = projectFrameCount(project)

  // A project reachable by URL but not curated into a folder has no position in
  // the sequence. It still reads fine; it just does not claim one.
  const position =
    index >= 0
      ? `${frameNumber(index)} / ${String(total).padStart(2, "0")}`
      : null

  const rows = slateRows([
    { term: dictionary.position, value: position },
    { term: dictionary.year, value: project.year },
    {
      term: dictionary.frames,
      value: frames > 0 ? String(frames).padStart(2, "0") : null,
    },
    ...credits.map((credit) => ({ term: credit.label, value: credit.value })),
  ])

  const nextCover = next ? mediaUrl(next.cover, "card") : null

  const base = siteUrl().origin
  const projectUrl = `${base}/${locale}/work/${slug}`

  /**
   * `VisualArtwork` rather than the vaguer `CreativeWork`: these are photo
   * sets, and the more specific type is what earns richer treatment in search.
   * Every gallery frame is listed so the images are attributed to this page.
   */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      compact({
        "@type": "VisualArtwork",
        "@id": `${projectUrl}#work`,
        name: project.title,
        url: projectUrl,
        inLanguage: locale,
        dateCreated: project.year || undefined,
        creator: compact(personSchema(site, locale)),
        image: [
          mediaUrl(project.cover, "hero"),
          ...(project.gallery ?? []).map((entry) =>
            mediaUrl(entry.image, "hero")
          ),
        ]
          .filter((url): url is string => Boolean(url))
          .map((url) => new URL(url, base).toString()),
        // Credits are free-form label/value pairs, so they cannot be mapped to
        // typed schema properties without guessing. They go in as text.
        creditText: credits
          .map((credit) => `${credit.label}: ${credit.value}`)
          .join(" · "),
      }),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: site.ownerName,
            item: `${base}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: dictionary.indexLabel,
            item: `${base}/${locale}/index`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: projectUrl,
          },
        ],
      },
    ],
  }

  return (
    <div className="shell-page" data-surface="room">
      <StructuredData data={schema} />
      <SiteHeader
        active="work"
        center={position ?? dictionary.workLabel}
        dictionary={dictionary}
        locale={locale}
        ownerName={site.ownerName}
      />

      <main className="shell-main work-page">
        <header className="shell-inner work-head">
          <h1 className="type-display-l work-title">{project.title}</h1>
          <Slate rows={rows} />
        </header>

        <div className="shell-inner work-hero">
          <ProjectHero project={project} title={project.title} />
        </div>

        {project.description ? (
          <section
            className="shell-inner work-context"
            aria-label={dictionary.context}
          >
            <p className="font-data shell-muted work-context-label">
              {dictionary.context}
            </p>
            <RichText
              value={project.description}
              className="type-body-l work-prose"
            />
          </section>
        ) : null}

        {frames > 0 ? (
          <section
            className="shell-inner work-sequence"
            aria-label={dictionary.sequence}
          >
            {(project.gallery ?? []).map((entry, order) => {
              const media = resolveMedia(entry.image)
              const url = mediaUrl(entry.image, "hero")
              if (!media || !url) return null

              const slot = GALLERY_RHYTHM[order % GALLERY_RHYTHM.length]
              const { width, height } = mediaDimensions(entry.image)

              return (
                <Reveal
                  as="figure"
                  key={entry.id ?? media.id}
                  className={`work-figure${slot.lift ? "work-figure-lift" : ""}`}
                >
                  <Image
                    src={url}
                    alt={mediaAlt(entry.image, project.title)}
                    width={width}
                    height={height}
                    sizes={`(max-width: 900px) 100vw, ${Math.round((slot.span / 12) * 90)}vw`}
                    loading="lazy"
                    className="work-figure-image"
                    style={{ gridColumn: `${slot.start} / span ${slot.span}` }}
                  />
                  <figcaption className="work-caption font-data">
                    {formatPosition(dictionary.frameOf, order + 1, frames)}
                  </figcaption>
                </Reveal>
              )
            })}
          </section>
        ) : null}

        <nav className="work-next" aria-label={dictionary.nextProject}>
          {next ? (
            <Link
              href={`/${locale}/work/${next.slug}`}
              className="work-next-link"
            >
              {nextCover ? (
                <Image
                  src={nextCover}
                  alt=""
                  fill
                  sizes="100vw"
                  className="work-next-cover"
                  aria-hidden="true"
                />
              ) : null}
              <span className="font-data work-next-label">
                {dictionary.nextProject}
              </span>
              <span className="type-display-l work-next-title">
                {next.title}
              </span>
            </Link>
          ) : null}

          <div className="shell-inner work-next-back">
            <Link
              href={`/${locale}/index`}
              className="shell-text-link font-data"
            >
              ← {dictionary.backToIndex}
            </Link>
          </div>
        </nav>
      </main>

      <SiteFooter dictionary={dictionary} locale={locale} site={site} />
    </div>
  )
}
