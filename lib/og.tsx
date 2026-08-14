import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Open Graph's canonical size; every platform crops inward from this. */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const VINYL = '#0b0b0a'
const NEWSPRINT = '#e9e2d2'
const CONCRETE = '#9d9a92'
const OXIDE = '#d83823'

export const OG = { VINYL, NEWSPRINT, CONCRETE, OXIDE }

/**
 * Static cuts, not the variable font Google Fonts serves by default.
 * Satori renders a variable font at its default instance, which would set the
 * wordmark at Regular — the one weight it must never be.
 */
export async function ogFonts() {
  const dir = join(process.cwd(), 'assets/fonts')

  const [display, mono] = await Promise.all([
    readFile(join(dir, 'Archivo-Bold.ttf')),
    readFile(join(dir, 'IBMPlexMono-Regular.ttf')),
  ])

  return [
    { name: 'Archivo', data: display, weight: 700 as const, style: 'normal' as const },
    { name: 'IBM Plex Mono', data: mono, weight: 400 as const, style: 'normal' as const },
  ]
}

/**
 * The route line, at rest, as the card's structural device.
 *
 * Drawn as discrete segments rather than a `repeating-linear-gradient`, which
 * Satori does not support. The 8/6 ratio matches `.rule-dashed` and the SVG
 * route the walker crosses on the home page, so a shared link carries the same
 * stroke as the site it points at.
 */
export function OgRule({ width = 1200 }: { width?: number }) {
  const dash = 16
  const gap = 12
  const count = Math.ceil(width / (dash + gap))

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            width: dash,
            height: 3,
            marginRight: gap,
            background: NEWSPRINT,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  )
}

/** The 芸 walker, standing. Read from the same frames the stage animates. */
export async function ogWalker(): Promise<string> {
  const file = await readFile(join(process.cwd(), 'public/brand/gei-walk/frame-01.png'))

  return `data:image/png;base64,${file.toString('base64')}`
}

/** Shared frame: the room, its inset border, and a mono eyebrow. */
export function ogFrameStyle() {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    height: '100%',
    padding: '56px 64px',
    background: VINYL,
    color: NEWSPRINT,
    fontFamily: 'Archivo',
  }
}
