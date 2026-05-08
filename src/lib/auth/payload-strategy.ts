/**
 * Custom Payload auth strategy for Cognito.
 *
 * Registered alongside Payload's default email/password strategy. When a
 * request comes in with `Authorization: Bearer <cognito-jwt>`, Payload tries
 * each strategy in order — this one verifies the JWT, resolves the matching
 * Payload user, and populates `req.user` with it.
 *
 * The result: every collection's `access` rules using `req.user.id`,
 * `req.user.role`, etc., work identically whether the request came from:
 *   - An admin logged into the CMS (Payload session cookie / token)
 *   - An app user logged in via Cognito (Cognito access token)
 */

import type { AuthStrategy } from 'payload';

import { extractBearerToken, verifyCognitoToken } from './verify';
import { resolvePayloadUser } from './resolve-user';

export const cognitoStrategy: AuthStrategy = {
  name: 'cognito-jwt',
  authenticate: async ({ headers }) => {
    try {
      const token = extractBearerToken(headers.get('authorization'));
      if (!token) return { user: null };

      // Skip if this looks like a Payload-issued token (different shape).
      // Cognito tokens have "iss" matching cognito-idp.<region>.amazonaws.com.
      // The verifier will reject Payload tokens, so we just catch the error.

      const claims = await verifyCognitoToken(token);
      const user = await resolvePayloadUser(claims);

      return {
        user: {
          ...user,
          collection: 'users',
        },
      };
    } catch (err) {
      // Token invalid / expired / not a Cognito token → fall through
      // to the next strategy (Payload's built-in).
      return { user: null };
    }
  },
};
