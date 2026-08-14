/**
 * JSON-LD for the archive.
 *
 * A portfolio's search presence is mostly the knowledge panel: who this person
 * is, what they do, where else they are. Schema.org is the only way to state
 * that outright rather than hoping a crawler infers it from body copy.
 *
 * Everything here is drawn from Payload. Nothing is asserted that an editor has
 * not actually filled in — an empty field is omitted from the graph rather than
 * emitted blank, because structured data that overstates is worse than none.
 */
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from CMS strings; JSON.stringify escapes quotes,
      // and `<` is escaped so a stray "</script>" in copy cannot break out.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

/** Drops null, undefined, and empty-array properties from a graph node. */
export function compact<T extends Record<string, unknown>>(node: T): T {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => {
      if (value === null || value === undefined || value === "") return false
      if (Array.isArray(value) && value.length === 0) return false

      return true
    })
  ) as T
}
