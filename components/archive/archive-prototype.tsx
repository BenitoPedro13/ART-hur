"use client"

import { gsap } from "gsap"
import { useReducedMotion } from "motion/react"
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"

import BlurText from "@/components/BlurText"
import MorphSlider, {
  type MorphItem,
  type MorphSliderHandle,
} from "@/components/MorphSlider"
import RippleDistortion from "@/components/RippleDistortion"
import {
  ARTHUR_WALK_FRAME_COUNT,
  ArthurWalker,
} from "@/components/archive/arthur-walker"
import { LivingTag } from "@/components/brand/living-tag"
import { mediaUrl, resolveMedia } from "@/lib/media"
import type { Project } from "@/payload-types"

type ArchivePrototypeProps = {
  contactHref: string | null
  locale: string
  ownerName: string
  projects: Project[]
  tagline: string | null
}

type MorphDescriptor = {
  backgroundBlur: number
  mediaHeight: number
  mediaRotate: number
  mediaWidth: number
  titleScale: number
  titleX: number
  titleY: number
}

// The route is one shallow, continuous line pinned to the viewport centre.
//
//   y(u) = 300 - tilt * (1.12u - 0.12u^3) + bow * u^2
//
// with u = -1 at the left exit, 0 directly under the walker, and 1 at the right
// exit. The odd term tilts the line, the even term bows it, and both vanish at
// u = 0 so the middle anchor never leaves the centre of the screen. Because the
// whole expression is a cubic in u and x is linear in u, the curve is one exact
// cubic Bezier: no joined shoulder, so no kink under the glyph.
const ROUTE_CENTER_X = 500
const ROUTE_CENTER_Y = 300
const ROUTE_HALF_SPAN = 590
const ROUTE_LEFT_X = ROUTE_CENTER_X - ROUTE_HALF_SPAN
const ROUTE_RIGHT_X = ROUTE_CENTER_X + ROUTE_HALF_SPAN

// Resting tilt and bow per project. MILEZ rocks between opposite tilts across a
// handful of projects rather than nudging in one direction, so consecutive
// entries change sign.
const ROUTE_TILTS = [46, -32, 54, -40, 24]
const ROUTE_BOWS = [12, -8, 16, -10, 7]

// Ambient drift. MILEZ takes roughly half a minute to travel between its
// extremes, so one slow shared phase seesaws the whole line instead of moving
// each end on its own clock.
const ROUTE_AMBIENT_PERIOD = 23000
const ROUTE_AMBIENT_TILT = 14
const ROUTE_AMBIENT_BOW = 8
const ROUTE_DASH_TRAVEL = 22

const TRANSITION_DURATION = 1600
const ROUTE_SETTLE_DURATION = 2100
const ENTRANCE_DURATION = 2650
const ENTRANCE_START_X = ROUTE_RIGHT_X
const WALK_STRIDE = 380

function routeY(u: number, tilt: number, bow: number) {
  return ROUTE_CENTER_Y - tilt * (1.12 * u - 0.12 * u * u * u) + bow * u * u
}

function routeGradient(u: number, tilt: number, bow: number) {
  return (-tilt * (1.12 - 0.36 * u * u) + 2 * bow * u) / ROUTE_HALF_SPAN
}

function buildRoutePath(tilt: number, bow: number) {
  const startY = routeY(-1, tilt, bow)
  const endY = routeY(1, tilt, bow)
  // y(u) = 300 + linear*u + quadratic*u^2 + cubic*u^3, reparameterised to the
  // Bezier's own [0, 1] so the handles are the endpoint derivatives over three.
  const linear = -1.12 * tilt
  const quadratic = bow
  const cubic = 0.12 * tilt
  const startSlope = 2 * linear - 4 * quadratic + 6 * cubic
  const endSlope = 2 * linear + 4 * quadratic + 6 * cubic
  const third = (ROUTE_RIGHT_X - ROUTE_LEFT_X) / 3

  return [
    `M ${ROUTE_LEFT_X} ${startY.toFixed(3)}`,
    `C ${ROUTE_LEFT_X + third} ${(startY + startSlope / 3).toFixed(3)}`,
    `${ROUTE_LEFT_X + third * 2} ${(endY - endSlope / 3).toFixed(3)}`,
    `${ROUTE_RIGHT_X} ${endY.toFixed(3)}`,
  ].join(" ")
}

