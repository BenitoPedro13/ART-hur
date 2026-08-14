import { ImageResponse } from 'next/og'

import { getDictionary, isLocale } from '@/lib/i18n'
import { OG, OG_CONTENT_TYPE, OG_SIZE, OgRule, ogFonts, ogFrameStyle } from '@/lib/og'
import { siteUrl } from '@/lib/seo'
import { getDesktopItems, getSite } from '@/lib/payload'
import { selectedProjects, yearSpan } from '@/lib/projects'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = "ART'hur"

/**
 * The archive's share card.
 *
 * The home previously previewed as the background poster — an image that says
 * nothing about whose archive it is. A shared link is an identity moment, so
 * this states the name, the line, and the size of the body of work.
 *
 * The wordmark is the Living Tag and therefore the card's single assertive
 * element; the walker stays off this one so the region keeps one mark.
 */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safeLocale = isLocale(locale) ? locale : undefined
  const dictionary = getDictionary(safeLocale ?? '')

  // The card must render even if the database is unreachable — a broken OG
  // image is worse than one built from defaults.
  let tagline: string | null = null
  let count = 0
  let span: string | null = null

  if (safeLocale) {
    try {
      const [site, items] = await Promise.all([getSite(safeLocale), getDesktopItems(safeLocale)])
      const projects = selectedProjects(items)
      tagline = site.tagline ?? site.seo?.siteDescription ?? null
      count = projects.length
      span = yearSpan(projects)
    } catch {
      // Defaults above stand.
    }
  }

  const host = siteUrl().host

  const meta = [
    count > 0 ? `${String(count).padStart(2, '0')} ${dictionary.projects}` : null,
    span,
  ]
    .filter(Boolean)
    .join('   ·   ')

  return new ImageResponse(
    (
      <div style={ogFrameStyle()}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'IBM Plex Mono',
            fontSize: 20,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: OG.CONCRETE,
          }}
        >
          {dictionary.navArchive}
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* The apostrophe is the Living Tag's authored stroke, so it is the
                drawn path rather than a typographic quote. */}
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', fontSize: 168, letterSpacing: -10, lineHeight: 1 }}>
                ART
              </div>
              <svg
                width="37"
                height="131"
                viewBox="0 0 38 92"
                style={{ margin: '14px 3px 0' }}
              >
                <path
                  d="M25 5C12 24 35 38 17 56C9 64 12 76 30 87"
                  fill="none"
                  stroke={OG.NEWSPRINT}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="10"
                />
                <path
                  d="M9 19C17 16 24 16 31 20"
                  fill="none"
                  stroke={OG.OXIDE}
                  strokeLinecap="round"
                  strokeWidth="6"
                  opacity="0.75"
                />
              </svg>
              <div style={{ display: 'flex', fontSize: 168, letterSpacing: -10, lineHeight: 1 }}>
                hur
              </div>
            </div>

            {tagline ? (
              <div
                style={{
                  display: 'flex',
                  maxWidth: 760,
                  marginTop: 28,
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 26,
                  lineHeight: 1.4,
                  color: OG.NEWSPRINT,
                  opacity: 0.72,
                }}
              >
                {tagline}
              </div>
            ) : null}
          </div>
        </div>

        <OgRule width={1072} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 22,
            fontFamily: 'IBM Plex Mono',
            fontSize: 20,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: OG.CONCRETE,
          }}
        >
          <div style={{ display: 'flex' }}>{meta}</div>
          <div style={{ display: 'flex' }}>{host}</div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() }
  )
}
