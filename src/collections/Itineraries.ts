import type { CollectionConfig } from 'payload';

export const Itineraries: CollectionConfig = {
  slug: 'itineraries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'source', 'updatedAt'],
    description: 'Saved trip plans, either user-created or AI-generated.',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return {
        or: [
          { user: { equals: req.user.id } },
          { isPublic: { equals: true } },
        ],
      };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      return { user: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      return { user: { equals: req.user.id } };
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create' && req.user && !data.user) {
          return { ...data, user: req.user.id };
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short summary shown in lists.' },
    },
    {
      name: 'narrative',
      type: 'textarea',
      admin: {
        description:
          'Full markdown text — used for AI-generated itineraries that have prose but no structured stops.',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'user',
      options: [
        { label: 'User Created', value: 'user' },
        { label: 'AI Generated', value: 'ai' },
        { label: 'Curated by Staff', value: 'curated' },
      ],
    },
    {
      name: 'stops',
      type: 'array',
      labels: { singular: 'Stop', plural: 'Stops' },
      admin: {
        description:
          "Optional structured stops. AI-generated trips may not have these — they store the trip in `narrative` instead.",
      },
      fields: [
        {
          name: 'order',
          type: 'number',
          required: true,
        },
        {
          name: 'stopType',
          type: 'select',
          required: true,
          options: [
            { label: 'Bridge', value: 'bridge' },
            { label: 'Place', value: 'place' },
            { label: 'Custom Note', value: 'custom' },
          ],
        },
        {
          name: 'bridge',
          type: 'relationship',
          relationTo: 'bridges',
          admin: { condition: (_, sib) => sib?.stopType === 'bridge' },
        },
        {
          name: 'place',
          type: 'relationship',
          relationTo: 'places',
          admin: { condition: (_, sib) => sib?.stopType === 'place' },
        },
        {
          name: 'customNote',
          type: 'textarea',
          admin: { condition: (_, sib) => sib?.stopType === 'custom' },
        },
        { name: 'estimatedTime', type: 'text', admin: { description: 'e.g., "30 min", "1 hr"' } },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Allow other users to view this itinerary.' },
    },
  ],
};
