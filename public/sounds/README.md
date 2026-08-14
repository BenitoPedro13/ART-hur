# Sound

Four files, all optional. Every one of them fails silently if missing — the
provider catches the error and the site simply stays quiet — so you can delete
or replace any of them without touching code.

| File | Role | Volume |
| --- | --- | --- |
| `ambient.mp3` | Room tone. Loops while sound is on. | 0.16 |
| `hover.ogg` | Pointer over a control. | 0.30 |
| `click.ogg` | Control activated. | 0.30 |
| `toggle.ogg` | Reserved for the sound switch itself. | 0.30 |

Nothing plays until the visitor asks for it, either at the opening gate or via
the sound control in the footer. The choice persists per browser. The ambient
bed additionally waits for the first real gesture, because browsers refuse
programmatic playback before one, and it stays off entirely under
`prefers-reduced-motion`.

## `ambient.mp3` is a placeholder

The current file is a CC0 interface/ambient track. It is legally fine to ship,
but it is **not** the intended music: it is a neutral bed standing in until
Arthur's own choice lands.

Replace it by dropping a new `ambient.mp3` in this folder. No code change, no
rebuild step beyond the usual one.

## Licensing

`docs/BRAND-AND-EXPERIENCE-SPEC.md` §10 is explicit: **use original or properly
licensed audio only.** A portfolio is a public, commercial-adjacent surface, so
a track lifted from a mix or a video is a real takedown risk, not a theoretical
one.

Given the work in this archive is largely music-adjacent, an original track from
someone Arthur already works with is the best answer here and the one the spec
actually asks for. Failing that, licensed sources worth using:

- **Pixabay Music** — royalty-free, no attribution required
- **Free Music Archive** — filter by CC licence; CC-BY needs a credit
- **Uppbeat** / **Epidemic Sound** — subscription, cleared for commercial use

If the replacement needs attribution, record it here and surface the credit in
the footer or `/about`.
