import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archivo, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google'

import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isLocale, locales } from '@/lib/i18n'
import { getSite } from '@/lib/payload'
import { introBlockingScript } from '@/lib/intro'
import { mediaUrl } from '@/lib/media'

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

  const title = site.seo?.siteTitle || site.ownerName
  const description = site.seo?.siteDescription || undefined
  const ogImage = mediaUrl(site.seo?.ogImage)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
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
      <head>
        {/* Must run before first paint; see lib/intro.ts. */}
        <script dangerouslySetInnerHTML={{ __html: introBlockingScript }} />
      </head>
      <body className="bg-void">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
