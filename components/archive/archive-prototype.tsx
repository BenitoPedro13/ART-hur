"use client"

import Image from "next/image"
import { useState } from "react"

import { LivingTag } from "@/components/brand/living-tag"
import { mediaAlt, mediaUrl, resolveMedia } from "@/lib/media"
import type { Project } from "@/payload-types"

type Direction = "next" | "previous"

type ArchivePrototypeProps = {
  contactHref: string | null
  locale: string
  ownerName: string
  projects: Project[]
  tagline: string | null
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0")
}

function projectRole(project: Project) {
  return project.meta?.[0]?.value ?? null
}

export function ArchivePrototype({
  contactHref,
  locale,
  ownerName,
  projects,
  tagline,
}: ArchivePrototypeProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>("next")
  const activeProject = projects[activeIndex]
  const isPortuguese = locale === "pt"

  function selectProject(index: number) {
    if (index === activeIndex) return
    setDirection(index > activeIndex ? "next" : "previous")
    setActiveIndex(index)
  }

  function stepProject(step: number) {
    if (projects.length < 2) return
    const nextIndex = (activeIndex + step + projects.length) % projects.length
    setDirection(step > 0 ? "next" : "previous")
    setActiveIndex(nextIndex)
  }

  if (!activeProject) {
    return (
      <main className="archive-empty">
        <LivingTag />
        <p className="font-data">
          {isPortuguese ? "ARQUIVO EM PREPARAÇÃO" : "ARCHIVE IN PREPARATION"}
        </p>
        {contactHref ? (
          <a href={contactHref} className="archive-text-link">
            {isPortuguese ? "CONTACTO" : "CONTACT"}
          </a>
        ) : null}
      </main>
    )
  }

  const cover = mediaUrl(activeProject.cover, "hero")
  const coverMedia = resolveMedia(activeProject.cover)
  const focalPosition = `${coverMedia?.focalX ?? 50}% ${coverMedia?.focalY ?? 50}%`
  const role = projectRole(activeProject)
  const activeKey = `${activeProject.id}-${direction}`

  return (
    <main
      className="archive-shell"
      data-direction={direction}
      data-variant={activeIndex % 3}
    >
      <header className="archive-header">
        <a
          href="#archive-stage"
          className="archive-brand"
          aria-label={`${ownerName}, home`}
        >
          <LivingTag compact />
        </a>

        <p className="archive-header-caption font-data">
          {isPortuguese
            ? "ARQUIVO / TRABALHOS SELECIONADOS"
            : "ARCHIVE / SELECTED WORK"}
        </p>

        <nav
          className="archive-header-nav font-data"
          aria-label="Primary navigation"
        >
          <a href="#archive-index">{isPortuguese ? "ÍNDICE" : "INDEX"}</a>
          <a href="#project-data">INFO</a>
          {contactHref ? (
            <a href={contactHref}>{isPortuguese ? "CONTACTO" : "CONTACT"}</a>
          ) : null}
        </nav>
      </header>

      <section
        id="archive-stage"
        className="archive-stage"
        aria-labelledby="active-project-title"
      >
        {cover ? (
          <div className="archive-atmosphere" aria-hidden="true">
            <Image
              key={`atmosphere-${activeKey}`}
              src={cover}
              alt=""
              fill
              priority
              sizes="100vw"
              className="archive-atmosphere-image"
            />
          </div>
        ) : null}

        <div className="archive-grid" aria-hidden="true" />

        <div className="archive-coordinate archive-coordinate-left font-data">
          <span>ARCHIVE / {formatIndex(activeIndex)}</span>
          <span>CUT {formatIndex(activeIndex)}</span>
        </div>
        <div className="archive-coordinate archive-coordinate-right font-data">
          <span>{activeProject.year ?? "YEAR TBC"}</span>
          <span>
            {formatIndex(activeIndex)} / {formatIndex(projects.length - 1)}
          </span>
        </div>

        <div key={`title-${activeKey}`} className="archive-title-block">
          <p className="archive-kicker font-data">
            {isPortuguese ? "TRABALHO SELECIONADO" : "SELECTED WORK"} /{" "}
            {formatIndex(activeIndex)}
          </p>
          <h1 id="active-project-title" className="archive-title font-display">
            {activeProject.title}
          </h1>
        </div>

        <div key={`media-${activeKey}`} className="archive-media-frame">
          <div className="archive-media-crop">
            {cover ? (
              <Image
                src={cover}
                alt={mediaAlt(activeProject.cover, activeProject.title)}
                fill
                priority
                sizes="(max-width: 700px) 92vw, 64vw"
                className="archive-media-image"
                style={{ objectPosition: focalPosition }}
              />
            ) : (
              <div className="archive-media-missing font-data">
                {isPortuguese ? "MEDIA PENDENTE" : "MEDIA PENDING"}
              </div>
            )}
          </div>
          <span
            className="archive-crop-mark archive-crop-mark-tl"
            aria-hidden="true"
          />
          <span
            className="archive-crop-mark archive-crop-mark-tr"
            aria-hidden="true"
          />
          <span
            className="archive-crop-mark archive-crop-mark-bl"
            aria-hidden="true"
          />
          <span
            className="archive-crop-mark archive-crop-mark-br"
            aria-hidden="true"
          />
        </div>

        <div
          id="project-data"
          key={`data-${activeKey}`}
          className="archive-project-data"
        >
          <p className="archive-project-number font-data">
            {formatIndex(activeIndex)}
          </p>
          <div>
            <p className="archive-data-label font-data">
              {isPortuguese ? "FUNÇÃO" : "ROLE"}
            </p>
            <p>{role ?? (isPortuguese ? "A CONFIRMAR" : "TO BE CONFIRMED")}</p>
          </div>
          <div>
            <p className="archive-data-label font-data">
              {isPortuguese ? "ANO" : "YEAR"}
            </p>
            <p>{activeProject.year ?? "—"}</p>
          </div>
          <div className="archive-data-credit">
            <p className="archive-data-label font-data">
              {isPortuguese ? "CRÉDITOS" : "CREDITS"}
            </p>
            <p>
              {activeProject.meta
                ?.slice(1)
                .map((item) => item.value)
                .join(" · ") || "—"}
            </p>
          </div>
        </div>

        <div className="archive-stage-controls" aria-label="Project controls">
          <button
            type="button"
            onClick={() => stepProject(-1)}
            disabled={projects.length < 2}
            aria-label={isPortuguese ? "Projeto anterior" : "Previous project"}
          >
            ←
          </button>
          <p className="font-data" aria-live="polite">
            {formatIndex(activeIndex)} / {formatIndex(projects.length - 1)}
          </p>
          <button
            type="button"
            onClick={() => stepProject(1)}
            disabled={projects.length < 2}
            aria-label={isPortuguese ? "Projeto seguinte" : "Next project"}
          >
            →
          </button>
        </div>
      </section>

      <footer id="archive-index" className="archive-index">
        <div className="archive-index-intro">
          <p className="font-data">{isPortuguese ? "ÍNDICE" : "INDEX"}</p>
          <p>
            {tagline ??
              (isPortuguese
                ? "Um arquivo vivo com ritmo."
                : "A living archive with rhythm.")}
          </p>
        </div>

        <ol
          className="archive-track-list"
          aria-label={isPortuguese ? "Projetos" : "Projects"}
        >
          {projects.map((project, index) => {
            const active = index === activeIndex
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => selectProject(index)}
                  className="archive-track"
                  aria-current={active ? "true" : undefined}
                >
                  <span className="archive-track-index font-data">
                    {formatIndex(index)}
                  </span>
                  <span className="archive-track-title">{project.title}</span>
                  <span className="archive-track-year font-data">
                    {project.year ?? "—"}
                  </span>
                  <span
                    className="archive-track-state font-data"
                    aria-hidden="true"
                  >
                    {active ? "ACTIVE" : "SELECT"}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </footer>
    </main>
  )
}
