"use client"

import { useEffect, useRef, useState } from "react"

/**
 * The single motion device on a case study: one clip-path wipe as each frame
 * enters. Everything else on the interior routes is hover and focus only.
 *
 * The hidden state is applied by the client, never by the server. A no-JS
 * reader, a crawler, and the pre-hydration paint all get the image outright;
 * only a hydrated browser that has not asked for reduced motion ever sees it
 * clipped. That ordering is why this is a state flag rather than a CSS class
 * on the server render.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
}: {
  as?: "div" | "figure"
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [state, setState] = useState<"idle" | "pending" | "in">("idle")

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Already on screen at mount — wiping it in would animate something the
    // reader is looking at, so leave it alone.
    if (node.getBoundingClientRect().top < window.innerHeight) return

    setState("pending")

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          setState("in")
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={className}
      data-reveal={state === "idle" ? undefined : state}
    >
      {children}
    </Tag>
  )
}
