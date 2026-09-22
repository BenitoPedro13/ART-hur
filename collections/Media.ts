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
     * No `formatOptions` or `resizeOptions` on the main file. With Blob
     * `clientUploads`, the browser stores the original as-is and Payload never
     * re-uploads the converted main file — yet it still renames the record to
     * `.webp`, so the stored URL points at a blob that does not exist. Only the
     * derivatives below are generated and uploaded server-side.
     */
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
