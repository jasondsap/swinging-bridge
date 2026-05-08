import type { CollectionConfig } from 'payload';

export const Places: CollectionConfig = {
  slug: 'places',
  labels: {
    singular: 'Place',
    plural: 'Places',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'placeType', 'community', 'updatedAt'],
    description: 'Restaurants, lodging, attractions, and points of interest in Clay County.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },

    {
      name: 'placeType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Restaurant / Food', value: 'restaurant' },
        { label: 'Hotel / Motel', value: 'hotel' },
        { label: 'Short-Term Rental (Airbnb, VRBO)', value: 'rental' },
        { label: 'Campground', value: 'campground' },
        { label: 'Attraction', value: 'attraction' },
        { label: 'Outdoor / Recreation', value: 'outdoor' },
        { label: 'Museum / Historic Site', value: 'museum' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Service (gas, ATM, etc.)', value: 'service' },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 280,
    },
    { name: 'description', type: 'textarea' },

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
        { name: 'address', type: 'text' },
        { name: 'community', type: 'text', admin: { description: 'e.g., Manchester, Oneida' } },
      ],
    },

    // -- Contact -------------------------------------------------
    {
      type: 'group',
      name: 'contact',
      label: 'Contact',
      fields: [
        { name: 'phone', type: 'text' },
        { name: 'website', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'bookingUrl', type: 'text', admin: { description: 'Direct booking link (Airbnb, OpenTable, etc.)' } },
      ],
    },

    // -- Hours ---------------------------------------------------
    {
      name: 'hours',
      type: 'array',
      labels: { singular: 'Hours Entry', plural: 'Hours' },
      fields: [
        {
          name: 'day',
          type: 'select',
          options: [
            { label: 'Monday', value: 'mon' },
            { label: 'Tuesday', value: 'tue' },
            { label: 'Wednesday', value: 'wed' },
            { label: 'Thursday', value: 'thu' },
            { label: 'Friday', value: 'fri' },
            { label: 'Saturday', value: 'sat' },
            { label: 'Sunday', value: 'sun' },
          ],
          required: true,
        },
        { name: 'open', type: 'text', admin: { description: 'e.g., "9:00 AM"' } },
        { name: 'close', type: 'text' },
        { name: 'closed', type: 'checkbox', defaultValue: false },
      ],
    },

    // -- Pricing -------------------------------------------------
    {
      name: 'priceRange',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: '$', value: '1' },
        { label: '$$', value: '2' },
        { label: '$$$', value: '3' },
        { label: '$$$$', value: '4' },
      ],
    },

    // -- Media ---------------------------------------------------
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },

    // -- Related bridges ----------------------------------------
    {
      name: 'nearbyBridges',
      type: 'relationship',
      relationTo: 'bridges',
      hasMany: true,
      admin: {
        description: 'Bridges within reasonable driving distance — used by the trip planner.',
      },
    },

    // -- Featured flag for homepage rotation ---------------------
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
  ],
};
