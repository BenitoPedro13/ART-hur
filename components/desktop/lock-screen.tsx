'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { LivingTag } from '@/components/brand/living-tag'
import type { Site } from '@/payload-types'
import { intlLocale } from '@/lib/i18n'
import { INTRO_DISMISSED_KEY } from '@/lib/intro'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Background } from './background'
import { useNow } from './use-now'

/** True when this session already dismissed the lock screen. */
function alreadyDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_DISMISSED_KEY) === '1'
  } catch {
    // Private browsing or blocked storage: fail open and show the screen.
    return false
  }
}

export function LockScreen({
  site,
  locale,
  hasOpenWindow,
}: {
  site: Site
  locale: string
  hasOpenWindow: boolean
}) {
  /**
   * Starts visible so the lock screen is in the very first painted frame —
   * deciding this in an effect made the desktop flash before it appeared.
   * The value is deterministic on server and client; the sessionStorage part
   * is handled pre-paint by CSS keyed off the attribute set in <head>.
   */
  const showsAtAll = site.lockScreen?.enabled !== false && !hasOpenWindow
  const [visible, setVisible] = useState(showsAtAll)
  const [leaving, setLeaving] = useState(false)
  const now = useNow()

  useEffect(() => {
    // The blocking script already hid this visually; unmount it so it cannot
    // trap focus or swallow clicks. Deferred a frame so the state change does
    // not cascade out of the effect body.
    const frame = window.requestAnimationFrame(() => {
      if (showsAtAll && site.lockScreen?.showOncePerSession !== false && alreadyDismissed()) {
        setVisible(false)
      }
    })

    return () => window.cancelAnimationFrame(frame)
    // Decided once on mount: opening a window later must not re-lock the site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tag = intlLocale(locale)

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' }),
    [tag]
  )
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(tag, { weekday: 'long', month: 'long', day: 'numeric' }),
    [tag]
  )

  function dismiss() {
    setLeaving(true)
    try {
      window.sessionStorage.setItem(INTRO_DISMISSED_KEY, '1')
    } catch {
      // Ignore: dismissing still works, it just will not be remembered.
    }
    window.setTimeout(() => setVisible(false), 500)
  }

  if (!visible) return null

  const avatarSrc = mediaUrl(site.avatar, 'thumbnail')
  const startLabel = site.lockScreen?.startLabel

  return (
    <div
      data-lock-screen=""
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none',
        'transition-opacity duration-500',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <Background
        videoUrl={site.backgroundVideoUrl}
        posterUrl={mediaUrl(site.backgroundPoster, 'hero')}
        playback={site.backgroundVideoPlayback}
        blurred
      />

      <div className="relative z-10 flex w-full max-w-6xl flex-col px-6 text-left sm:px-10">
        <div className="mb-8 flex items-start justify-between gap-6 font-data text-[0.68rem] text-foreground/60">
          <span>{now ? dateFormatter.format(now) : ' '}</span>
          <span>{now ? timeFormatter.format(now) : ' '}</span>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 font-data text-[0.72rem] text-accent">marked frequencies / living archive</p>
            <LivingTag className="max-w-full text-primary drop-shadow-[0_0_34px_color-mix(in_srgb,var(--primary)_24%,transparent)]" />
            <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed text-foreground/76 sm:text-2xl">
              {site.tagline || 'Selected work, unfinished thoughts, and things worth replaying.'}
            </p>
          </div>

          {avatarSrc ? (
            <div className="w-36 border border-glass-edge bg-glass p-2 backdrop-blur-md md:w-44">
              <Image
                src={avatarSrc}
                alt={mediaAlt(site.avatar, site.ownerName)}
                width={320}
                height={320}
                priority
                className="aspect-square w-full object-cover saturate-[0.9]"
              />
              <p className="mt-2 font-data text-[0.62rem] text-foreground/58">portrait / {site.ownerName}</p>
            </div>
          ) : null}
        </div>

        {startLabel ? (
          <button
            type="button"
            onClick={dismiss}
            className="mt-10 inline-flex w-fit cursor-pointer items-center gap-3 border border-primary bg-primary px-6 py-3 font-data text-[0.72rem] text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.98]"
          >
            {startLabel}
            <span aria-hidden="true">↗</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
