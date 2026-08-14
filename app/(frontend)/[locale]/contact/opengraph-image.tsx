import { ImageResponse } from 'next/og'

import { getDictionary, isLocale } from '@/lib/i18n'
import {
  OG,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgRule,
  ogFonts,
  ogFrameStyle,
  ogWalker,
} from '@/lib/og'
import { getSite } from '@/lib/payload'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Contact'

/**
 * The contact card.
 *
 * Contact previously previewed as the site's background poster, which told a
 * recipient nothing and looked identical to every other route. This states the
 * one thing the page is for and puts the address on the card, so the useful
 * detail survives even if nobody clicks through.
 *
 * The `芸` walker is this card's single mark — the home card spends its one on
 * the wordmark, so the two read as the same archive without repeating a motif.
 * It stands on the rule, as it does on the stage.
 */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safeLocale = isLocale(locale) ? locale : undefined
  const dictionary = getDictionary(safeLocale ?? '')

  let title = dictionary.contactLabel
  let address: string | null = null
  let availability: string | null = null

  if (safeLocale) {
    try {
      const site = await getSite(safeLocale)
      title = site.contact?.title ?? title
      availability = site.contact?.availability ?? null

      const mail = site.contact?.rows?.find((row) => row.href?.startsWith('mailto:'))
      address = mail ? mail.href.slice(7) : (site.contact?.rows?.[0]?.href ?? null)
    } catch {
      // Defaults above stand.
    }
  }

  const walker = await ogWalker()

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

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 116,
              letterSpacing: -6,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>

          {address ? (
            <div
              style={{
                display: 'flex',
                marginTop: 30,
                fontFamily: 'IBM Plex Mono',
                fontSize: 34,
                color: OG.OXIDE,
              }}
            >
              {address}
            </div>
          ) : null}

          {availability ? (
            <div
              style={{
                display: 'flex',
                maxWidth: 720,
                marginTop: 18,
                fontFamily: 'IBM Plex Mono',
                fontSize: 24,
                lineHeight: 1.4,
                color: OG.NEWSPRINT,
                opacity: 0.66,
              }}
            >
              {availability}
            </div>
          ) : null}
        </div>

        {/* The walker stands on the line rather than beside it, so the rule
            reads as ground the way it does on the stage. */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -6 }}>
          <img src={walker} width={96} height={96} alt="" />
        </div>

        <OgRule width={1072} />

        <div
          style={{
            display: 'flex',
            marginTop: 22,
            fontFamily: 'IBM Plex Mono',
            fontSize: 20,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: OG.CONCRETE,
          }}
        >
          ART&apos;hur
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() }
  )
}
