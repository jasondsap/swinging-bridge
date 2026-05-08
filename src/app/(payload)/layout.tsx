/* Payload 3.84 admin layout. */
import config from '@payload-config';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import type { ServerFunctionClient } from 'payload';

import { importMap } from './admin/importMap.js';

// IMPORTANT: this import is what brings Payload's admin CSS into the
// bundle. Without it, the admin renders unstyled — components mount,
// links work, but no chrome/sidebar/buttons styling. Recent Payload
// scaffolders add this automatically; older ones don't.
import '@payloadcms/next/css';

import './custom.scss';

// Server function bridge — Payload's admin UI calls this to invoke
// server-side actions (collection lookups, mutations, etc).
const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
