"use client"

import Image from "next/image"
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"

import BlurText from "@/components/BlurText"
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

type SceneDescriptor = {
  camera: { scale: number; x: number; y: number }
  node: { x: number; y: number }
  panel: {
    height: number
    rotate: number
    width: number
    x: number
    y: number
  }
  title: {
    align: "left" | "right"
    scale: number
    x: number
    y: number
  }
}

const SCENE_PRESETS = [
  {
    camera: { scale: 1, x: -90, y: 36 },
    nodeY: 420,
    panel: { height: 420, rotate: -1.8, width: 620, x: -420, y: -300 },
    title: { align: "left" as const, scale: 1.08, x: -430, y: 174 },
  },
  {
    camera: { scale: 1.08, x: 74, y: -26 },
    nodeY: 258,
    panel: { height: 360, rotate: 1.3, width: 540, x: -86, y: -270 },
    title: { align: "right" as const, scale: 0.82, x: 122, y: 142 },
  },
  {
    camera: { scale: 0.94, x: -22, y: 54 },
    nodeY: 486,
    panel: { height: 455, rotate: -0.5, width: 520, x: -345, y: -386 },
    title: { align: "left" as const, scale: 0.92, x: -206, y: 128 },
  },
  {
    camera: { scale: 1.04, x: 110, y: 22 },
    nodeY: 326,
    panel: { height: 390, rotate: 1.6, width: 670, x: -250, y: -300 },
    title: { align: "right" as const, scale: 1.12, x: 176, y: 164 },
  },
  {
    camera: { scale: 0.98, x: -42, y: -44 },
    nodeY: 438,
    panel: { height: 430, rotate: -1.1, width: 580, x: -392, y: -252 },
    title: { align: "left" as const, scale: 0.88, x: -356, y: 200 },
  },
] as const

const SCENE_SPACING = [680, 790, 610, 735, 650]

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value))
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

function createScenes(count: number): SceneDescriptor[] {
  let x = 360

  return Array.from({ length: count }, (_, index) => {
    if (index > 0) x += SCENE_SPACING[(index - 1) % SCENE_SPACING.length]
    const preset = SCENE_PRESETS[index % SCENE_PRESETS.length]

    return {
      camera: { ...preset.camera },
      node: { x, y: preset.nodeY },
      panel: { ...preset.panel },
      title: { ...preset.title },
    }
  })
}

