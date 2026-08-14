'use client'

import { useBoomerangVideo } from '@/hooks/use-boomerang-video'
import { cn } from '@/lib/utils'

/**
 * Shared atmosphere for the archive shell and lock screen.
 *
 * Media remains the room, not the focus. If the CMS has no wallpaper yet, the
 * fallback renders a restrained paper-grain and registration-grid field from the
 * ART'hur semantic tokens.
 */
export function Background({
  videoUrl,
  posterUrl,
  className,
  blurred = false,
  playback,
}: {
  videoUrl?: string | null
  posterUrl?: string | null
  className?: string
  blurred?: boolean
  /** 'boomerang' reverses back to the start instead of cutting to it. */
  playback?: 'normal' | 'boomerang' | null
}) {
  const isBoomerang = playback === 'boomerang'
  const videoRef = useBoomerangVideo(isBoomerang)

  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-void', className)}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl ?? undefined}
          autoPlay
          loop={!isBoomerang}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full object-cover opacity-80 saturate-[0.92]"
        />
      ) : posterUrl ? (
        <div
          aria-hidden="true"
          className="h-full w-full bg-cover bg-center opacity-80 saturate-[0.9]"
          style={{ backgroundImage: `url(${JSON.stringify(posterUrl)})` }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 34%), radial-gradient(circle at 78% 74%, color-mix(in srgb, var(--ring) 12%, transparent), transparent 30%), linear-gradient(135deg, var(--background), var(--card) 48%, var(--background))',
          }}
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-screen opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--foreground) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 35%, transparent) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--foreground) 70%, transparent) 1px, transparent 0)',
          backgroundSize: '5px 5px',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,color-mix(in_srgb,var(--background)_82%,transparent))]" />

      {blurred ? <div className="absolute inset-0 bg-background/42 backdrop-blur-[14px]" /> : null}
    </div>
  )
}
