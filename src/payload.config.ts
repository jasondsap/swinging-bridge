import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import { Bridges } from './collections/Bridges';
import { Categories } from './collections/Categories';
import { Favorites } from './collections/Favorites';
import { Itineraries } from './collections/Itineraries';
import { Media } from './collections/Media';
import { Places } from './collections/Places';
import { Users } from './collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Swinging Bridges Admin',
    },
  },
  collections: [
    Users,
    Bridges,
    Places,
    Categories,
    Media,
    Favorites,
    Itineraries,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI || '',
    },
  }),
  // CORS: allow the deployed web origin AND the Capacitor origins
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
  // Default to drafts being live in dev, manual publish in prod (configure per-collection)
  upload: {
    limits: {
      fileSize: 10_000_000, // 10MB
    },
  },
});
