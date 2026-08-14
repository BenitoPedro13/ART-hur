import { cn } from "@/lib/utils"

export type SlateRow = {
  term: string
  value: string
}

/**
 * The dashed rule and the page's production metadata.
 *
 * The rule is the home's route line at rest — same 8/6 dash as
 * `.timeline-route-line`, horizontal and still, carried through the interior as
 * the site's connective stroke. Under it sits only real content: rows whose
 * value is missing are dropped by `slateRows` rather than filled with
 * "to be confirmed", which would be five columns of noise on a project that
 * simply has no credits yet.
 */
export function Slate({
  className,
  rows,
}: {
  className?: string
  rows: SlateRow[]
}) {
  return (
    <div className={cn("slate", className)}>
      <hr className="rule-dashed" />

      {rows.length > 0 ? (
        <dl className="slate-rows">
          {rows.map((row) => (
            <div key={row.term} className="slate-row">
              <dt className="slate-term font-data">{row.term}</dt>
              <dd className="slate-value">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}

/** Drops rows with no value, so absent data leaves no gap to explain. */
export function slateRows(
  rows: { term: string; value: string | null | undefined }[]
): SlateRow[] {
  return rows
    .filter((row): row is SlateRow => Boolean(row.value))
    .map((row) => ({ term: row.term, value: row.value }))
}
