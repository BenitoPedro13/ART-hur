"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

const HOVER_SRC = "/sounds/hover.ogg"
const CLICK_SRC = "/sounds/click.ogg"
const AMBIENT_SRC = "/sounds/ambient.mp3"

/** Per-browser, not per-session: a sound preference should outlive the tab. */
const STORAGE_KEY = "arthur:sound-muted"

/** Room tone sits under the work; blips sit under the pointer. Both quiet. */
const AMBIENT_VOLUME = 0.16
const CLIP_VOLUME = 0.3

type SoundContextValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  toggleMuted: () => void
  playHover: () => void
  playClick: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

function playClip(src: string, muted: boolean) {
  if (muted) return

  const audio = new Audio(src)
  audio.volume = CLIP_VOLUME
  // A blocked or missing clip must never surface as an unhandled rejection.
  audio.play().catch(() => {})
}

/**
 * Sound for the archive: off until asked for.
 *
 * The spec is explicit that audio is optional, muted by default, and needs a
 * visible control before anything non-essential plays — and section 13 is
 * explicit that it must never autoplay. So the ambient bed only ever starts
 * as the direct result of clicking a sound control (the opening gate's
 * "Entrar com som" button, or the persistent toggle): never from an
 * unrelated gesture — a swipe past the gate, a tap to skip the intro —
 * carrying over a stale preference from a previous visit. The preference
 * still persists per browser, but persistence only changes what the toggle
 * shows on arrival; playback is re-earned by an explicit click every visit.
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  /**
   * Always `true` for the server and the client's first render. Reading
   * localStorage in a `useState` initialiser would make the first client
   * render depend on data the server never had, which is a hydration
   * mismatch on every control bound to this value; the stored preference is
   * applied in a mount effect instead.
   */
  const [muted, setMutedState] = useState(true)
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const ambientAvailable = useRef(true)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMutedState(stored === "true")
  }, [])

  useEffect(() => {
    // Reduced motion asks for less audiovisual intensity, so the room tone
    // stays off entirely; deliberate UI blips remain available.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const audio = new Audio(AMBIENT_SRC)
    audio.loop = true
    audio.volume = AMBIENT_VOLUME
    audio.preload = "none"
    // Replacing the file is a content decision; a missing one is not an error.
    audio.onerror = () => {
      ambientAvailable.current = false
    }
    ambientRef.current = audio

    return () => {
      audio.pause()
    }
  }, [])

  useEffect(() => {
    const audio = ambientRef.current
    if (!audio || !ambientAvailable.current) return

    /**
     * This effect also runs once on mount, driven by the localStorage restore
     * above rather than a click — a returning visitor's stored preference must
     * never be enough to start audio by itself. Without a real gesture in this
     * render pass, `play()` is rejected by the browser's autoplay policy and
     * the rejection is swallowed here, which is exactly the outcome the gate
     * requires: nothing audible until *this* visit's gate button or the
     * persistent toggle is clicked, each of which is a genuine gesture that
     * re-runs this same effect and succeeds.
     */
    if (muted) audio.pause()
    else audio.play().catch(() => {})
  }, [muted])

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // Private browsing can refuse writes; the session still honours it.
    }
  }, [])

  const toggleMuted = useCallback(() => setMuted(!muted), [muted, setMuted])

  const playHover = useCallback(() => playClip(HOVER_SRC, muted), [muted])
  const playClick = useCallback(() => playClip(CLICK_SRC, muted), [muted])

  return (
    <SoundContext.Provider
      value={{ muted, setMuted, toggleMuted, playHover, playClick }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) throw new Error("useSound must be used within SoundProvider")

  return context
}
