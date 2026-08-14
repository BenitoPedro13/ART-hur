import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/seo"

/**
 * Lives at the app root, not beside `sitemap.ts` in `(frontend)`.
 *
 * Next registers `sitemap.ts` from inside a route group but not `robots.ts` —
 * placed in `(frontend)` it silently produced no `/robots.txt` at all, and the
 * request fell through to `[locale]` and 404'd. Verified against the build
 * manifest; do not move it back.
 */

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().origin

  /**
   * Preview deployments must stay out of the index, or they compete with
   * production for the same content. Only the production environment opens up.
   */
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === undefined

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The CMS and the API are not content; keeping them out of the crawl
      // budget also keeps admin URLs out of search results.
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
