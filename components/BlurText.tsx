"use client"

import { motion, type Transition, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"

type BlurTextProps = {
  animateBy?: "words" | "letters"
  animationFrom?: Record<string, string | number>
  animationTo?: Array<Record<string, string | number>>
  className?: string
  delay?: number
  direction?: "top" | "bottom"
  easing?: (t: number) => number
  onAnimationComplete?: () => void
  rootMargin?: string
  stepDuration?: number
  text?: string
  threshold?: number
}

function buildKeyframes(
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((step) => Object.keys(step)),
  ])
  const keyframes: Record<string, Array<string | number>> = {}

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])]
  })

  return keyframes
}

/**
 * React Bits BlurText, re-tokened for ART'hur.
 * Source: https://reactbits.dev/text-animations/blur-text
 */
export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (progress: number) => progress,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("")
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || shouldReduceMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, shouldReduceMotion, threshold])

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(8px)", opacity: 0, y: -18 }
        : { filter: "blur(8px)", opacity: 0, y: 18 },
    [direction]
  )

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(3px)",
        opacity: 0.55,
        y: direction === "top" ? 3 : -3,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  )

  const visible = shouldReduceMotion || inView
  const fromSnapshot = animationFrom ?? defaultFrom
  const toSnapshots = animationTo ?? defaultTo
  const finalSnapshot = toSnapshots.at(-1) ?? { opacity: 1, y: 0 }
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots)
  const stepCount = toSnapshots.length + 1
  const totalDuration = stepDuration * (stepCount - 1)
  const times = Array.from({ length: stepCount }, (_, index) =>
    stepCount === 1 ? 0 : index / (stepCount - 1)
  )

  return (
    <span ref={ref} className={className}>
      {elements.map((segment, index) => {
        const spanTransition: Transition = {
          duration: shouldReduceMotion ? 0 : totalDuration,
          times,
          delay: shouldReduceMotion ? 0 : (index * delay) / 1000,
          ease: easing,
        }

        return (
          <motion.span
            key={`${segment}-${index}`}
            initial={shouldReduceMotion ? false : fromSnapshot}
            animate={
              shouldReduceMotion
                ? finalSnapshot
                : visible
                  ? animateKeyframes
                  : fromSnapshot
            }
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: "inline-block",
              willChange: shouldReduceMotion
                ? "auto"
                : "transform, filter, opacity",
            }}
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < elements.length - 1
              ? "\u00A0"
              : null}
          </motion.span>
        )
      })}
    </span>
  )
}
