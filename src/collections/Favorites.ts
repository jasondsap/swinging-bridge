import type { CollectionConfig } from 'payload';

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'targetType', 'updatedAt'],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { user: { equals: req.user.id } };
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
    // Auto-populate `user` from the authenticated request so clients
    // don't have to know their own Payload user id when creating favorites.
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
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'targetType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Bridge', value: 'bridge' },
        { label: 'Place', value: 'place' },
      ],
    },
    {
      name: 'bridge',
      type: 'relationship',
      relationTo: 'bridges',
      admin: {
        condition: (data) => data?.targetType === 'bridge',
      },
    },
    {
      name: 'place',
      type: 'relationship',
      relationTo: 'places',
      admin: {
        condition: (data) => data?.targetType === 'place',
      },
    },
  ],
};
