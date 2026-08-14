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
 * visible control before anything non-essential plays. So nothing is audible
 * until the visitor says so at the opening gate or flips the toggle, and the
 * choice persists.
 *
 * Browsers also refuse programmatic playback before a real gesture, so the
 * ambient bed waits for the first pointer or key event rather than trying at
 * mount and failing.
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
  const mutedRef = useRef(true)
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const ambientStarted = useRef(false)
  const ambientAvailable = useRef(true)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMutedState(stored === "true")
  }, [])

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

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

    function tryStart() {
      if (ambientStarted.current || !ambientAvailable.current) return
      ambientStarted.current = true
      // Reads the ref, not the closed-over prop: this listener is created once
      // and must see the mute state as it is when the gesture actually lands.
      if (!mutedRef.current) audio.play().catch(() => {})
    }

    window.addEventListener("pointerdown", tryStart, { once: true })
    window.addEventListener("keydown", tryStart, { once: true })

    return () => {
      audio.pause()
      window.removeEventListener("pointerdown", tryStart)
      window.removeEventListener("keydown", tryStart)
    }
  }, [])

  useEffect(() => {
    const audio = ambientRef.current
    if (!audio || !ambientStarted.current) return

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

  const toggleMuted = useCallback(() => setMuted(!mutedRef.current), [setMuted])

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
