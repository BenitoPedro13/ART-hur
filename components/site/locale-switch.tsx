"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { locales, localeShortLabel, type Dictionary } from "@/lib/i18n"

/**
 * Swaps the locale segment and keeps the reader where they are.
 *
 * Slugs are not localized, so `/pt/work/casa-264` and `/en/work/casa-264` are
 * the same document — replacing the first segment is the whole job. The
 * desktop-era switcher also carried `?w`/`?p` window state, which no longer
 * means anything now that windows are routes.
 */
export function LocaleSwitch({
  current,
  dictionary,
}: {
  current: string
  dictionary: Dictionary
}) {
  const pathname = usePathname() ?? `/${current}`

  if (locales.length < 2) return null

  function hrefFor(locale: string) {
    const segments = pathname.split("/")
    // ['', locale, ...rest] — index 1 is always the locale, courtesy of proxy.ts.
    segments[1] = locale

    return segments.join("/") || `/${locale}`
  }

  return (
    <nav className="shell-locale font-data" aria-label={dictionary.language}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
        >
          {localeShortLabel(locale)}
        </Link>
      ))}
    </nav>
  )
}
