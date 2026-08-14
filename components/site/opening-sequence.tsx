"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useReducedMotion } from "motion/react"

import { LivingTag } from "@/components/brand/living-tag"
import { useSound } from "@/components/site/sound-provider"
import type { Dictionary } from "@/lib/i18n"

/** How long the plate's CSS cascade takes to settle before the gate arrives. */
const SEQUENCE_MS = 1500
/** The handover: the plate dissolves onto the stage waiting behind it. */
const EXIT_MS = 760
/** Reduced motion gets a short fade instead of choreography. */
const REDUCED_EXIT_MS = 220
/**
 * Hard cap on the wait. `document.fonts.ready` not resolving must never be
 * able to leave an opaque plate covering the whole site.
 */
const MAX_WAIT_MS = 2000
/** Safety net for the gate. Not an expected path — nobody gets trapped here. */
const GATE_TIMEOUT_MS = 20000

const WHEEL_THRESHOLD = 12
const TOUCH_THRESHOLD = 24
const ENTER_KEYS = new Set([
  "ArrowDown",
  "PageDown",
  " ",
  "Spacebar",
  "End",
  "Enter",
])

type Phase = "opening" | "gating" | "exiting" | "hidden"

/**
 * Module scope, deliberately — not `sessionStorage`.
 *
 * The spec asks that the opening not replay on every route transition, which
 * is not the same as showing it once per session. A refresh should give it to
 * you again; navigating home from `/index` should not. A module variable draws
 * exactly that line for free: it survives client-side navigation and resets on
 * a real page load. Persisting to storage would suppress it on refresh too,
 * which is the wrong half of the rule.
 */
let shownThisPageLoad = false

/**
 * Per-element entry and exit offsets as custom properties rather than
 * `animation-delay`, because the exit rules reuse the same elements and an
 * inline delay would attach to whichever animation the cascade picked.
 */
function cue(inMs: number, outMs = 0): CSSProperties {
  return {
    "--open-in": `${inMs}ms`,
    "--open-out": `${outMs}ms`,
  } as CSSProperties
}

/**
 * The archive's opening plate.
 *
 * Shows on every page load of the home and never on a client-side return to
 * it — see `shownThisPageLoad` above for why that is the line rather than
 * once per session.
 *
 * Composition is the site's own, not a loading spinner: the Living Tag as the
 * one mark, a mono slate of real archive metadata, and the dashed route at
 * rest — the same three devices every interior page is built from. It ends on
 * a gate that offers sound, because the spec forbids playing any before asking.
 *
 * **The animation is CSS-only and its direction is deliberate.** Every element's
 * base style is its final, visible state; the keyframes only supply an earlier
 * hidden state to fill backwards from. If the animations never run — reduced
 * motion, a stalled main thread, a browser that drops them — the plate is
 * already complete and correct rather than blank. A full-screen overlay that
 * can render empty is worse than one that does not animate, so that failure is
 * made structurally impossible instead of merely unlikely. No timer drives the
 * reveal; timers only advance phases, and teardown never waits on
 * `animationend`, which a dropped animation would never fire.
 */
