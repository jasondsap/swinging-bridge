/**
 * Bridge between Cognito-verified claims and Payload's user table.
 *
 * On first login from Cognito, we auto-create a matching Payload `users` row
 * keyed by `cognitoSub`. Subsequent requests look up the same row.
 *
 * This is what makes Payload's row-level access controls work the same way
 * for both admin-authenticated users and Cognito-authenticated app users.
 */

import { getPayload } from 'payload';
import config from '@payload-config';
import type { VerifiedClaims } from './verify';

export async function resolvePayloadUser(claims: VerifiedClaims) {
  const payload = await getPayload({ config });

  // Look up existing user by Cognito sub
  const existing = await payload.find({
    collection: 'users',
    where: { cognitoSub: { equals: claims.sub } },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    return existing.docs[0];
  }

  // First login — auto-provision a Payload user.
  // We store a random password they'll never use because Payload's auth
  // collection requires one. Real authentication happens via Cognito JWT.
  const randomPassword = generateRandomPassword();
  const email = claims.email || `${claims.sub}@cognito.local`;

  const created = await payload.create({
    collection: 'users',
    data: {
      email,
      password: randomPassword,
      cognitoSub: claims.sub,
      role: 'visitor',
      authSource: 'cognito',
    },
    overrideAccess: true, // bypass access controls — we're a trusted server context
  });

  return created;
}

function generateRandomPassword(): string {
  // 32 bytes of randomness, base64-encoded — well over Payload's min length
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return (
    'CognitoMgd!' +
    Array.from(bytes, (b) => b.toString(36)).join('').slice(0, 24)
  );
}
