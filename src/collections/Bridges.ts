import type { CollectionConfig } from 'payload';

export const Bridges: CollectionConfig = {
  slug: 'bridges',
  labels: {
    singular: 'Bridge',
    plural: 'Bridges',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'waterway', 'updatedAt'],
    description:
      "Clay County's swinging bridges. Both restored bridges open to visitors and historic photograph-only bridges.",
  },
  access: {
    // Anyone can read bridges (powers the public app + mobile)
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'e.g., "Jockey Street Bridge"' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL slug, e.g., "jockey-street"' },
    },
    {
      name: 'alternateName',
      type: 'text',
      admin: {
        description: 'Optional nickname, e.g., "The Bridge to our Future"',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'restored',
      options: [
        { label: 'Restored — Safe to Cross', value: 'restored' },
        { label: 'Photograph Only — Not Restored', value: 'photograph_only' },
        { label: 'Closed for Maintenance', value: 'closed' },
      ],
      admin: {
        description: 'Drives the safety badge shown in the app.',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 280,
      admin: {
        description: 'One-line teaser shown in list views.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Full description, history, anecdotes — shown on the detail page.',
      },
    },

    // -- Location ------------------------------------------------
    {
      type: 'group',
      name: 'location',
      label: 'Location',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number', required: true, admin: { width: '50%' } },
            { name: 'longitude', type: 'number', required: true, admin: { width: '50%' } },
          ],
        },
        {
          name: 'waterway',
          type: 'select',
          options: [
            { label: 'Goose Creek', value: 'goose_creek' },
            { label: 'Red Bird River', value: 'red_bird' },
            { label: 'South Fork of the Kentucky River', value: 'south_fork' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'nearestCommunity',
          type: 'text',
          admin: { description: 'e.g., "Manchester", "Oneida", "Big Creek"' },
        },
        {
          name: 'directions',
          type: 'textarea',
          admin: {
            description:
              'Driving directions from Clay County Police Dept / 911 Dispatch on the Square in downtown Manchester.',
          },
        },
      ],
    },

    // -- Specs ---------------------------------------------------
    {
      type: 'group',
      name: 'specs',
      label: 'Bridge Specifications',
      fields: [
        { name: 'lengthFeet', type: 'number', admin: { description: 'Approximate length in feet' } },
        { name: 'yearBuilt', type: 'number' },
        { name: 'yearRestored', type: 'number' },
        { name: 'maxOccupants', type: 'number', defaultValue: 4 },
        { name: 'maxWeightPounds', type: 'number', defaultValue: 800 },
      ],
    },

    // -- Media ---------------------------------------------------
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Featured photo for cards and detail page hero.' },
    },
    {
      name: 'gallery',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Gallery Photos' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },

    // -- Tags / categorization -----------------------------------
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Family Friendly', value: 'family_friendly' },
        { label: 'Easy Access', value: 'easy_access' },
        { label: 'Scenic Photography', value: 'scenic' },
        { label: 'Historic', value: 'historic' },
        { label: 'Tallest', value: 'tallest' },
        { label: 'Longest', value: 'longest' },
      ],
    },

    // -- Safety --------------------------------------------------
    {
      name: 'safetyNotes',
      type: 'textarea',
      defaultValue:
        'Cross at your own risk. No more than 4 people or 800 pounds total on the bridge at once. Do not bounce or jump. Each end of the bridge may sit on private property — please respect landowners and do not litter.',
    },
  ],
};