export function OpeningSequence({
  dictionary,
  meta,
}: {
  dictionary: Dictionary
  /** Real archive facts, already resolved on the server. */
  meta: { label: string; value: string }[]
}) {
  const reduceMotion = useReducedMotion()
  const { muted, setMuted } = useSound()
  /**
   * Read during render, not in an effect, so a client-side return to the home
   * never paints the plate for a frame before unmounting it.
   *
   * Safe against hydration: `shownThisPageLoad` is only ever written by
   * `exit()`, which runs on the client. On the server it is always `false`, so
   * a real page load renders the same thing on both sides; a client navigation
   * does no hydration at all, and is the only case where this reads `true`.
   */
  const [phase, setPhase] = useState<Phase>(
    shownThisPageLoad ? "hidden" : "opening"
  )
  const [choice, setChoice] = useState<"unset" | "sound" | "muted">("unset")
  const phaseRef = useRef<Phase>(shownThisPageLoad ? "hidden" : "opening")

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  function exit() {
    if (phaseRef.current === "exiting" || phaseRef.current === "hidden") return

    setPhase("exiting")
    shownThisPageLoad = true
    window.setTimeout(
      () => setPhase("hidden"),
      reduceMotion ? REDUCED_EXIT_MS : EXIT_MS
    )
  }

  // Phase 1: opening → gating, or straight out under reduced motion.
  useEffect(() => {
    if (shownThisPageLoad) return

    if (reduceMotion) {
      exit()
      return
    }

    let cancelled = false

    function advance() {
      if (cancelled || phaseRef.current !== "opening") return
      setPhase("gating")
    }

    const fonts = document.fonts ? document.fonts.ready : Promise.resolve()

    Promise.race([
      fonts,
      new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT_MS)),
    ]).then(() => {
      if (cancelled) return
      window.setTimeout(advance, SEQUENCE_MS)
    })

    // Impatience skips the wait, but lands on the gate rather than past it.
    window.addEventListener("pointerdown", advance, { once: true })
    window.addEventListener("keydown", advance, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener("pointerdown", advance)
      window.removeEventListener("keydown", advance)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion])

  // Phase 2: gating → exiting.
  useEffect(() => {
    if (phase !== "gating") return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) > WHEEL_THRESHOLD) exit()
    }

    let touchStartY: number | null = null
    function onTouchStart(event: TouchEvent) {
      touchStartY = event.touches[0]?.clientY ?? null
    }
    function onTouchMove(event: TouchEvent) {
      if (touchStartY === null) return
      const y = event.touches[0]?.clientY
      if (y === undefined) return
      if (Math.abs(touchStartY - y) > TOUCH_THRESHOLD) exit()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (ENTER_KEYS.has(event.key)) exit()
    }

    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("keydown", onKeyDown)

    const fallback = window.setTimeout(exit, GATE_TIMEOUT_MS)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKeyDown)
      window.clearTimeout(fallback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === "hidden") return null

  const rows = [
    ...meta,
    { label: dictionary.soundLabel, value: muted ? "—" : "ON" },
  ]
  const rowsStart = 260

  return (
    <div
      data-opening=""
      className={`opening${phase === "exiting" ? " opening-exiting" : ""}`}
      style={{ opacity: phase === "exiting" ? 0 : 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={dictionary.navArchive}
    >
      <div className="opening-plate">
        <div className="opening-mark" style={cue(60, 120)}>
          <LivingTag className="type-display-xl" />
        </div>

        <dl className="opening-slate">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className="opening-row font-data"
              style={cue(rowsStart + index * 90, index * 30)}
            >
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <div
          className="opening-rule"
          style={cue(rowsStart + rows.length * 90, 0)}
          aria-hidden="true"
        >
          <hr className="rule-dashed" />
        </div>

        {phase === "gating" ? (
          <div className="opening-gate">
            <div className="opening-gate-sound">
              <p className="font-data">{dictionary.soundPrompt}</p>
              <div className="opening-gate-choices">
                <button
                  type="button"
                  className="opening-button font-data"
                  data-active={choice === "sound" ? "true" : "false"}
                  onClick={() => {
                    setMuted(false)
                    setChoice("sound")
                  }}
                >
                  {choice === "sound"
                    ? dictionary.soundOn
                    : dictionary.soundEnable}
                </button>
                <button
                  type="button"
                  className="opening-button opening-button-quiet font-data"
                  data-active={choice === "muted" ? "true" : "false"}
                  onClick={() => {
                    setMuted(true)
                    setChoice("muted")
                  }}
                >
                  {dictionary.soundContinueMuted}
                </button>
              </div>
            </div>

            <div className="opening-gate-enter">
              <span className="font-data">{dictionary.enterHint}</span>
              {/* The gesture is the intended way in, but a wheel-only gate
                  would exclude anyone who cannot perform it, so the button is
                  a real control rather than decoration. */}
              <button
                type="button"
                className="opening-enter font-data"
                onClick={exit}
              >
                {dictionary.enter}
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="opening-skip font-data"
            onClick={exit}
          >
            {dictionary.skip}
          </button>
        )}
      </div>
    </div>
  )
}
