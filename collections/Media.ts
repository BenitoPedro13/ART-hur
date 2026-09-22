import type { CollectionConfig } from 'payload'

/** WebP output for Sharp `toFormat`; keeps uploads smaller without visible loss on screen. */
const webp = (quality: number) =>
  ({
    format: 'webp',
    options: { quality, effort: 4 },
  }) as const

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    /**
     * Cap very large camera exports; the public site reads `hero` (1920px) first.
     * `withoutEnlargement` keeps smaller assets from being upscaled.
     */
    resizeOptions: {
      width: 4096,
      withoutEnlargement: true,
    },
    formatOptions: webp(84),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        position: 'centre',
        formatOptions: webp(76),
      },
      {
        name: 'card',
        width: 900,
        position: 'centre',
        formatOptions: webp(80),
      },
      {
        name: 'hero',
        width: 1920,
        position: 'centre',
        formatOptions: webp(84),
      },
    ],
  },
}
