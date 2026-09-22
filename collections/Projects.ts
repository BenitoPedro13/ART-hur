import type { CollectionConfig } from 'payload'

import { slugField } from './fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'order', 'archived'],
    description:
      'Works on the public site. Save a project and it appears in the archive sequence unless Archived is checked.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return {
        archived: {
          equals: false,
        },
      }
    },
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'year',
      type: 'text',
      admin: {
        description: 'Shown under the title on the project card.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Thumbnail used in the folder window and as the video poster.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      admin: {
        description: 'Wistia, YouTube or Vimeo link. Leave blank to show the cover image instead.',
      },
    },
    {
      name: 'videoPlayback',
      type: 'select',
      defaultValue: 'normal',
      admin: {
        description:
          'Boomerang plays forward, then reverses back to the start and repeats — only works for a direct video file (.mp4, .webm, .mov), not a YouTube/Vimeo/Wistia link.',
        condition: (data) => Boolean(data?.videoUrl),
      },
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Boomerang (reverse loop)', value: 'boomerang' },
      ],
    },
    {
      name: 'meta',
      type: 'array',
      label: 'Credits',
      labels: {
        singular: 'Credit',
        plural: 'Credits',
      },
      admin: {
        description:
          'Shown as a single line under the title, e.g. Role · Direction, Client · Nike, Format · 4K.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '40%' },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'gallery',
      type: 'array',
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first in the home timeline and /index.',
      },
    },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Hidden from the public site (home, index, sitemap). The case study URL returns 404 while archived.',
      },
    },
  ],
}
