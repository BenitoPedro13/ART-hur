import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archivo, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google'

import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SoundProvider } from '@/components/site/sound-provider'
import { WalkingFavicon } from '@/components/site/walking-favicon'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isLocale, locales } from '@/lib/i18n'
import { getSite } from '@/lib/payload'
import { siteUrl } from '@/lib/seo'

/**
 * Three type roles, each with a job:
 *  - Instrument Sans carries readable UI and body copy with a warmer editorial tone.
 *  - Archivo carries compressed poster-scale titles and the ART'hur mark.
 *  - IBM Plex Mono carries credits, years, frame indices, and production metadata.
 */
const fontDisplay = Archivo({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const fontSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) return {}

  // Metadata must never take the whole page down — if the database is briefly
  // unreachable the desktop should still render with a bare title.
  let site: Awaited<ReturnType<typeof getSite>>
  try {
    site = await getSite(locale)
  } catch {
    return {}
  }

  const siteName = site.seo?.siteTitle || site.ownerName

  return {
    metadataBase: siteUrl(),
    /**
     * Pages set a bare title and inherit the suffix, so every tab and search
     * result carries the archive's name without each route repeating it.
     * `absolute` on the home keeps it from reading "ART'hur — ART'hur".
     */
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    description: site.seo?.siteDescription || undefined,
    applicationName: siteName,
    authors: [{ name: site.ownerName }],
    creator: site.ownerName,
    publisher: site.ownerName,
    // The archive is the work; let search engines show the imagery in full.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    formatDetection: { telephone: false },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        'antialiased',
        'font-sans',
        // The dark surface must sit on <html>, not just <body>: the browser
        // paints html's background in the canvas margins, and a body-only
        // background leaves a white frame around the viewport edges.
        'bg-void',
        fontSans.variable,
        fontDisplay.variable,
        fontMono.variable
      )}
    >
      <body className="bg-void">
        <ThemeProvider>
          <SoundProvider>
            <WalkingFavicon />
            <TooltipProvider>{children}</TooltipProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
