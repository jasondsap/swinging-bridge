import { Amplify } from 'aws-amplify';

/**
 * Configure Amplify for the browser/WebView client.
 *
 * This runs in three contexts:
 *   1. Web browser (real domain)
 *   2. Capacitor iOS WebView (capacitor://localhost)
 *   3. Capacitor Android WebView (https://localhost)
 *
 * The redirect URLs registered in your Cognito App Client must include
 * all three. See README "Cognito setup" for the full list.
 */

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

let configured = false;

export function configureAmplify(): void {
  if (configured) return;

  // Don't crash the app if Cognito env vars aren't set yet — let the user
  // see the rest of the app and fail explicitly only when they hit auth flows.
  if (!userPoolId || !userPoolClientId || !cognitoDomain) {
    console.warn(
      '[Cognito] Missing env vars — auth will be disabled. Set NEXT_PUBLIC_COGNITO_USER_POOL_ID, NEXT_PUBLIC_COGNITO_CLIENT_ID, NEXT_PUBLIC_COGNITO_DOMAIN.',
    );
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
          oauth: {
            domain: cognitoDomain,
            scopes: ['email', 'profile', 'openid'],
            redirectSignIn: [
              `${serverUrl}/auth/callback`,
              'capacitor://localhost/auth/callback', // iOS native shell
              'https://localhost/auth/callback', // Android native shell
            ],
            redirectSignOut: [
              `${serverUrl}/`,
              'capacitor://localhost/',
              'https://localhost/',
            ],
            responseType: 'code',
            providers: ['Apple', 'Google'],
          },
        },
      },
    },
  });

  configured = true;
}
