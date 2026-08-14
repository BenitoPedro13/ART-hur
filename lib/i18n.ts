import { defaultLocale, isLocale, locales, type Locale } from './locales'

export { defaultLocale, isLocale, locales }
export type { Locale }

/** Display names for the language switcher; unlisted codes fall back to uppercase. */
const LOCALE_LABELS: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  nl: 'Nederlands',
}

export function localeLabel(locale: string): string {
  return LOCALE_LABELS[locale] ?? locale.toUpperCase()
}

export function localeShortLabel(locale: string): string {
  return locale.toUpperCase()
}

/**
 * Every user-visible string that is NOT editable in the CMS lives here.
 *
 * Anything an editor would plausibly want to change (names, labels, body copy,
 * button captions) belongs in Payload instead — see `globals/Site.ts`. What is
 * left is chrome: accessible labels, window controls, and error pages.
 *
 * `Dictionary` is declared up front on purpose: adding a key here is a type
 * error in every locale until it is translated, so nothing can be silently
 * left in English. Never inline a literal in a component — add it here first.
 */
export type Dictionary = {
  back: string
  close: string
  openMenu: string
  closeMenu: string
  menu: string
  language: string
  previous: string
  next: string
  desktop: string
  loading: string
  notFoundCode: string
  notFoundTitle: string
  notFoundAction: string
  /** Finder-style readout in the window title bar. */
  kindFolder: string
  kindText: string
  kindImage: string
  /** Pluralised item count; `{n}` is replaced with the number. */
  itemCountOne: string
  itemCountMany: string
  nowShowing: string
  /** Contact form field chrome; the heading/intro/options themselves are CMS copy. */
  formName: string
  formEmail: string
  formSubject: string
  formSubjectPlaceholder: string
  formMessage: string
  formSend: string
  formSending: string
  formError: string
  /** Global navigation. Uppercased in the shell, so store them in sentence case. */
  navArchive: string
  navIndex: string
  navAbout: string
  navContact: string
  /** Interior route slates and section headings. */
  indexLabel: string
  indexEmpty: string
  aboutLabel: string
  contactLabel: string
  workLabel: string
  credits: string
  context: string
  sequence: string
  /** `{n}` is the frame's position, `{of}` the total. */
  frameOf: string
  /** `{n}` gallery stills. Plural forms, like itemCount. */
  frameCountOne: string
  frameCountMany: string
  /** Slate terms. */
  year: string
  frames: string
  position: string
  nextProject: string
  backToIndex: string
  viewProject: string
  practice: string
  basedIn: string
  availability: string
  elsewhere: string
  /** Shown in place of a missing value rather than inventing one. */
  roleTbc: string
  yearTbc: string
  scrollExplore: string
  archiveInPreparation: string
  projectSequence: string
  primaryNavigation: string
  projects: string
}