function buildRoutePath(scenes: SceneDescriptor[]) {
  if (scenes.length === 0) return ""
  if (scenes.length === 1) {
    const { x, y } = scenes[0].node
    return `M ${x - 300} ${y + 70} C ${x - 120} ${y - 110} ${x + 120} ${y + 110} ${x + 300} ${y - 50}`
  }

  return scenes.slice(1).reduce((path, scene, index) => {
    const from = scenes[index].node
    const to = scene.node
    const dx = to.x - from.x
    const swing = index % 2 === 0 ? -150 : 145
    return `${path} C ${from.x + dx * 0.38} ${from.y + swing} ${to.x - dx * 0.38} ${to.y - swing} ${to.x} ${to.y}`
  }, `M ${scenes[0].node.x} ${scenes[0].node.y}`)
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

export function ArchivePrototype({
  contactHref,
  locale,
  ownerName,
  projects,
  tagline,
}: ArchivePrototypeProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const glyphRef = useRef<SVGGElement>(null)
  const walkerRef = useRef<SVGGElement>(null)
  const sceneRefs = useRef<(HTMLElement | null)[]>([])
  const nodeRefs = useRef<(SVGGElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const directionRef = useRef(1)
  const progressRef = useRef(0)
  const isPortuguese = locale === "pt"
  const scenes = useMemo(() => createScenes(projects.length), [projects.length])
  const routePath = useMemo(() => buildRoutePath(scenes), [scenes])
  const worldWidth = (scenes.at(-1)?.node.x ?? 960) + 520
  const worldHeight = 760

  useEffect(() => {
    const section = sectionRef.current
    const world = worldRef.current
    const path = pathRef.current
    const glyph = glyphRef.current
    const walker = walkerRef.current
    if (
      !section ||
      !world ||
      !path ||
      !glyph ||
      !walker ||
      projects.length === 0
    )
      return

    const timelineSection: HTMLElement = section
    const timelineWorld: HTMLDivElement = world
    const timelinePath: SVGPathElement = path
    const timelineGlyph: SVGGElement = glyph
    const timelineWalker: SVGGElement = walker
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0

    function renderTimeline() {
      frame = 0
      const scrollRange = Math.max(
        timelineSection.offsetHeight - window.innerHeight,
        1
      )
      const rawProgress = clamp(
        -timelineSection.getBoundingClientRect().top / scrollRange
      )
      const projectRange = Math.max(projects.length - 1, 0)
      const rawPosition = rawProgress * projectRange
      const nearestIndex = Math.min(
        projects.length - 1,
        Math.max(0, Math.round(rawPosition))
      )
      const effectiveProgress =
        projects.length === 1
          ? 0.5
          : reducedMotion.matches
            ? nearestIndex / projectRange
            : rawProgress
      const effectivePosition =
        projects.length > 1 ? effectiveProgress * projectRange : 0
      const fromIndex = Math.min(
        projects.length - 1,
        Math.max(0, Math.floor(effectivePosition))
      )
      const toIndex = Math.min(fromIndex + 1, projects.length - 1)
      const localProgress = effectivePosition - fromIndex
      const fromScene = scenes[fromIndex]
      const toScene = scenes[toIndex]
      const length = timelinePath.getTotalLength()
      const pathDistance = length * effectiveProgress
      const point = timelinePath.getPointAtLength(pathDistance)
      const tangentDistance = Math.min(7, Math.max(length * 0.006, 2))
      const before = timelinePath.getPointAtLength(
        clamp(pathDistance - tangentDistance, 0, length)
      )
      const after = timelinePath.getPointAtLength(
        clamp(pathDistance + tangentDistance, 0, length)
      )

      if (Math.abs(rawProgress - progressRef.current) > 0.0001) {
        directionRef.current = rawProgress >= progressRef.current ? 1 : -1
        progressRef.current = rawProgress
      }

      const tangentAngle =
        (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI
      const facingAngle = tangentAngle + (directionRef.current < 0 ? 180 : 0)
      const traveled = pathDistance * directionRef.current
      const step = reducedMotion.matches ? 0 : Math.sin(traveled / 15)
      const bob = reducedMotion.matches ? 0 : Math.abs(step) * -5
      const lean = reducedMotion.matches ? 0 : step * 5.5
      const stretch = reducedMotion.matches ? 1 : 1 + Math.abs(step) * 0.045

      timelineGlyph.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${facingAngle})`
      )
      timelineWalker.setAttribute(
        "transform",
        `translate(0 ${bob}) rotate(${lean}) scale(1 ${stretch})`
      )

      const cameraX = interpolate(
        fromScene.node.x + fromScene.camera.x,
        toScene.node.x + toScene.camera.x,
        localProgress
      )
      const cameraY = interpolate(
        fromScene.node.y + fromScene.camera.y,
        toScene.node.y + toScene.camera.y,
        localProgress
      )
      const cameraScale = interpolate(
        fromScene.camera.scale,
        toScene.camera.scale,
        localProgress
      )
      const viewportScale = clamp(
        Math.max(window.innerWidth / 1500, window.innerHeight / 930),
        0.62,
        1.32
      )
      const scale = viewportScale * cameraScale
      const cameraAnchorY = window.innerWidth < 700 ? 0.58 : 0.54

      timelineWorld.style.transform = `translate3d(${(
        window.innerWidth * 0.5 -
        cameraX * scale
      ).toFixed(2)}px, ${(
        window.innerHeight * cameraAnchorY -
        cameraY * scale
      ).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
      timelineSection.style.setProperty(
        "--timeline-progress",
        String(effectiveProgress)
      )

      sceneRefs.current.forEach((scene, index) => {
        if (!scene) return
        const signedDistance = index - effectivePosition
        const distance = Math.abs(signedDistance)
        const presence = clamp(1 - distance / 1.65)
        const focus = clamp(1 - distance)
        const driftX = signedDistance * 54
        const driftY = Math.min(distance, 1.5) * 18
        const panelScale = 1 + distance * 0.055
        const panelRotation = scenes[index].panel.rotate + signedDistance * 0.8

        scene.style.setProperty("--scene-presence", presence.toFixed(4))
        scene.style.setProperty("--scene-focus", focus.toFixed(4))
        scene.style.setProperty("--scene-distance", distance.toFixed(4))
        scene.style.setProperty("--scene-drift-x", `${driftX.toFixed(2)}px`)
        scene.style.setProperty("--scene-drift-y", `${driftY.toFixed(2)}px`)
        scene.style.setProperty("--scene-panel-scale", panelScale.toFixed(4))
        scene.style.setProperty(
          "--scene-panel-rotate",
          `${panelRotation.toFixed(2)}deg`
        )
      })

      nodeRefs.current.forEach((node, index) => {
        if (!node) return
        node.style.setProperty(
          "--node-active",
          index === nearestIndex ? "1" : "0"
        )
      })

      if (nearestIndex !== activeIndexRef.current) {
        activeIndexRef.current = nearestIndex
        setActiveIndex(nearestIndex)
      }
    }

    function scheduleTimeline() {
      if (frame) return
      frame = window.requestAnimationFrame(renderTimeline)
    }

    renderTimeline()
    window.addEventListener("scroll", scheduleTimeline, { passive: true })
    window.addEventListener("resize", scheduleTimeline)
    reducedMotion.addEventListener("change", scheduleTimeline)

    return () => {
      window.removeEventListener("scroll", scheduleTimeline)
      window.removeEventListener("resize", scheduleTimeline)
      reducedMotion.removeEventListener("change", scheduleTimeline)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [projects.length, scenes])

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
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    window.scrollTo({
      top: sectionTop + scrollRange * ratio,
      behavior: reducedMotion ? "auto" : "smooth",
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
          <div className="timeline-atmosphere" aria-hidden="true" />
          <div className="timeline-frame" aria-hidden="true" />

          <div
            ref={worldRef}
            className="timeline-world"
            style={{
              height: worldHeight,
              width: worldWidth,
            }}
          >
            <div className="timeline-scenes">
              {projects.map((project, index) => {
                const cover = mediaUrl(project.cover, "hero")
                const media = resolveMedia(project.cover)
                const scene = scenes[index]

                return (
                  <article
                    key={project.id}
                    ref={(element) => {
                      sceneRefs.current[index] = element
                    }}
                    className={
                      index === activeIndex
                        ? "timeline-scene timeline-scene-active"
                        : "timeline-scene"
                    }
                    style={
                      {
                        "--panel-height": `${scene.panel.height}px`,
                        "--panel-width": `${scene.panel.width}px`,
                        "--panel-x": `${scene.panel.x}px`,
                        "--panel-y": `${scene.panel.y}px`,
                        "--scene-panel-rotate": `${scene.panel.rotate}deg`,
                        "--scene-presence": index === 0 ? 1 : 0,
                        "--title-scale": scene.title.scale,
                        "--title-x": `${scene.title.x}px`,
                        "--title-y": `${scene.title.y}px`,
                        left: scene.node.x,
                        top: scene.node.y,
                      } as CSSProperties
                    }
                    aria-hidden={index !== activeIndex}
                  >
                    <div className="timeline-scene-ghost" aria-hidden="true">
                      {project.title}
                    </div>
                    <div className="timeline-scene-panel">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          priority={index === 0}
                          sizes="(max-width: 700px) 82vw, 46vw"
                          className="timeline-scene-image"
                          style={{
                            objectPosition: `${media?.focalX ?? 50}% ${media?.focalY ?? 50}%`,
                          }}
                        />
                      ) : (
                        <div className="timeline-scene-missing" />
                      )}
                      <div className="timeline-scene-panel-shade" />
                    </div>

                    <div
                      className={`timeline-scene-copy timeline-scene-copy-${scene.title.align}`}
                    >
                      <p className="timeline-scene-kicker font-data">
                        {formatIndex(index)} / {formatCount(projects.length)}
                      </p>
                      <h2>{project.title}</h2>
                      <p className="timeline-scene-meta font-data">
                        <span>{project.year ?? "YEAR TBC"}</span>
                        <span>
                          {projectRole(project) ??
                            (isPortuguese
                              ? "FUNÇÃO A CONFIRMAR"
                              : "ROLE TO BE CONFIRMED")}
                        </span>
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            <svg
              className="timeline-route"
              viewBox={`0 0 ${worldWidth} ${worldHeight}`}
              width={worldWidth}
              height={worldHeight}
              aria-hidden="true"
            >
              <path className="timeline-route-shadow" d={routePath} />
              <path
                ref={pathRef}
                className="timeline-route-line"
                d={routePath}
              />

              {scenes.map((scene, index) => (
                <g
                  key={projects[index].id}
                  ref={(element) => {
                    nodeRefs.current[index] = element
                  }}
                  className="timeline-node"
                  transform={`translate(${scene.node.x} ${scene.node.y})`}
                  style={
                    { "--node-active": index === 0 ? 1 : 0 } as CSSProperties
                  }
                >
                  <circle r="3.5" />
                  <path d="M -12 0 H -6 M 6 0 H 12" />
                </g>
              ))}

              <g ref={glyphRef} className="timeline-glyph">
                <g ref={walkerRef} className="timeline-glyph-walker">
                  <circle className="timeline-glyph-halo" r="27" />
                  <path
                    className="timeline-glyph-body"
                    d="M -7 -23 C 10 -9 3 5 -5 13 C -12 20 -9 29 6 35 C -17 36 -26 20 -17 7 C -7 -7 -20 -15 -7 -23 Z"
                  />
                  <path
                    className="timeline-glyph-cut"
                    d="M -12 3 C -4 -1 4 -1 11 3"
                  />
                  <circle
                    className="timeline-glyph-foot timeline-glyph-foot-a"
                    cx="-8"
                    cy="36"
                    r="2.6"
                  />
                  <circle
                    className="timeline-glyph-foot timeline-glyph-foot-b"
                    cx="8"
                    cy="36"
                    r="2.6"
                  />
                </g>
              </g>
            </svg>
          </div>

          <p className="timeline-side-label timeline-side-label-left font-data">
            {isPortuguese ? "ROLAR / EXPLORAR" : "SCROLL / EXPLORE"}
          </p>
          <p className="timeline-side-label timeline-side-label-right font-data">
            {activeProject.year ?? "YEAR TBC"}
          </p>

          <div className="timeline-status" aria-live="polite">
            <p className="font-data">
              {formatIndex(activeIndex)} / {formatCount(projects.length)}
            </p>
            <p>{activeProject.title}</p>
          </div>
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
