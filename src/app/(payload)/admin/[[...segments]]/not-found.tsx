/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD, then updated for
   Payload 3.84.x: the export name is generatePageMetadata, matching
   page.tsx — not generateMetadata as the auto-scaffold shipped. */
import config from '@payload-config';
import { generatePageMetadata, NotFoundPage } from '@payloadcms/next/views';
import { importMap } from '../importMap.js';

import type { Metadata } from 'next';

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, params, searchParams, importMap });

export default NotFound;
