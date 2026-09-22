/** sessionStorage key: opening dismissed this browser tab (localhost dev only). */
export const OPENING_SEEN_STORAGE_KEY = 'arthur:opening-seen'

/** Set on `<html>` before first paint when the opening was already dismissed. */
export const OPENING_SEEN_ATTR = 'data-opening-seen'

export function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  )
}

/**
 * Runs synchronously in `<head>`, before paint.
 *
 * Production keeps the per-page-load opening. On localhost only, a prior
 * dismiss in this tab skips the plate on reload so dev refreshes are not gated
 * again.
 */
export const openingBlockingScript = `
try {
  var h = location.hostname;
  if (${JSON.stringify(['localhost', '127.0.0.1', '[::1]'])}.indexOf(h) !== -1) {
    if (sessionStorage.getItem(${JSON.stringify(OPENING_SEEN_STORAGE_KEY)}) === '1') {
      document.documentElement.setAttribute(${JSON.stringify(OPENING_SEEN_ATTR)}, '');
    }
  }
} catch (e) {}
`.trim()

export function persistOpeningSeenForLocalDev(): void {
  if (typeof window === 'undefined') return
  if (!isLocalDevHost(window.location.hostname)) return

  try {
    sessionStorage.setItem(OPENING_SEEN_STORAGE_KEY, '1')
    document.documentElement.setAttribute(OPENING_SEEN_ATTR, '')
  } catch {
    // Private mode or blocked storage — ignore.
  }
}