const STRINGS: Record<string, Dictionary> = {
  en: {
    back: 'Back',
    close: 'Close',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    language: 'Language',
    previous: 'Previous',
    next: 'Next',
    desktop: 'Desktop',
    loading: 'Loading',
    notFoundCode: '404',
    notFoundTitle: 'This page doesn’t exist',
    notFoundAction: 'Back to the desktop',
    kindFolder: 'Folder',
    kindText: 'Text',
    kindImage: 'Image',
    itemCountOne: '{n} item',
    itemCountMany: '{n} items',
    nowShowing: 'Now showing',
    formName: 'Name',
    formEmail: 'Email',
    formSubject: 'Subject',
    formSubjectPlaceholder: 'Choose one',
    formMessage: 'Message',
    formSend: 'Send message',
    formSending: 'Sending…',
    formError: 'Something went wrong. Please try again, or email directly.',
    navArchive: 'Archive',
    navIndex: 'Index',
    navAbout: 'About',
    navContact: 'Contact',
    indexLabel: 'Index',
    indexEmpty: 'Archive in preparation',
    aboutLabel: 'About',
    contactLabel: 'Contact',
    workLabel: 'Work',
    credits: 'Credits',
    context: 'Context',
    sequence: 'Sequence',
    frameOf: 'Frame {n} of {of}',
    frameCountOne: '{n} frame',
    frameCountMany: '{n} frames',
    year: 'Year',
    frames: 'Frames',
    position: 'Position',
    nextProject: 'Next project',
    backToIndex: 'Back to index',
    viewProject: 'View project',
    practice: 'Practice',
    basedIn: 'Based in',
    availability: 'Availability',
    elsewhere: 'Elsewhere',
    roleTbc: 'Role to be confirmed',
    yearTbc: 'Year to be confirmed',
    scrollExplore: 'Scroll / explore',
    archiveInPreparation: 'Archive in preparation',
    projectSequence: 'Project timeline',
    primaryNavigation: 'Primary navigation',
    projects: 'Projects',
  },
  pt: {
    back: 'Voltar',
    close: 'Fechar',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    menu: 'Menu',
    language: 'Idioma',
    previous: 'Anterior',
    next: 'Seguinte',
    desktop: 'Ambiente de trabalho',
    loading: 'A carregar',
    notFoundCode: '404',
    notFoundTitle: 'Esta página não existe',
    notFoundAction: 'Voltar ao ambiente de trabalho',
    kindFolder: 'Pasta',
    kindText: 'Texto',
    kindImage: 'Imagem',
    itemCountOne: '{n} item',
    itemCountMany: '{n} itens',
    nowShowing: 'A mostrar',
    formName: 'Nome',
    formEmail: 'Email',
    formSubject: 'Assunto',
    formSubjectPlaceholder: 'Escolha uma opção',
    formMessage: 'Mensagem',
    formSend: 'Enviar mensagem',
    formSending: 'A enviar…',
    formError: 'Algo correu mal. Tente novamente ou envie um email diretamente.',
    navArchive: 'Arquivo',
    navIndex: 'Índice',
    navAbout: 'Sobre',
    navContact: 'Contacto',
    indexLabel: 'Índice',
    indexEmpty: 'Arquivo em preparação',
    aboutLabel: 'Sobre',
    contactLabel: 'Contacto',
    workLabel: 'Trabalho',
    credits: 'Créditos',
    context: 'Contexto',
    sequence: 'Sequência',
    frameOf: 'Frame {n} de {of}',
    frameCountOne: '{n} fotograma',
    frameCountMany: '{n} fotogramas',
    year: 'Ano',
    frames: 'Frames',
    position: 'Posição',
    nextProject: 'Próximo projeto',
    backToIndex: 'Voltar ao índice',
    viewProject: 'Ver projeto',
    practice: 'Prática',
    basedIn: 'Base',
    availability: 'Disponibilidade',
    elsewhere: 'Noutros sítios',
    roleTbc: 'Função a confirmar',
    yearTbc: 'Ano a confirmar',
    scrollExplore: 'Rolar / explorar',
    archiveInPreparation: 'Arquivo em preparação',
    projectSequence: 'Linha temporal de projetos',
    primaryNavigation: 'Navegação principal',
    projects: 'Projetos',
  },
  es: {
    back: 'Volver',
    close: 'Cerrar',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    menu: 'Menú',
    language: 'Idioma',
    previous: 'Anterior',
    next: 'Siguiente',
    desktop: 'Escritorio',
    loading: 'Cargando',
    notFoundCode: '404',
    notFoundTitle: 'Esta página no existe',
    notFoundAction: 'Volver al escritorio',
    kindFolder: 'Carpeta',
    kindText: 'Texto',
    kindImage: 'Imagen',
    itemCountOne: '{n} elemento',
    itemCountMany: '{n} elementos',
    nowShowing: 'Mostrando',
    formName: 'Nombre',
    formEmail: 'Email',
    formSubject: 'Asunto',
    formSubjectPlaceholder: 'Elige una opción',
    formMessage: 'Mensaje',
    formSend: 'Enviar mensaje',
    formSending: 'Enviando…',
    formError: 'Algo salió mal. Inténtalo de nuevo o escribe un email directamente.',
    navArchive: 'Archivo',
    navIndex: 'Índice',
    navAbout: 'Acerca de',
    navContact: 'Contacto',
    indexLabel: 'Índice',
    indexEmpty: 'Archivo en preparación',
    aboutLabel: 'Acerca de',
    contactLabel: 'Contacto',
    workLabel: 'Trabajo',
    credits: 'Créditos',
    context: 'Contexto',
    sequence: 'Secuencia',
    frameOf: 'Fotograma {n} de {of}',
    frameCountOne: '{n} image',
    frameCountMany: '{n} images',
    year: 'Año',
    frames: 'Fotogramas',
    position: 'Posición',
    nextProject: 'Siguiente proyecto',
    backToIndex: 'Volver al índice',
    viewProject: 'Ver proyecto',
    practice: 'Práctica',
    basedIn: 'Base',
    availability: 'Disponibilidad',
    elsewhere: 'En otros sitios',
    roleTbc: 'Función por confirmar',
    yearTbc: 'Año por confirmar',
    scrollExplore: 'Desplazar / explorar',
    archiveInPreparation: 'Archivo en preparación',
    projectSequence: 'Línea temporal de proyectos',
    primaryNavigation: 'Navegación principal',
    projects: 'Proyectos',
  },
  fr: {
    back: 'Retour',
    close: 'Fermer',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    menu: 'Menu',
    language: 'Langue',
    previous: 'Précédent',
    next: 'Suivant',
    desktop: 'Bureau',
    loading: 'Chargement',
    notFoundCode: '404',
    notFoundTitle: 'Cette page n’existe pas',
    notFoundAction: 'Retour au bureau',
    kindFolder: 'Dossier',
    kindText: 'Texte',
    kindImage: 'Image',
    itemCountOne: '{n} élément',
    itemCountMany: '{n} éléments',
    nowShowing: 'À l’affiche',
    formName: 'Nom',
    formEmail: 'Email',
    formSubject: 'Sujet',
    formSubjectPlaceholder: 'Choisissez une option',
    formMessage: 'Message',
    formSend: 'Envoyer le message',
    formSending: 'Envoi…',
    formError: 'Une erreur est survenue. Réessayez, ou écrivez un email directement.',
    navArchive: 'Archive',
    navIndex: 'Index',
    navAbout: 'À propos',
    navContact: 'Contact',
    indexLabel: 'Index',
    indexEmpty: 'Archive en préparation',
    aboutLabel: 'À propos',
    contactLabel: 'Contact',
    workLabel: 'Travail',
    credits: 'Générique',
    context: 'Contexte',
    sequence: 'Séquence',
    frameOf: 'Image {n} sur {of}',
    frameCountOne: '{n} image',
    frameCountMany: '{n} images',
    year: 'Année',
    frames: 'Images',
    position: 'Position',
    nextProject: 'Projet suivant',
    backToIndex: 'Retour à l’index',
    viewProject: 'Voir le projet',
    practice: 'Pratique',
    basedIn: 'Basé à',
    availability: 'Disponibilité',
    elsewhere: 'Ailleurs',
    roleTbc: 'Rôle à confirmer',
    yearTbc: 'Année à confirmer',
    scrollExplore: 'Défiler / explorer',
    archiveInPreparation: 'Archive en préparation',
    projectSequence: 'Chronologie des projets',
    primaryNavigation: 'Navigation principale',
    projects: 'Projets',
  },
}

export function getDictionary(locale: string): Dictionary {
  return STRINGS[locale] ?? STRINGS[defaultLocale] ?? STRINGS.en
}

/**
 * BCP 47 tag for `Intl`. Payload locale codes are plain languages, so region
 * hints are added where the difference is visible in date formatting.
 */
const INTL_TAGS: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
}

export function intlLocale(locale: string): string {
  return INTL_TAGS[locale] ?? locale
}

/** Fills `{n}` in a count string and picks the right plural form. */
export function formatCount(dictionary: Dictionary, n: number): string {
  const template = n === 1 ? dictionary.itemCountOne : dictionary.itemCountMany

  return template.replace('{n}', String(n))
}

/** Fills `{n}` and `{of}` in a position string such as `frameOf`. */
export function formatPosition(template: string, n: number, of: number): string {
  return template.replace('{n}', String(n)).replace('{of}', String(of))
}
