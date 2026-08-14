"use client"

import { useEffect } from "react"

import { ARTHUR_WALK_FRAME_COUNT } from "@/components/archive/arthur-walker"

/**
 * Deliberately far slower than the stage's ~11fps gait. Chrome coalesces rapid
 * favicon updates, so a fast cadence drops frames and reads as a flicker. At
 * this speed every step paints — verified by sampling the icon Chrome actually
 * selects, which advances on every sample.
 */
const FRAME_MS = 300
const TILE = 64

/**
 * Walks the `芸` glyph in the browser tab.
 *
 * Animated favicons are a support minefield: Chrome and Safari render animated
 * GIF and animated SVG as a single still frame, and only Firefox plays either.
 * Swapping the icon link's `href` is the one technique every engine honours.
 *
 * Two details make the difference between this working and melting down:
 *
 * 1. **`data:` URLs, not file paths.** Pointing `href` at a file made Chrome
 *    issue a network request per frame — and, because mutating the head
 *    re-evaluates every icon link, it re-fetched `icon.svg` alongside each one.
 *    At 8fps that is a permanent request storm and the icon never settles long
 *    enough to paint. Frames are fetched once, drawn to a canvas, and cached as
 *    data URLs; after startup the animation touches the network zero times.
 *
 * 2. **A fresh element per frame, and no SVG icon anywhere.** Chrome re-reads
 *    the icon when the link element is *replaced*, not when its `href` is
 *    mutated — mutating alone left the tab frozen. It also prefers a scalable
 *    icon over a raster one no matter the document order, so while `icon.svg`
 *    existed Chrome rendered that (statically) and ignored these frames
 *    entirely. The site therefore ships PNG icons only.
 *
 * It holds still while the tab is hidden, and never starts under reduced
 * motion — where `app/icon.png` stays in place as the static neutral glyph, as
 * it also does for anyone without JavaScript.
 */
export function WalkingFavicon() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let cancelled = false
    let timer: number | undefined
    let link: HTMLLinkElement | undefined

    async function run() {
      const canvas = document.createElement("canvas")
      canvas.width = TILE
      canvas.height = TILE
      const context = canvas.getContext("2d")
      if (!context) return

      const sources = Array.from(
        { length: ARTHUR_WALK_FRAME_COUNT },
        (_, index) =>
          `/brand/favicon/frame-${String(index + 1).padStart(2, "0")}.png`
      )

      const dataUrls = await Promise.all(
        sources.map(
          (src) =>
            new Promise<string | null>((resolve) => {
              const image = new Image()
              image.onload = () => {
                context.clearRect(0, 0, TILE, TILE)
                context.drawImage(image, 0, 0, TILE, TILE)
                resolve(canvas.toDataURL("image/png"))
              }
              image.onerror = () => resolve(null)
              image.src = src
            })
        )
      )

      const frames = dataUrls.filter((url): url is string => Boolean(url))
      // A partial sequence would limp rather than walk; leave the static icon.
      if (cancelled || frames.length < ARTHUR_WALK_FRAME_COUNT) return

      const paint = (src: string) => {
        const next = document.createElement("link")
        next.rel = "icon"
        next.type = "image/png"
        next.dataset.walker = "true"
        next.href = src
        // Replace rather than mutate: Chrome ignores an href change on a link
        // it has already read, but always re-reads a newly inserted one.
        link?.remove()
        document.head.appendChild(next)
        link = next
      }

      paint(frames[0])

      let frame = 0

      const start = () => {
        if (timer !== undefined) return
        timer = window.setInterval(() => {
          frame = (frame + 1) % frames.length
          paint(frames[frame])
        }, FRAME_MS)
      }

      const stop = () => {
        if (timer === undefined) return
        window.clearInterval(timer)
        timer = undefined
      }

      const onVisibilityChange = () => (document.hidden ? stop() : start())

      if (!document.hidden) start()
      document.addEventListener("visibilitychange", onVisibilityChange)

      cleanupVisibility = () =>
        document.removeEventListener("visibilitychange", onVisibilityChange)
    }

    let cleanupVisibility: (() => void) | undefined

    void run()

    return () => {
      cancelled = true
      if (timer !== undefined) window.clearInterval(timer)
      cleanupVisibility?.()
      link?.remove()
    }
  }, [])

  return null
}