const MORPH_PRESETS: MorphDescriptor[] = [
  {
    backgroundBlur: 10,
    mediaHeight: 53,
    mediaRotate: -0.8,
    mediaWidth: 48,
    titleScale: 1,
    titleX: -118,
    titleY: -154,
  },
  {
    backgroundBlur: 14,
    mediaHeight: 47,
    mediaRotate: 0.65,
    mediaWidth: 42,
    titleScale: 0.86,
    titleX: 126,
    titleY: -132,
  },
  {
    backgroundBlur: 8,
    mediaHeight: 58,
    mediaRotate: -0.25,
    mediaWidth: 39,
    titleScale: 0.92,
    titleX: -104,
    titleY: -170,
  },
  {
    backgroundBlur: 16,
    mediaHeight: 45,
    mediaRotate: 0.9,
    mediaWidth: 52,
    titleScale: 1.05,
    titleX: 102,
    titleY: -142,
  },
  {
    backgroundBlur: 11,
    mediaHeight: 51,
    mediaRotate: -0.55,
    mediaWidth: 45,
    titleScale: 0.9,
    titleX: -92,
    titleY: -150,
  },
]

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000'%3E%3Crect width='1600' height='1000' fill='%230b0b0a'/%3E%3Cpath d='M0 1000L1600 0' stroke='%23302d28' stroke-width='2'/%3E%3C/svg%3E"

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = clamp((value - edge0) / (edge1 - edge0))
  return progress * progress * (3 - 2 * progress)
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0")
}

function formatCount(count: number) {
  return String(count).padStart(2, "0")
}

function projectRole(project: Project | undefined) {
  return project?.meta?.[0]?.value ?? null
}

