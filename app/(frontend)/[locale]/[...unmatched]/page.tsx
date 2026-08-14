import { notFound } from "next/navigation"

/**
 * Everything under a valid locale that matches no real route.
 *
 * Without this, an unmatched URL matches no segment at all and Next falls back
 * to its own built-in 404 page — outside this group, so outside the fonts,
 * the providers, and the archive's styling. Catching it here means
 * `[locale]/not-found.tsx` renders where it belongs.
 *
 * `proxy.ts` has already redirected unprefixed paths to `/{locale}/…`, so this
 * covers those too.
 */
export default function UnmatchedRoute(): never {
  notFound()
}
