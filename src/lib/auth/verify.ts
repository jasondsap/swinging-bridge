/**
 * Server-side JWT verification.
 *
 * Uses `aws-jwt-verify` — a small, focused library from AWS Labs that
 * validates Cognito tokens against the User Pool's JWKS (public keys),
 * checks the signature, expiry, audience, and issuer.
 *
 * The JWKS is cached in memory for the lifetime of the function instance,
 * so we're not hitting AWS on every API request.
 */

import { CognitoJwtVerifier } from 'aws-jwt-verify';

const userPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

if (!userPoolId || !clientId) {
  console.warn('[Cognito] Server env vars missing — JWT verification will fail. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID.');
}

/**
 * Cached verifier — building it is expensive (fetches JWKS from AWS),
 * so we do it once per cold start.
 */
let cachedVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!cachedVerifier) {
    cachedVerifier = CognitoJwtVerifier.create({
      userPoolId: userPoolId!,
      tokenUse: 'access',
      clientId: clientId!,
    });
  }
  return cachedVerifier;
}

export interface VerifiedClaims {
  sub: string; // Cognito user ID — stable across logins
  username: string; // Cognito username (often equals sub for federated users)
  email?: string;
  scope?: string;
  exp: number;
  iat: number;
  // ...other Cognito claims
}

/**
 * Verify a Cognito access token. Returns the claims if valid.
 * Throws if the token is invalid, expired, wrong audience, etc.
 */
export async function verifyCognitoToken(token: string): Promise<VerifiedClaims> {
  const verifier = getVerifier();
  const payload = await verifier.verify(token);
  return payload as unknown as VerifiedClaims;
}

/**
 * Extract the bearer token from an Authorization header.
 * Supports both "Bearer xxx" and "JWT xxx" prefixes.
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^(?:Bearer|JWT)\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Convenience: verify the token from an incoming Request's Authorization header.
 * Returns null on any failure (no header, bad token, expired, etc.).
 */
export async function verifyRequest(req: Request): Promise<VerifiedClaims | null> {
  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) return null;
    return await verifyCognitoToken(token);
  } catch {
    return null;
  }
}
