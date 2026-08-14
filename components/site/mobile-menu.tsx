"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { LocaleSwitch } from "@/components/site/locale-switch"
import type { Dictionary } from "@/lib/i18n"
import type { ShellRoute } from "@/components/site/site-header"

/**
 * Navigation below 900px.
 *
 * Three inline links collided with the position readout at narrow widths, and
 * a hamburger would import an icon vocabulary the archive does not otherwise
 * use. This is a word — MENU / CLOSE — opening a full-height panel with the
 * routes set at reading scale.
 *
 * The panel is its own region, so the oversized link list is allowed to be the
 * one assertive thing in it.
 */
export function MobileMenu({
  active,
  dictionary,
  links,
  locale,
}: {
  active: ShellRoute
  dictionary: Dictionary
  links: { route: ShellRoute; href: string; label: string }[]
  locale: string
}) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    // Focus moves to the panel itself rather than to Close: focusing a control
    // paints a focus ring even when the menu was opened by touch. The dialog
    // is announced by its role and label, and Tab still lands on Close first.
    panelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div className="shell-mobile-nav">
      <button
        type="button"
        className="shell-menu-button font-data"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {dictionary.menu}
      </button>

      {/* Portalled to <body> on purpose. The header carries
          `mix-blend-mode: difference`, which blends its entire subtree against
          the page behind it — a child cannot opt out with `normal`. Rendered
          in place, the panel came out inverted and see-through over the
          project media. Escaping the header's stacking context is the fix. */}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className="shell-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label={dictionary.menu}
              tabIndex={-1}
            >
              <div className="shell-menu-head">
                <button
                  type="button"
                  className="shell-menu-button font-data"
                  onClick={() => setOpen(false)}
                >
                  {dictionary.close}
                </button>
              </div>

              <nav
                className="shell-menu-links"
                aria-label={dictionary.primaryNavigation}
              >
                <Link
                  href={`/${locale}`}
                  aria-current={active === "archive" ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {dictionary.navArchive}
                </Link>
                {links.map((link) => (
                  <Link
                    key={link.route}
                    href={link.href}
                    aria-current={active === link.route ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="shell-menu-foot">
                <hr className="rule-dashed" />
                <LocaleSwitch current={locale} dictionary={dictionary} />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
