"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import type { Dictionary } from "@/lib/i18n"
import { mediaAlt, mediaUrl } from "@/lib/media"
import { frameNumber, projectFrameCount } from "@/lib/projects"
import type { Project } from "@/payload-types"

type Row = {
  slug: string
  title: string
  year: string | null
  frames: number
  cover: string | null
  alt: string
}

/**
 * The archive as a contact sheet.
 *
 * Hovering or focusing a row loads its cover into one fixed frame in the left
 * column — a loupe over the sheet, not a cursor-following card. The frame never
 * moves, so scanning the list reads as flipping through negatives rather than
 * dragging a tooltip around.
 *
 * The loupe is a pointer affordance and is hidden entirely without a fine
 * pointer (see `.index-loupe`), where each row shows its own thumbnail instead.
 * Nothing here is information-only-on-hover: title, year, and frame count are
 * always in the row.
 */
export function IndexList({
  aside,
  dictionary,
  locale,
  projects,
}: {
  /** Heading and slate. Rendered on the server, placed in the sticky column. */
  aside: React.ReactNode
  dictionary: Dictionary
  locale: string
  projects: Project[]
}) {
  const rows: Row[] = projects.map((project) => ({
    slug: project.slug ?? String(project.id),
    title: project.title,
    year: project.year ?? null,
    frames: projectFrameCount(project),
    cover: mediaUrl(project.cover, "card"),
    alt: mediaAlt(project.cover, project.title),
  }))

  const [activeSlug, setActiveSlug] = useState<string | null>(
    rows[0]?.slug ?? null
  )
  const active = rows.find((row) => row.slug === activeSlug) ?? rows[0] ?? null

  function frameLabel(frames: number) {
    const template =
      frames === 1 ? dictionary.frameCountOne : dictionary.frameCountMany

    return template.replace("{n}", String(frames))
  }

  return (
    <div className="index-layout">
      <div className="index-aside">
        {aside}

        {active?.cover ? (
          <figure className="index-loupe" aria-hidden="true">
            <Image
              key={active.cover}
              src={active.cover}
              alt=""
              fill
              sizes="22rem"
              className="index-loupe-image"
            />
            <figcaption className="index-loupe-caption font-data">
              {active.title}
              {active.year ? ` · ${active.year}` : ""}
            </figcaption>
          </figure>
        ) : null}
      </div>

      <ol className="index-list" aria-label={dictionary.projects}>
        {rows.map((row, index) => (
          <li key={row.slug}>
            <Link
              href={`/${locale}/work/${row.slug}`}
              className="index-row"
              onPointerEnter={(event) => {
                if (
                  event.pointerType === "mouse" ||
                  event.pointerType === "pen"
                ) {
                  setActiveSlug(row.slug)
                }
              }}
              onFocus={() => setActiveSlug(row.slug)}
            >
              <span className="index-row-number font-data">
                {frameNumber(index)}
              </span>

              {row.cover ? (
                <span className="index-row-thumb">
                  <Image
                    src={row.cover}
                    alt=""
                    fill
                    sizes="72px"
                    className="index-row-thumb-image"
                  />
                </span>
              ) : null}

              <span className="index-row-title">{row.title}</span>
              <span className="index-row-frames font-data">
                {frameLabel(row.frames)}
              </span>
              <span className="index-row-year font-data">
                {row.year ?? "—"}
              </span>
              <span className="index-row-go font-data" aria-hidden="true">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
