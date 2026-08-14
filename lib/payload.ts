import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Config, DesktopItem, Project, Site } from '@/payload-types'
import { toPayloadLocale, type Locale } from './locales'

type PayloadLocale = Config['locale']

export async function getPayloadClient() {
  return getPayload({ config: await config })
}

export async function getSite(locale: Locale): Promise<Site> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'site',
    locale: toPayloadLocale<PayloadLocale>(locale),
    depth: 2,
  })
}

export async function getDesktopItems(locale: Locale): Promise<DesktopItem[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'desktop-items',
    where: { visible: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 3,
    locale: toPayloadLocale<PayloadLocale>(locale),
  })

  return docs
}

/**
 * One project by its URL slug.
 *
 * Slugs are unique and deliberately not localized (see collections/fields/slug),
 * so `/pt/work/x` and `/en/work/x` resolve to the same document with localized
 * text. Returns null for an unknown slug; the route turns that into a 404.
 */
export async function getProjectBySlug(
  slug: string,
  locale: Locale
): Promise<Project | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    locale: toPayloadLocale<PayloadLocale>(locale),
  })

  return docs[0] ?? null
}
