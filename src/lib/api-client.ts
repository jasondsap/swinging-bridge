import { getAccessToken } from './auth/cognito';

/**
 * Resolve the API base URL.
 * - Web: relative URLs (same origin as the page)
 * - Mobile (Capacitor): absolute URL to the deployed Vercel app, since
 *   window.location is the bundled app, not the API host.
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SERVER_URL || '';
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return '';
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Fetch wrapper that automatically:
 *   - Resolves base URL for web vs mobile
 *   - Attaches the Cognito access token (refreshed by Amplify if needed)
 *   - JSON-encodes the body and parses the response
 *   - Throws on non-2xx with a useful error
 */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || err.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
