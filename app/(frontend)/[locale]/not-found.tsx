import Image from "next/image"
import Link from "next/link"

import { defaultLocale, getDictionary } from "@/lib/i18n"

/**
 * `not-found.tsx` receives no route params, so it renders in the default
 * locale — by the time we are here the locale segment was invalid anyway.
 *
 * Built from the archive's own devices rather than a generic error card: the
 * room, the oversized code, the dashed route, and the `芸` walker standing off
 * the end of the line. A 404 is the one place the walker being off its route
 * says something true, which is why it is the page's single mark.
 */
export default function NotFound() {
  const dictionary = getDictionary(defaultLocale)

  const routes = [
    { href: `/${defaultLocale}`, label: dictionary.navArchive },
    { href: `/${defaultLocale}/index`, label: dictionary.navIndex },
    { href: `/${defaultLocale}/about`, label: dictionary.navAbout },
    { href: `/${defaultLocale}/contact`, label: dictionary.navContact },
  ]

  return (
    <div className="shell-page" data-surface="room">
      <main className="shell-main not-found">
        <div className="shell-inner">
          <p className="font-data shell-muted">{dictionary.notFoundCode}</p>

          <h1 className="type-display-l not-found-title">
            {dictionary.notFoundTitle}
          </h1>

          <p className="type-body-l not-found-body">
            {dictionary.notFoundBody}
          </p>

          <div className="not-found-rule" aria-hidden="true">
            <hr className="rule-dashed" />
            <Image
              src="/brand/gei-walk/frame-01.png"
              alt=""
              width={82}
              height={82}
              className="not-found-walker"
            />
          </div>

          <nav
            className="not-found-routes font-data"
            aria-label={dictionary.primaryNavigation}
          >
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </div>
  )
}
