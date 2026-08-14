"use client"

import { useSound } from "@/components/site/sound-provider"
import type { Dictionary } from "@/lib/i18n"

/**
 * The visible sound control the spec requires before any non-essential audio.
 *
 * Drawn as a level meter rather than a speaker icon: three bars that stand up
 * when sound is on and lie flat when it is off. It reads as production
 * metering, which is the archive's own vocabulary, and it carries a text label
 * so the state never depends on the glyph alone.
 */
export function SoundToggle({ dictionary }: { dictionary: Dictionary }) {
  const { muted, toggleMuted } = useSound()

  return (
    <button
      type="button"
      className="sound-toggle font-data"
      aria-pressed={!muted}
      aria-label={muted ? dictionary.soundUnmute : dictionary.soundMute}
      onClick={toggleMuted}
    >
      <span
        className="sound-meter"
        aria-hidden="true"
        data-on={muted ? "false" : "true"}
      >
        <span />
        <span />
        <span />
      </span>
      {dictionary.soundLabel}
    </button>
  )
}
