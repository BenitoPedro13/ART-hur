import Link from "next/link"

import { LivingTag } from "@/components/brand/living-tag"
import { MobileMenu } from "@/components/site/mobile-menu"
import type { Dictionary } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type ShellRoute = "archive" | "index" | "about" | "contact" | "work"

/**
 * The one header every route shares.
 *
 * `mix-blend-mode: difference` (see `.shell-header`) is doing real work here:
 * the same markup reads correctly over the black room, the Newsprint sheet, and
 * whatever project media happens to be behind it, with no per-route styling and
 * no colour-sampling. It is also why the brand mark stays a single sula — one
 * quiet wordmark in the global shell, exactly as the spec allows.
 *
 * `center` is the archive position readout and nothing else — the home passes
 * its live `NN / NN`, a case study passes its fixed one. Routes with no
 * position in the sequence leave it empty rather than echoing the nav label
 * that is already marked `aria-current` two columns to the right.
 */
export function SiteHeader({
  active,
  center,
  dictionary,
  locale,
  ownerName,
}: {
  active: ShellRoute
  center?: React.ReactNode
  dictionary: Dictionary
  locale: string
  ownerName: string
}) {
  const links: { route: ShellRoute; href: string; label: string }[] = [
    { route: "index", href: `/${locale}/index`, label: dictionary.navIndex },
    { route: "about", href: `/${locale}/about`, label: dictionary.navAbout },
    {
      route: "contact",
      href: `/${locale}/contact`,
      label: dictionary.navContact,
    },
  ]

  return (
    <header className="shell-header">
      <Link
        href={`/${locale}`}
        className="shell-brand"
        aria-label={`${ownerName}, ${dictionary.navArchive.toLowerCase()}`}
      >
        <LivingTag compact />
      </Link>

      <div className={cn("shell-header-slate font-data")}>{center}</div>

      <nav
        className="shell-header-nav font-data"
        aria-label={dictionary.primaryNavigation}
      >
        {links.map((link) => (
          <Link
            key={link.route}
            href={link.href}
            aria-current={active === link.route ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <MobileMenu
        active={active}
        dictionary={dictionary}
        links={links}
        locale={locale}
      />
    </header>
  )
}
