import type { CollectionConfig } from 'payload';
import { cognitoStrategy } from '../lib/auth/payload-strategy';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'authSource'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    cookies: {
      sameSite: 'None',
      secure: true,
    },
    // Register the Cognito strategy alongside Payload's built-in.
    // Payload tries each in order — built-in handles email/password admin
    // logins; cognito-jwt handles app users with Bearer tokens.
    strategies: [cognitoStrategy],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { id: { equals: req.user.id } };
    },
    create: () => true,
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'visitor',
      options: [
        { label: 'Admin (CMS access)', value: 'admin' },
        { label: 'Editor (content only)', value: 'editor' },
        { label: 'Visitor (app user)', value: 'visitor' },
      ],
      access: {
        // Only admins can change roles — prevents Cognito visitors elevating themselves
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'authSource',
      type: 'select',
      required: true,
      defaultValue: 'payload',
      options: [
        { label: 'Payload (email/password)', value: 'payload' },
        { label: 'Cognito (federated)', value: 'cognito' },
      ],
      admin: {
        description: 'How this user authenticates. Cognito users have a placeholder password they never use.',
        readOnly: true,
      },
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'cognitoSub',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Cognito user ID (sub claim). Set automatically on first federated login.',
        readOnly: true,
        condition: (data) => data?.authSource === 'cognito',
      },
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'pushToken',
      type: 'text',
      admin: {
        description: 'Capacitor Push Notifications device token. Set automatically by mobile app.',
        readOnly: true,
      },
    },
  ],
};