export function ArchivePrototype({
  contactHref,
  locale,
  ownerName,
  projects,
  tagline,
}: ArchivePrototypeProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMediaHovered, setIsMediaHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const routeRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const pathShadowRef = useRef<SVGPathElement>(null)
  const glyphRef = useRef<HTMLDivElement>(null)
  const walkerRef = useRef<HTMLDivElement>(null)
  const mediaFrameRef = useRef<HTMLDivElement>(null)
  const backgroundMorphRef = useRef<MorphSliderHandle>(null)
  const mediaMorphRef = useRef<MorphSliderHandle>(null)
  const projectLayerRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const directionRef = useRef(1)
  const prefersReducedMotion = useReducedMotion() ?? false
  const isPortuguese = locale === "pt"

  const morphItems = useMemo<MorphItem[]>(
    () =>
      projects.map((project) => {
        const media = resolveMedia(project.cover)
        return {
          image: mediaUrl(project.cover, "hero") ?? FALLBACK_IMAGE,
          focalX: media?.focalX ?? 50,
          focalY: media?.focalY ?? 50,
        }
      }),
    [projects]
  )

  useEffect(() => {
    const section = sectionRef.current
    const route = routeRef.current
    const path = pathRef.current
    const pathShadow = pathShadowRef.current
    const glyph = glyphRef.current
    const walker = walkerRef.current
    const mediaFrame = mediaFrameRef.current
    if (
      !section ||
      !route ||
      !path ||
      !pathShadow ||
      !glyph ||
      !walker ||
      !mediaFrame ||
      projects.length === 0
    )
      return

    const timelineSection: HTMLElement = section
    const timelineRoute: SVGSVGElement = route
    const timelinePath: SVGPathElement = path
    const timelinePathShadow: SVGPathElement = pathShadow
    const timelineGlyph: HTMLDivElement = glyph
    const timelineWalker: HTMLDivElement = walker
    const walkerFrames = Array.from(
      timelineWalker.querySelectorAll<HTMLImageElement>("[data-walk-frame]")
    )
    const fixedMediaFrame: HTMLDivElement = mediaFrame
    let scrollFrame = 0
    let animationFrame = 0
    let ambientElapsed = 0
    let lastFrameTime = 0
    let touchStartY: number | null = null
    let wheelDelta = 0
    let visibleWalkerFrame = 0
    let dashDrift = 0
    let walkDistance = 0
    let previousGlyphX = ENTRANCE_START_X
    let routeTilt = ROUTE_TILTS[0]
    let routeBow = ROUTE_BOWS[0]
    let routeOrigin = { scale: 1, x: 0, y: 0 }
    let transition: {
      appliedProgress: number
      direction: number
      fromIndex: number
      startedAt: number
      toIndex: number
    } | null = null
    let routeShift: {
      fromBow: number
      fromTilt: number
      startedAt: number
      toBow: number
      toTilt: number
    } | null = null
    let entrance: { revealedAt: number } | null = prefersReducedMotion
      ? null
      : { revealedAt: 0 }
    const morphEase = gsap.parseEase("power2.inOut")
    const settleEase = gsap.parseEase("power2.inOut")
    const entranceEase = gsap.parseEase("power2.out")

    function tiltAt(index: number) {
      return ROUTE_TILTS[index % ROUTE_TILTS.length]
    }

    function bowAt(index: number) {
      return ROUTE_BOWS[index % ROUTE_BOWS.length]
    }

    // The route SVG and the glyph share the stage as their positioning
    // container but not their box, and the small-screen rules move the route
    // off the stage centre. Measuring both keeps the walker on the line instead
    // of assuming the two are concentric.
    function measureRoute() {
      const stage = timelineRoute.parentElement
      if (!stage) return

      const stageBounds = stage.getBoundingClientRect()
      const routeBounds = timelineRoute.getBoundingClientRect()
      if (routeBounds.width === 0 || routeBounds.height === 0) return

      routeOrigin = {
        scale: Math.min(routeBounds.width / 1000, routeBounds.height / 600),
        x:
          routeBounds.left +
          routeBounds.width / 2 -
          (stageBounds.left + stageBounds.width / 2),
        y:
          routeBounds.top +
          routeBounds.height / 2 -
          (stageBounds.top + stageBounds.height / 2),
      }
    }

    function applyProjectVisuals(
      fromIndex: number,
      toIndex: number,
      progress: number,
      direction: number
    ) {
      const easedProgress = clamp(progress)
      backgroundMorphRef.current?.setTransition(
        fromIndex,
        toIndex,
        easedProgress,
        direction
      )
      mediaMorphRef.current?.setTransition(
        fromIndex,
        toIndex,
        easedProgress,
        direction
      )

      const fromDescriptor = MORPH_PRESETS[fromIndex % MORPH_PRESETS.length]
      const toDescriptor = MORPH_PRESETS[toIndex % MORPH_PRESETS.length]
      fixedMediaFrame.style.setProperty(
        "--media-width",
        `${interpolate(fromDescriptor.mediaWidth, toDescriptor.mediaWidth, easedProgress).toFixed(3)}vw`
      )
      fixedMediaFrame.style.setProperty(
        "--media-height",
        `${interpolate(fromDescriptor.mediaHeight, toDescriptor.mediaHeight, easedProgress).toFixed(3)}vh`
      )
      fixedMediaFrame.style.setProperty(
        "--media-rotate",
        `${interpolate(fromDescriptor.mediaRotate, toDescriptor.mediaRotate, easedProgress).toFixed(3)}deg`
      )

      const bridge = prefersReducedMotion
        ? 0
        : Math.pow(Math.sin(easedProgress * Math.PI), 1.2)

      projectLayerRefs.current.forEach((layer, index) => {
        if (!layer) return
        let opacity = 0
        let phase = 0

        if (fromIndex === toIndex && index === fromIndex) {
          opacity = 1
        } else if (index === fromIndex) {
          opacity = 1 - smoothstep(0.08, 0.78, easedProgress)
          phase = easedProgress
        } else if (index === toIndex) {
          opacity = smoothstep(0.22, 0.92, easedProgress)
          phase = easedProgress - 1
        }

        const descriptor = MORPH_PRESETS[index % MORPH_PRESETS.length]
        const dimmedOpacity = opacity * (1 - bridge * 0.72)
        const blur = Math.abs(phase) * 11 + bridge * 5
        const translateY = phase * -18
        const scale = descriptor.titleScale * (1 - Math.abs(phase) * 0.045)

        layer.style.opacity = dimmedOpacity.toFixed(4)
        layer.style.filter = `blur(${blur.toFixed(2)}px)`
        layer.style.setProperty("--project-title-x", `${descriptor.titleX}px`)
        layer.style.setProperty("--project-title-y", `${descriptor.titleY}px`)
        layer.style.setProperty("--project-title-scale", scale.toFixed(4))
        layer.style.setProperty(
          "--project-copy-shift",
          `${translateY.toFixed(2)}px`
        )
      })
    }

    function applyRoute(
      tilt: number,
      bow: number,
      glyphX: number,
      routeOpacity: number,
      glyphOpacity: number,
      direction: number,
      walkerFrame: number
    ) {
      const routePath = buildRoutePath(tilt, bow)
      timelinePath.setAttribute("d", routePath)
      timelinePathShadow.setAttribute("d", routePath)
      const dashOffset = dashDrift.toFixed(2)
      timelinePath.style.strokeDashoffset = dashOffset
      timelinePathShadow.style.strokeDashoffset = dashOffset
      timelineRoute.style.opacity = routeOpacity.toFixed(3)

      const u = (glyphX - ROUTE_CENTER_X) / ROUTE_HALF_SPAN
      const glyphY = routeY(u, tilt, bow)
      const lean = clamp(
        ((Math.atan(routeGradient(u, tilt, bow)) * 180) / Math.PI) * 0.55,
        -5,
        5
      )
      const offsetX = routeOrigin.x + (glyphX - ROUTE_CENTER_X) * routeOrigin.scale
      const offsetY = routeOrigin.y + (glyphY - ROUTE_CENTER_Y) * routeOrigin.scale

      timelineGlyph.style.opacity = glyphOpacity.toFixed(3)
      timelineGlyph.style.transform = `translate(-50%, -50%) translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px) rotate(${lean.toFixed(2)}deg)`
      timelineWalker.style.transform = `scaleX(${direction < 0 ? -1 : 1})`

      if (walkerFrame !== visibleWalkerFrame) {
        if (walkerFrames[visibleWalkerFrame])
          walkerFrames[visibleWalkerFrame].style.opacity = "0"
        if (walkerFrames[walkerFrame])
          walkerFrames[walkerFrame].style.opacity = "1"
        visibleWalkerFrame = walkerFrame
      }
    }

    function applyRestingRoute() {
      applyRoute(
        routeTilt,
        routeBow,
        ROUTE_CENTER_X,
        1,
        1,
        directionRef.current,
        0
      )
    }

    function selectProject(targetIndex: number) {
      const selectedIndex = activeIndexRef.current
      if (targetIndex === selectedIndex) return

      const direction = targetIndex > selectedIndex ? 1 : -1
      directionRef.current = direction
      activeIndexRef.current = targetIndex
      setActiveIndex(targetIndex)

      if (prefersReducedMotion) {
        routeTilt = tiltAt(targetIndex)
        routeBow = bowAt(targetIndex)
        applyProjectVisuals(targetIndex, targetIndex, 1, direction)
        applyRestingRoute()
        setIsTransitioning(false)
        return
      }

      setIsTransitioning(true)
      transition = {
        appliedProgress: 0,
        direction,
        fromIndex: selectedIndex,
        startedAt: performance.now(),
        toIndex: targetIndex,
      }
      // The line settles a little slower than the image morphs and always
      // travels straight to its new rest angle, so a project change reads as a
      // lean rather than a swing.
      routeShift = {
        fromBow: routeBow,
        fromTilt: routeTilt,
        startedAt: performance.now(),
        toBow: bowAt(targetIndex),
        toTilt: tiltAt(targetIndex),
      }
    }

    function projectScrollTop(index: number) {
      const denominator = Math.max(projects.length - 1, 1)
      const ratio = projects.length > 1 ? index / denominator : 0
      const sectionTop =
        window.scrollY + timelineSection.getBoundingClientRect().top
      const scrollRange = Math.max(
        timelineSection.offsetHeight - window.innerHeight,
        0
      )
      return sectionTop + scrollRange * ratio
    }

    function gotoAdjacentProject(direction: number) {
      if (transition) return false

      const targetIndex = Math.min(
        projects.length - 1,
        Math.max(0, activeIndexRef.current + direction)
      )
      if (targetIndex === activeIndexRef.current) return false

      selectProject(targetIndex)
      window.scrollTo({ top: projectScrollTop(targetIndex), behavior: "auto" })
      return true
    }

    function timelineOwnsInput() {
      const bounds = timelineSection.getBoundingClientRect()
      return bounds.top <= 1 && bounds.bottom >= window.innerHeight - 1
    }

    function handleWheel(event: WheelEvent) {
      if (!timelineOwnsInput()) return

      const direction = Math.sign(event.deltaY)
      const canMove =
        direction > 0
          ? activeIndexRef.current < projects.length - 1
          : activeIndexRef.current > 0
      if (!canMove) return

      event.preventDefault()
      if (transition) return

      wheelDelta += event.deltaY
      if (Math.abs(wheelDelta) < 8) return

      const moved = gotoAdjacentProject(Math.sign(wheelDelta))
      if (moved) wheelDelta = 0
    }

    function handleTouchStart(event: TouchEvent) {
      touchStartY = event.touches[0]?.clientY ?? null
    }

    function handleTouchMove(event: TouchEvent) {
      if (touchStartY === null || !timelineOwnsInput()) return

      const currentY = event.touches[0]?.clientY
      if (currentY === undefined) return
      const delta = touchStartY - currentY
      const direction = Math.sign(delta)
      const canMove =
        direction > 0
          ? activeIndexRef.current < projects.length - 1
          : activeIndexRef.current > 0
      if (!canMove) return

      event.preventDefault()
      if (transition || Math.abs(delta) < 8) return

      if (gotoAdjacentProject(direction)) touchStartY = currentY
    }

    function renderAnimationFrame(now: number) {
      animationFrame = 0
      if (lastFrameTime === 0) lastFrameTime = now
      ambientElapsed += Math.min(now - lastFrameTime, 50)
      lastFrameTime = now
      const ambientPhase =
        (ambientElapsed / ROUTE_AMBIENT_PERIOD) * Math.PI * 2

      let direction = directionRef.current
      let walkerFrame = 0

      if (transition) {
        const rawProgress = clamp(
          (now - transition.startedAt) / TRANSITION_DURATION
        )
        const easedProgress = morphEase(rawProgress)
        applyProjectVisuals(
          transition.fromIndex,
          transition.toIndex,
          easedProgress,
          transition.direction
        )
        dashDrift -=
          (easedProgress - transition.appliedProgress) *
          ROUTE_DASH_TRAVEL *
          transition.direction
        transition.appliedProgress = easedProgress
        direction = transition.direction
        walkerFrame = Math.min(
          ARTHUR_WALK_FRAME_COUNT - 1,
          Math.floor(rawProgress * ARTHUR_WALK_FRAME_COUNT)
        )

        if (rawProgress >= 1) {
          transition = null
          walkerFrame = 0
          setIsTransitioning(false)
        }
      }

      if (routeShift) {
        const rawProgress = clamp(
          (now - routeShift.startedAt) / ROUTE_SETTLE_DURATION
        )
        const easedProgress = settleEase(rawProgress)
        routeTilt = interpolate(
          routeShift.fromTilt,
          routeShift.toTilt,
          easedProgress
        )
        routeBow = interpolate(
          routeShift.fromBow,
          routeShift.toBow,
          easedProgress
        )
        if (rawProgress >= 1) routeShift = null
      }

      let glyphX = ROUTE_CENTER_X
      let settle = 1
      let routeOpacity = 1
      let glyphOpacity = 1

      if (entrance) {
        if (entrance.revealedAt === 0) entrance.revealedAt = now
        const elapsed = now - entrance.revealedAt
        const rawProgress = clamp(elapsed / ENTRANCE_DURATION)
        const easedProgress = entranceEase(rawProgress)

        glyphX = interpolate(ENTRANCE_START_X, ROUTE_CENTER_X, easedProgress)
        settle = 0.14 + 0.86 * easedProgress
        routeOpacity = clamp(easedProgress * 2.4)
        glyphOpacity = clamp(elapsed / 240)
        direction = -1

        // Pace the gait by ground covered, so the walk slows to a stop with the
        // easing instead of running at a fixed rate and freezing on arrival.
        walkDistance += Math.abs(previousGlyphX - glyphX) * routeOrigin.scale
        walkerFrame =
          Math.floor((walkDistance / WALK_STRIDE) * ARTHUR_WALK_FRAME_COUNT) %
          ARTHUR_WALK_FRAME_COUNT

        if (rawProgress >= 1) {
          entrance = null
          walkerFrame = 0
        }
      }
      previousGlyphX = glyphX

      const tilt =
        (routeTilt + Math.sin(ambientPhase) * ROUTE_AMBIENT_TILT) * settle
      const bow =
        (routeBow + Math.sin(ambientPhase * 0.57 + 1.9) * ROUTE_AMBIENT_BOW) *
        settle

      applyRoute(
        tilt,
        bow,
        glyphX,
        routeOpacity,
        glyphOpacity,
        direction,
        walkerFrame
      )

      animationFrame = window.requestAnimationFrame(renderAnimationFrame)
    }

    function startAmbientAnimation() {
      if (prefersReducedMotion || document.hidden || animationFrame) return
      lastFrameTime = 0
      animationFrame = window.requestAnimationFrame(renderAnimationFrame)
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        if (animationFrame) window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        lastFrameTime = 0
        return
      }

      startAmbientAnimation()
    }

    function readScrollTarget() {
      scrollFrame = 0
      const scrollRange = Math.max(
        timelineSection.offsetHeight - window.innerHeight,
        1
      )
      const sectionProgress = clamp(
        -timelineSection.getBoundingClientRect().top / scrollRange
      )
      const targetIndex = Math.min(
        projects.length - 1,
        Math.max(0, Math.round(sectionProgress * (projects.length - 1)))
      )
      selectProject(targetIndex)
    }

    function scheduleTargetRead() {
      if (scrollFrame) return
      measureRoute()
      scrollFrame = window.requestAnimationFrame(readScrollTarget)
    }

    measureRoute()
    routeTilt = tiltAt(activeIndexRef.current)
    routeBow = bowAt(activeIndexRef.current)
    applyProjectVisuals(
      activeIndexRef.current,
      activeIndexRef.current,
      1,
      directionRef.current
    )
    if (prefersReducedMotion) applyRestingRoute()
    scrollFrame = window.requestAnimationFrame(readScrollTarget)
    window.addEventListener("resize", scheduleTargetRead)
    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("visibilitychange", handleVisibilityChange)
    startAmbientAnimation()

    return () => {
      window.removeEventListener("resize", scheduleTargetRead)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [prefersReducedMotion, projects.length])

  if (projects.length === 0) {
    return (
      <main className="timeline-empty">
        <LivingTag />
        <p className="font-data">
          {isPortuguese ? "ARQUIVO EM PREPARAÇÃO" : "ARCHIVE IN PREPARATION"}
        </p>
        {contactHref ? (
          <a href={contactHref} className="timeline-text-link">
            {isPortuguese ? "CONTACTO" : "CONTACT"}
          </a>
        ) : null}
      </main>
    )
  }

  const activeProject = projects[activeIndex] ?? projects[0]
  const activeRippleImage = morphItems[activeIndex]?.image ?? FALLBACK_IMAGE
  const mediaHoverActive = isMediaHovered && !prefersReducedMotion
  const rippleEnabled = mediaHoverActive && !isTransitioning
  const count = Math.max(projects.length, 2)
  const indexHeading =
    tagline ?? (isPortuguese ? "Arquivo vivo." : "Living archive.")

  function scrollToProject(index: number) {
    const section = sectionRef.current
    if (!section || !projects[index]) return

    const denominator = Math.max(projects.length - 1, 1)
    const ratio = projects.length > 1 ? index / denominator : 0
    const sectionTop = window.scrollY + section.getBoundingClientRect().top
    const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 0)

    window.scrollTo({
      top: sectionTop + scrollRange * ratio,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  return (
    <main className="timeline-shell">
      <header className="timeline-header">
        <a
          href="#project-timeline"
          className="timeline-brand"
          aria-label={`${ownerName}, home`}
        >
          <LivingTag compact />
        </a>

        <p className="timeline-header-position font-data">
          {formatIndex(activeIndex)} / {formatCount(projects.length)}
        </p>

        <nav
          className="timeline-header-nav font-data"
          aria-label={
            isPortuguese ? "Navegação principal" : "Primary navigation"
          }
        >
          <a href="#project-index">{isPortuguese ? "ÍNDICE" : "INDEX"}</a>
          {contactHref ? (
            <a href={contactHref}>{isPortuguese ? "CONTACTO" : "CONTACT"}</a>
          ) : null}
        </nav>
      </header>

      <section
        ref={sectionRef}
        id="project-timeline"
        className="timeline-scroll"
        style={{ "--timeline-count": count } as CSSProperties}
        aria-label={
          isPortuguese ? "Linha temporal de projetos" : "Project timeline"
        }
      >
        <div className="timeline-stage">
          <div className="timeline-background-morph" aria-hidden="true">
            <MorphSlider
              ref={backgroundMorphRef}
              items={morphItems}
              reducedMotion={prefersReducedMotion}
              intensity={0.32}
              darkness={0.78}
              aberration={0.04}
              dprCap={1}
              scale={3.15}
            />
          </div>
          <div className="timeline-background-shade" aria-hidden="true" />

          <div
            ref={mediaFrameRef}
            className="timeline-media-frame"
            data-media-hover={mediaHoverActive ? "true" : "false"}
            data-ripple-active={rippleEnabled ? "true" : "false"}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen")
                setIsMediaHovered(true)
            }}
            onPointerLeave={() => setIsMediaHovered(false)}
          >
            <MorphSlider
              ref={mediaMorphRef}
              items={morphItems}
              reducedMotion={prefersReducedMotion}
              intensity={0.48}
              darkness={0.48}
              aberration={0.09}
              dprCap={1.5}
              scale={2.75}
            />
            <div className="timeline-ripple-layer" aria-hidden="true">
              <RippleDistortion
                src={activeRippleImage}
                enabled={rippleEnabled}
                jiggle={0.016}
                jiggleScale={2.6}
                jiggleSpeed={1}
                brushSize={120}
                strength={0.12}
                swirl={0.7}
                rings={3}
                spread={3.2}
                fade={2.4}
                spacing={24}
                dispersion={0.03}
                glint={0.14}
                tint="#ef5a38"
                tintAmount={0.075}
                highlightColor="#f2ead8"
                grayscale={false}
                quality="low"
              />
            </div>
          </div>

          <div className="timeline-project-layers">
            {projects.map((project, index) => {
              const descriptor = MORPH_PRESETS[index % MORPH_PRESETS.length]
              return (
                <div
                  key={project.id}
                  ref={(element) => {
                    projectLayerRefs.current[index] = element
                  }}
                  className="timeline-project-layer"
                  style={
                    {
                      "--project-background-blur": `${descriptor.backgroundBlur}px`,
                      "--project-copy-shift": "0px",
                      "--project-title-scale": descriptor.titleScale,
                      "--project-title-x": `${descriptor.titleX}px`,
                      "--project-title-y": `${descriptor.titleY}px`,
                      opacity: index === 0 ? 1 : 0,
                    } as CSSProperties
                  }
                  aria-hidden={index !== activeIndex}
                >
                  <div className="timeline-project-mark" aria-hidden="true">
                    {project.title}
                  </div>
                  <div className="timeline-project-copy">
                    <p className="timeline-project-kicker font-data">
                      {formatIndex(index)} / {formatCount(projects.length)}
                    </p>
                    <h2>{project.title}</h2>
                    <p className="timeline-project-meta font-data">
                      <span>{project.year ?? "YEAR TBC"}</span>
                      <span>
                        {projectRole(project) ??
                          (isPortuguese
                            ? "FUNÇÃO A CONFIRMAR"
                            : "ROLE TO BE CONFIRMED")}
                      </span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="timeline-frame" aria-hidden="true" />

          <svg
            ref={routeRef}
            className="timeline-route"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            <path
              ref={pathShadowRef}
              className="timeline-route-shadow"
              d={buildRoutePath(0, 0)}
            />
            <path
              ref={pathRef}
              className="timeline-route-line"
              d={buildRoutePath(0, 0)}
            />
          </svg>

          <div
            ref={glyphRef}
            className="timeline-glyph"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            <div ref={walkerRef} className="timeline-glyph-walker">
              <ArthurWalker />
            </div>
          </div>

          <p className="timeline-side-label timeline-side-label-left font-data">
            {isPortuguese ? "ROLAR / EXPLORAR" : "SCROLL / EXPLORE"}
          </p>
          <p className="timeline-side-label timeline-side-label-right font-data">
            {activeProject.year ?? "YEAR TBC"}
          </p>
        </div>
      </section>

      <section id="project-index" className="timeline-index">
        <div className="timeline-index-heading">
          <p className="font-data">{isPortuguese ? "ÍNDICE" : "INDEX"}</p>
          <h2>
            <BlurText
              text={indexHeading}
              className="timeline-index-blur-text"
              delay={115}
              direction="bottom"
              stepDuration={0.42}
              animationFrom={{ filter: "blur(8px)", opacity: 0, y: 14 }}
              animationTo={[
                { filter: "blur(3px)", opacity: 0.52, y: -2 },
                { filter: "blur(0px)", opacity: 1, y: 0 },
              ]}
            />
          </h2>
        </div>

        <ol
          className="timeline-index-list"
          aria-label={isPortuguese ? "Projetos" : "Projects"}
        >
          {projects.map((project, index) => {
            const active = index === activeIndex
            return (
              <li key={project.id}>
                <button
                  type="button"
                  className="timeline-index-row"
                  aria-current={active ? "true" : undefined}
                  onClick={() => scrollToProject(index)}
                >
                  <span className="font-data">{formatIndex(index)}</span>
                  <span>{project.title}</span>
                  <span className="font-data">{project.year ?? "—"}</span>
                  <span className="font-data">
                    {active ? "ACTIVE" : "LOCATE"}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}
