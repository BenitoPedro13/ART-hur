/**
 * ART'hur starter seed.
 *
 *   pnpm seed
 *
 * Safe to re-run: everything is upserted by slug. Replace it from /admin once
 * Arthur's real projects, credits, media, and contact links are confirmed.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import {
  placeholderImage,
  pick,
  removeSeedSet,
  richText,
  upsertBySlug,
  upsertSite,
} from './lib/seed-helpers'
import { DEMO_SET } from './lib/seed-sets'

const t = {
  work: { pt: 'Trabalhos selecionados', en: 'Selected work' },
  about: { pt: 'arthur_notas.txt', en: 'arthur_notes.txt' },
  photo: { pt: 'retrato_fragmento.png', en: 'portrait_fragment.png' },
  home: { pt: 'Arquivo', en: 'Archive' },
  index: { pt: 'Índice', en: 'Index' },
  aboutNav: { pt: 'Sobre', en: 'About' },
  start: { pt: 'Entrar no arquivo', en: 'Enter the archive' },
  contact: { pt: 'Contacto', en: 'Contact' },
  email: { pt: 'Email', en: 'Email' },
  quickReply: { pt: 'Resposta direta', en: 'Direct reply' },
  references: { pt: 'Referências', en: 'References' },
  trash: { pt: 'Descartes', en: 'Cuts' },
  tagline: {
    pt: 'Selected work, unfinished thoughts, and things worth replaying.',
    en: 'Selected work, unfinished thoughts, and things worth replaying.',
  },
  description: {
    pt: 'ART’hur is Arthur’s living archive for visual identity, image, motion, and culture-led digital work.',
    en: 'ART’hur is Arthur’s living archive for visual identity, image, motion, and culture-led digital work.',
  },
  role: { pt: 'Função', en: 'Role' },
  format: { pt: 'Formato', en: 'Format' },
  status: { pt: 'Estado', en: 'Status' },
}

const OWNER = 'ART\'hur'
const FORMAL_NAME = 'Arthur'
const EMAIL = 'arthur@example.com'
const INSTAGRAM = 'https://instagram.com/'
const YOUTUBE = 'https://youtube.com/'
const TIKTOK = 'https://tiktok.com/'

const aboutBody = {
  pt: [
    { heading: 'Arthur compõe com cultura.' } as const,
    'Este texto é provisório até a bio final do Arthur estar confirmada. A direção visual já está definida: um arquivo vivo com ritmo, feito de frames, notas, marcas e trabalho selecionado.',
    'O site deve mostrar primeiro o ponto de vista, depois os detalhes: função, ano, colaboradores, contexto e contacto direto.',
    'Quando o conteúdo real entrar, substitui estas notas no Payload em Desktop items → arthur_notas.txt.',
  ],
  en: [
    { heading: 'Arthur composes with culture.' } as const,
    'This copy is provisional until Arthur’s final bio is confirmed. The visual direction is set: a living archive with rhythm, built from frames, notes, marks, and selected work.',
    'The site should make the point of view felt first, then reveal the details: role, year, collaborators, context, and a direct contact path.',
    'When real content arrives, replace these notes in Payload under Desktop items → arthur_notes.txt.',
  ],
}

const projects = [
  {
    slug: 'motion-notes',
    title: { pt: 'Motion Notes', en: 'Motion Notes' },
    year: '2026',
    from: '#0b0b0a',
    to: '#d83823',
    meta: [
      { label: t.role, value: { pt: 'Direção visual', en: 'Visual direction' } },
      { label: t.status, value: { pt: 'Placeholder', en: 'Placeholder' } },
    ],
    description: {
      pt: 'Espaço reservado para um projeto de imagem em movimento. Substituir por vídeo, stills, créditos e contexto real.',
      en: 'Reserved space for a motion-led project. Replace with real video, stills, credits, and context.',
    },
  },
  {
    slug: 'street-type-study',
    title: { pt: 'Street Type Study', en: 'Street Type Study' },
    year: '2026',
    from: '#15130f',
    to: '#e7c64a',
    meta: [
      { label: t.role, value: { pt: 'Identidade visual', en: 'Visual identity' } },
      { label: t.format, value: { pt: 'Poster / digital', en: 'Poster / digital' } },
    ],
    description: {
      pt: 'Um capítulo para tipografia, marca e cultura visual. O tratamento final deve usar marcas reais do Arthur, não uma fonte graffiti genérica.',
      en: 'A chapter for typography, identity, and visual culture. The final treatment should use Arthur’s own marks, not a generic graffiti font.',
    },
  },
  {
    slug: 'archive-system',
    title: { pt: 'Archive System', en: 'Archive System' },
    year: '2026',
    from: '#111217',
    to: '#4b61ff',
    meta: [
      { label: t.role, value: { pt: 'Digital / direção', en: 'Digital / direction' } },
      { label: t.status, value: { pt: 'Protótipo', en: 'Prototype' } },
    ],
    description: {
      pt: 'O capítulo que testa a experiência: arquivo, índice, contacto, media grande e navegação sem perder clareza.',
      en: 'The chapter that tests the experience: archive, index, contact, large media, and navigation without losing clarity.',
    },
  },
]

async function seed() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding ART\'hur starter content…')

  await removeSeedSet(payload, DEMO_SET)

  const background = await placeholderImage(payload, {
    filename: 'arthur-background.png',
    alt: { pt: 'Campo gráfico ART’hur', en: 'ART’hur graphic field' },
    width: 1920,
    height: 1080,
    from: '#0b0b0a',
    to: '#24120f',
  })

  const avatar = await placeholderImage(payload, {
    filename: 'arthur-avatar.png',
    alt: { pt: 'Retrato provisório de Arthur', en: 'Temporary portrait of Arthur' },
    width: 600,
    height: 600,
    from: '#141310',
    to: '#d83823',
  })

  const media = await Promise.all(
    projects.map(async (project) => ({
      cover: await placeholderImage(payload, {
        filename: `arthur-${project.slug}.png`,
        alt: project.title,
        from: project.from,
        to: project.to,
      }),
      gallery: await Promise.all(
        [1, 2].map((n) =>
          placeholderImage(payload, {
            filename: `arthur-${project.slug}-still-${n}.png`,
            alt: project.title,
            width: 1400,
            height: 900,
            from: project.to,
            to: project.from,
          })
        )
      ),
    }))
  )

  const projectIds: number[] = []

  for (const [index, project] of projects.entries()) {
    const id = await upsertBySlug(payload, 'projects', project.slug, (locale) => ({
      title: pick(project.title, locale),
      year: project.year,
      cover: media[index].cover.id,
      meta: project.meta.map((entry) => ({
        label: pick(entry.label, locale),
        value: pick(entry.value, locale),
      })),
      description: richText([pick(project.description, locale)]),
      gallery: media[index].gallery.map((image) => ({ image: image.id })),
      order: index,
    }))

    projectIds.push(id)
  }

  const workId = await upsertBySlug(payload, 'desktop-items', 'selected-work', (locale) => ({
    label: pick(t.work, locale),
    type: 'folder',
    icon: 'folder',
    iconColor: 'var(--primary)',
    placement: 'stack',
    order: 0,
    visible: true,
    projects: projectIds,
  }))

  const aboutId = await upsertBySlug(payload, 'desktop-items', 'about-arthur', (locale) => ({
    label: pick(t.about, locale),
    type: 'text',
    icon: 'file',
    iconColor: 'var(--accent)',
    placement: 'stack',
    order: 1,
    visible: true,
    showSocials: true,
    body: richText(pick(aboutBody, locale)),
  }))

  const photoId = await upsertBySlug(payload, 'desktop-items', 'portrait-fragment', (locale) => ({
    label: pick(t.photo, locale),
    type: 'image',
    icon: 'self',
    placement: 'free',
    x: 68,
    y: 38,
    order: 2,
    visible: true,
    image: avatar.id,
  }))

  await upsertSite(payload, (locale) => ({
    ownerName: OWNER,
    tagline: pick(t.tagline, locale),
    avatar: avatar.id,
    backgroundVideoUrl: '',
    backgroundPoster: background.id,
    menuBar: { showNav: true, showClock: true, showLanguageSwitcher: true },
    nav: [
      { label: pick(t.home, locale), action: 'home' },
      { label: pick(t.index, locale), action: 'openItem', item: workId },
      { label: pick(t.aboutNav, locale), action: 'openItem', item: aboutId },
    ],
    dock: [
      { label: pick(t.work, locale), icon: 'photos', action: 'openItem', item: workId },
      { label: pick(t.references, locale), icon: 'photos', action: 'openItem', item: photoId },
      { label: 'Instagram', icon: 'instagram', action: 'link', url: INSTAGRAM },
      { label: 'YouTube', icon: 'youtube', action: 'link', url: YOUTUBE },
      { label: 'TikTok', icon: 'tiktok', action: 'link', url: TIKTOK },
      { label: pick(t.email, locale), icon: 'mail', action: 'link', url: `mailto:${EMAIL}` },
      { label: pick(t.trash, locale), icon: 'trash', action: 'none', dividerBefore: true },
    ],
    lockScreen: {
      enabled: true,
      startLabel: pick(t.start, locale),
      showOncePerSession: true,
    },
    calendar: { enabled: false, highlightColor: '#d83823' },
    contact: {
      enabled: true,
      title: pick(t.contact, locale),
      rows: [
        {
          icon: 'mail',
          label: pick(t.email, locale),
          subtitle: EMAIL,
          href: `mailto:${EMAIL}`,
          tint: 'neutral',
        },
        {
          icon: 'instagram',
          label: 'Instagram',
          subtitle: pick(t.quickReply, locale),
          href: INSTAGRAM,
          tint: 'blue',
        },
      ],
    },
    socials: [
      { platform: 'instagram', url: INSTAGRAM },
      { platform: 'youtube', url: YOUTUBE },
      { platform: 'tiktok', url: TIKTOK },
      { platform: 'mail', url: `mailto:${EMAIL}` },
    ],
    seo: {
      siteTitle: `${OWNER} | ${FORMAL_NAME}`,
      siteDescription: pick(t.description, locale),
      ogImage: background.id,
    },
  }))

  payload.logger.info('ART\'hur starter content ready. Replace placeholders in /admin.')
  process.exit(0)
}

await seed()
