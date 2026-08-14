import Image from "next/image"

import { mediaAlt, mediaDimensions, mediaUrl } from "@/lib/media"
import { parseVideoUrl } from "@/lib/video"
import type { Project } from "@/payload-types"

/**
 * A project's hero.
 *
 * Video never autoplays and always carries controls, a poster, and an
 * accessible name — a case study is for reading, and the spec's motion note is
 * explicit that it should be calmer than the home. When there is no video, or
 * the URL is unrecognisable, the cover is the hero; the cover is a required
 * field, so there is always something to show.
 */
export function ProjectHero({
  project,
  title,
}: {
  project: Project
  title: string
}) {
  const poster = mediaUrl(project.cover, "hero")
  const video = parseVideoUrl(project.videoUrl)
  const { width, height } = mediaDimensions(project.cover)

  if (video?.provider === "file") {
    return (
      <video
        className="work-figure-image"
        controls
        preload="none"
        playsInline
        poster={poster ?? undefined}
        aria-label={title}
      >
        <source src={video.src} />
      </video>
    )
  }

  if (video) {
    return (
      <iframe
        className="work-figure-image"
        src={video.src}
        title={title}
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (!poster) return null

  return (
    <Image
      className="work-figure-image"
      src={poster}
      alt={mediaAlt(project.cover, title)}
      width={width}
      height={height}
      sizes="(max-width: 900px) 100vw, 90vw"
      priority
    />
  )
}
