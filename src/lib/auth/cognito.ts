/**
 * Client-side Cognito auth wrapper.
 *
 * Handles three flows:
 *   1. Email + password — works the same on web and native
 *   2. Social login (Apple/Google) on WEB — uses Cognito Hosted UI redirect
 *   3. Social login on NATIVE — uses native plugins (Sign in with Apple,
 *      Google Sign-In) for the proper App Store experience, then federates
 *      the resulting credential to Cognito.
 *
 * Why the split for native social login?
 *   Apple's App Store review requires a native Sign in with Apple button
 *   (not a web pop-up) when other social providers are offered. Same UX
 *   benefit on Android with the native Google Sign-In sheet.
 */

import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  signInWithRedirect,
  fetchAuthSession,
  getCurrentUser,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  type AuthUser,
} from 'aws-amplify/auth';

import { configureAmplify } from './cognito-config';
import { isNative, getPlatform } from '../capacitor';

// Lazy-init Amplify on first use
function ensureConfigured() {
  if (typeof window === 'undefined') return;
  configureAmplify();
}

// ---------------------------------------------------------------
// Email + password
// ---------------------------------------------------------------

export async function signUpWithEmail(args: {
  email: string;
  password: string;
  name: string;
}) {
  ensureConfigured();
  const result = await amplifySignUp({
    username: args.email,
    password: args.password,
    options: {
      userAttributes: {
        email: args.email,
        name: args.name,
      },
    },
  });
  return result;
}

export async function confirmSignUpCode(email: string, code: string) {
  ensureConfigured();
  return confirmSignUp({ username: email, confirmationCode: code });
}

export async function resendCode(email: string) {
  ensureConfigured();
  return resendSignUpCode({ username: email });
}

export async function signInWithEmail(email: string, password: string) {
  ensureConfigured();
  return amplifySignIn({ username: email, password });
}

export async function requestPasswordReset(email: string) {
  ensureConfigured();
  return resetPassword({ username: email });
}

export async function confirmPasswordReset(args: {
  email: string;
  code: string;
  newPassword: string;
}) {
  ensureConfigured();
  return confirmResetPassword({
    username: args.email,
    confirmationCode: args.code,
    newPassword: args.newPassword,
  });
}

// ---------------------------------------------------------------
// Social login
// ---------------------------------------------------------------

export async function signInWithApple(): Promise<void> {
  ensureConfigured();

  if (isNative() && getPlatform() === 'ios') {
    // Native Sign in with Apple — required for App Store review.
    //
    // STUBBED: not wired up yet. Before the iOS build sprint:
    //   1. npm install @capacitor-community/apple-sign-in
    //   2. Restore the implementation below (currently commented out)
    //   3. Implement /api/auth/federate/apple to exchange identityToken
    //      for a Cognito session via the SDK's `signIn` with custom auth flow.
    //
    // Reference implementation:
    // const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
    // const result = await SignInWithApple.authorize({
    //   clientId: process.env.NEXT_PUBLIC_APPLE_SERVICE_ID || '',
    //   redirectURI: `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/callback/apple`,
    //   scopes: 'email name',
    //   state: cryptoRandomState(),
    // });
    // const res = await fetch('/api/auth/federate/apple', { ... });
    // if (!res.ok) throw new Error('Apple federation failed');
    // return;

    throw new Error(
      'Native Apple Sign-In is not yet wired up. See cognito.ts for the TODO.',
    );
  }

  // Web (or Android — Apple sign-in is iOS-native only) → Hosted UI redirect
  return signInWithRedirect({ provider: 'Apple' });
}

export async function signInWithGoogle(): Promise<void> {
  ensureConfigured();

  if (isNative() && getPlatform() === 'android') {
    // Native Google Sign-In — better UX than browser redirect on Android.
    //
    // STUBBED: not wired up yet. Before the Android build sprint:
    //   1. npm install @codetrix-studio/capacitor-google-auth
    //   2. Restore the implementation below (currently commented out)
    //   3. Implement /api/auth/federate/google to exchange idToken
    //      for a Cognito session.
    //
    // Reference implementation:
    // const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
    // await GoogleAuth.initialize({
    //   clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    //   scopes: ['profile', 'email'],
    // });
    // const user = await GoogleAuth.signIn();
    // const res = await fetch('/api/auth/federate/google', { ... });
    // if (!res.ok) throw new Error('Google federation failed');
    // return;

    throw new Error(
      'Native Google Sign-In is not yet wired up. See cognito.ts for the TODO.',
    );
  }

  return signInWithRedirect({ provider: 'Google' });
}

// ---------------------------------------------------------------
// Session
// ---------------------------------------------------------------

export async function signOut(): Promise<void> {
  ensureConfigured();
  await amplifySignOut();
}

export async function getCurrentSession(): Promise<{
  user: AuthUser;
  accessToken: string;
  idToken: string;
} | null> {
  ensureConfigured();
  try {
    const [user, session] = await Promise.all([getCurrentUser(), fetchAuthSession()]);
    const accessToken = session.tokens?.accessToken?.toString();
    const idToken = session.tokens?.idToken?.toString();
    if (!accessToken || !idToken) return null;
    return { user, accessToken, idToken };
  } catch {
    return null; // not signed in
  }
}

/**
 * Get just the access token, refreshed if needed.
 * The api-client uses this for every authenticated request.
 */
export async function getAccessToken(): Promise<string | null> {
  ensureConfigured();
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function cryptoRandomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
