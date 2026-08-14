import { LocaleSwitch } from "@/components/site/locale-switch"
import { SoundToggle } from "@/components/site/sound-toggle"
import type { Dictionary } from "@/lib/i18n"
import type { Site } from "@/payload-types"

/**
 * The interior colophon.
 *
 * Opens on the same dashed rule that carries every slate, then production data
 * and nothing else: how to reach Arthur, where else he is, and which language
 * you are reading. No sula, no marketing line, no repeat of the wordmark — the
 * header already spent that.
 *
 * The home does not use this: it ends on its own index band.
 */
export function SiteFooter({
  dictionary,
  locale,
  site,
}: {
  dictionary: Dictionary
  locale: string
  site: Site
}) {
  const rows = site.contact?.rows ?? []
  const year = new Date().getFullYear()

  return (
    <footer className="shell-footer">
      <div className="shell-inner">
        <hr className="rule-dashed shell-footer-rule" />
        <div className="shell-footer-grid">
          
          <p className="shell-footer-note font-data">
            © {year} {site.ownerName}
          </p>

          <ul className="shell-footer-links font-data">
            {rows.map((row) => (
              <li key={row.id ?? row.href}>
                <a href={row.href}>{row.label}</a>
              </li>
            ))}
          </ul>

          <SoundToggle dictionary={dictionary} />

          <LocaleSwitch current={locale} dictionary={dictionary} />



          <div className="shell-footer-note font-data">
            powered by{" "}
            <a
              href="https://blessed-moon.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Blessed Moon Studio
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
