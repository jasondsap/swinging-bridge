# Land of Swinging Bridges 🌉

Tourism mobile app for Clay County, Kentucky — built for the non-profit promoting the region's historic swinging bridges. One codebase deploys to **web, iOS, and Android**.

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  Single Next.js 15 app (deployed to Vercel)                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  (frontend)  │  │  (payload)   │  │  api/chat        │ │
│  │  Public app  │  │  CMS admin   │  │  Anthropic AI    │ │
│  │  — bridges   │  │  /admin      │  │  /api/chat       │ │
│  │  — places    │  │              │  │                  │ │
│  │  — chat      │  │              │  │                  │ │
│  │  — profile   │  │              │  │                  │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                  │                    │           │
│         └──────────┬───────┴──────────┬─────────┘          │
│                    ▼                  ▼                     │
│              ┌──────────────────────────────┐              │
│              │   Neon Postgres database     │              │
│              └──────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ HTTPS
            ┌─────────────┴─────────────┐
            │                           │
   ┌────────▼────────┐         ┌────────▼────────┐
   │  iOS app shell  │         │ Android shell   │
   │  (Capacitor)    │         │  (Capacitor)    │
   │                 │         │                 │
   │  + Geolocation  │         │  + Geolocation  │
   │  + Push notifs  │         │  + Push notifs  │
   │  + Offline cache│         │  + Offline cache│
   └─────────────────┘         └─────────────────┘
```

**Key idea:** the iOS and Android apps are Capacitor shells that load the live deployed Vercel URL in a WebView, plus add native features (GPS, push, offline storage). The same UI components serve all three platforms — no duplicate codebases.

---

## Stack

| Layer            | Choice                                        |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 15 (App Router)                       |
| Language         | TypeScript                                    |
| Styling          | Tailwind CSS 3                                |
| CMS              | Payload 3 (embedded, same Next.js app)        |
| Database         | Neon Postgres (via `@payloadcms/db-vercel-postgres`) |
| AI               | Anthropic Claude (streamed via API route)     |
| Native shell     | Capacitor 6                                   |
| Maps             | Leaflet + OpenStreetMap (free, no API key)    |
| **App-user auth**| **AWS Cognito** (email + Apple + Google)      |
| **CMS auth**     | **Payload built-in** (email/password for admins) |
| Hosting          | Vercel                                        |

---

## Getting started

### 1. Prerequisites

- Node.js **20.9+**
- A free **Neon** account (https://neon.tech) for Postgres
- An **Anthropic API key** (https://console.anthropic.com)
- For mobile builds later: Xcode (iOS) and/or Android Studio

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

You'll need at minimum:
- `DATABASE_URI` — pooled connection string from Neon
- `PAYLOAD_SECRET` — generate with `openssl rand -base64 32`
- `ANTHROPIC_API_KEY` — your Anthropic key
- `NEXT_PUBLIC_SERVER_URL` — `http://localhost:3000` for dev

### 4. Run the dev server

```bash
npm run dev
```

Open these:
- **Public app:** http://localhost:3000
- **Admin (CMS):** http://localhost:3000/admin — first visit will prompt you to create the first admin user
- **API health check:** http://localhost:3000/api/bridges (returns JSON)

### 5. Generate types from your collections

After any change to a collection schema:

```bash
npm run generate:types
```

This creates `src/payload-types.ts` with full TypeScript types for every collection — use them everywhere instead of `any`.

---

## Project structure

```
swinging-bridges/
├── public/                    Static assets (icons, manifest, images)
├── src/
│   ├── app/
│   │   ├── (frontend)/       Public-facing app (bridges, places, chat, etc.)
│   │   │   ├── layout.tsx    Tab bar + header
│   │   │   ├── page.tsx      Home
│   │   │   ├── bridges/      Bridge directory + details
│   │   │   ├── places/       Restaurants, lodging, attractions
│   │   │   ├── chat/         AI chatbot UI
│   │   │   ├── trip/         Saved itineraries
│   │   │   └── profile/      User account
│   │   ├── (payload)/        Payload CMS admin & REST API
│   │   ├── api/
│   │   │   ├── chat/         Streamed Anthropic chat endpoint
│   │   │   └── trip-plan/    AI-generated itinerary endpoint
│   │   └── layout.tsx        Root layout (shared by all)
│   ├── collections/          Payload CMS schemas
│   │   ├── Bridges.ts        ★ The seven swinging bridges + photograph-only
│   │   ├── Places.ts         Restaurants, hotels, attractions
│   │   ├── Categories.ts     Free-form tags
│   │   ├── Users.ts          Admin + visitor accounts
│   │   ├── Media.ts          Image uploads
│   │   ├── Favorites.ts      User-saved bridges/places
│   │   └── Itineraries.ts    Saved trip plans
│   ├── components/           Reusable UI (ui/, bridges/, auth/, etc.)
│   ├── lib/
│   │   ├── api-client.ts     Fetch wrapper for web + Capacitor
│   │   ├── capacitor.ts      Platform detection + native plugin wrappers
│   │   ├── utils.ts          cn(), formatPhone(), directionsUrl()
│   │   └── auth/             ★ Cognito + Payload auth integration
│   │       ├── cognito-config.ts   Amplify init for the browser
│   │       ├── cognito.ts          Client-side sign in / sign out / sessions
│   │       ├── verify.ts           Server-side JWT verification (aws-jwt-verify)
│   │       ├── resolve-user.ts     Cognito sub → Payload user (auto-provisions)
│   │       └── payload-strategy.ts Custom Payload auth strategy
│   ├── hooks/                Custom React hooks
│   ├── types/                Hand-written TS types
│   └── payload.config.ts     ★ Payload config (collections, db, etc.)
├── capacitor.config.ts        ★ iOS/Android wrapper config
├── next.config.mjs            Next.js config (Payload integration, CORS)
├── tailwind.config.ts         Brand colors (bridge.navy, bridge.sun, etc.)
└── tsconfig.json              Path aliases (@/*, @payload-config)
```

★ = the files you'll edit most often.

---

## Working with content

### Adding a new bridge

1. Go to http://localhost:3000/admin
2. Log in
3. Bridges → Create New
4. Fill in name, slug, location (lat/lng), directions, photos
5. Save and publish

The new bridge appears immediately in:
- The web app
- Both mobile apps (no rebuild needed — they call the same API)
- The AI chatbot's system prompt (it pulls live data on each request)

### Seeding the seven core bridges

The non-profit's printed guide already documents seven bridges with directions. Once we have access to photos, we'll either:
1. Bulk-import via a one-time seed script (`scripts/seed-bridges.ts`), or
2. Have the non-profit's content person enter them through the admin UI as the first content task.

I'd recommend option 2 — it teaches them the CMS at the same time.

---

## Deploying

### Web (Vercel)

```bash
# First time: link the project
npx vercel link

# Set production env vars
npx vercel env add DATABASE_URI
npx vercel env add PAYLOAD_SECRET
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add NEXT_PUBLIC_SERVER_URL

# Deploy
npx vercel --prod
```

### Mobile (after web is live)

```bash
# 1. Add the native platforms (one time)
npx cap add ios
npx cap add android

# 2. Update CAPACITOR_SERVER_URL in capacitor.config.ts to your Vercel URL

# 3. Sync the web build into the native projects
npm run cap:sync

# 4. Open in the native IDE to build/test/submit
npm run cap:ios       # opens Xcode
npm run cap:android   # opens Android Studio
```

#### App Store / Play Store notes

- **Apple "thin wrapper" rejection:** to pass review, the app uses Capacitor's Geolocation, Push Notifications, and Preferences (offline cache) plugins — making it genuinely native. Always submit with at least one bridge already cached for offline viewing demonstrated in the screenshot reel.
- **iOS Info.plist:** you'll need to manually add `NSLocationWhenInUseUsageDescription` ("Swinging Bridges uses your location to show nearby bridges"). Capacitor's CLI doesn't do this automatically.
- **Android adaptive icon:** generate via Android Studio's Image Asset wizard from `public/icons/icon-512.png`.

---

## Auth architecture

Two auth systems running side by side, each handling what it does best:

```
┌─────────────────────────────────┐    ┌────────────────────────────────┐
│  CMS Admins (content editors)   │    │  App Users (visitors)           │
│  ──────────────────────────     │    │  ──────────────────────────     │
│  Email + password               │    │  Email / Apple / Google         │
│  Login at /admin                │    │  Login at /login                │
│  Issued by Payload              │    │  Issued by Cognito              │
└──────────────┬──────────────────┘    └────────────────┬───────────────┘
               │                                          │
               │   Both populate req.user identically    │
               │                                          │
               ▼                                          ▼
        ┌─────────────────────────────────────────────────────┐
        │  Payload `users` collection (same row-level access) │
        │  — admin/editor/visitor roles                       │
        │  — Favorites and Itineraries scoped by req.user.id  │
        └─────────────────────────────────────────────────────┘
```

The trick: `src/lib/auth/payload-strategy.ts` registers a **custom Payload auth strategy** that validates Cognito JWTs on the `Authorization: Bearer ...` header. When a Cognito user hits any API route, the strategy:

1. Extracts the bearer token
2. Verifies it against Cognito's JWKS using `aws-jwt-verify`
3. Looks up the matching Payload `users` row by `cognitoSub` (auto-creating one on first login)
4. Populates `req.user` with the Payload user

Every collection's existing access rules (`req.user.id`, `req.user.role`, etc.) work unchanged for both auth paths.

---

## Cognito setup (one-time, in AWS Console)

### 1. Create the User Pool

- Region: pick whatever your other projects use (e.g., `us-east-1`)
- Sign-in options: **Email** (also enable Google + Apple as identity providers below)
- Required attributes: `email`, `name`
- MFA: **Off** (turn on later if needed; tourism apps don't need it for v1)
- Password policy: defaults are fine
- Account recovery: email only

### 2. Add identity providers

**Google** (15 min):
- In Google Cloud Console → APIs & Services → Credentials → Create OAuth Client ID (Web application)
- Authorized redirect URI: `https://YOUR_DOMAIN.auth.YOUR_REGION.amazoncognito.com/oauth2/idpresponse`
- Copy the Client ID + Secret into Cognito → Federation → Identity providers → Google
- Attribute mapping: `email → email`, `name → name`, `sub → username`

**Apple** (~1 hour, requires $99/yr Developer account):
- In Apple Developer → Identifiers → create a Services ID (e.g., `com.swingingbridges.signin`)
- Configure "Sign in with Apple" with the Cognito redirect URL above
- Create a Sign in with Apple private key, download the `.p8` file
- In Cognito → Federation → Identity providers → Apple, paste the Services ID, Team ID, Key ID, and the contents of the `.p8` file
- Attribute mapping: `email → email`, `name → name`, `sub → username`

### 3. Create an App Client

- Type: **Public client** (no secret — mobile apps can't keep secrets)
- Auth flows: enable `ALLOW_USER_SRP_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`
- Identity providers: check Cognito User Pool, Google, Apple
- Callback URLs (add ALL of these):
  - `http://localhost:3000/auth/callback` (dev)
  - `https://YOUR_VERCEL_DOMAIN/auth/callback` (production web)
  - `capacitor://localhost/auth/callback` (iOS native shell)
  - `https://localhost/auth/callback` (Android native shell)
- Sign-out URLs: same set, but pointing at `/` instead of `/auth/callback`
- OAuth scopes: `email`, `openid`, `profile`

### 4. Set up the Hosted UI domain

- User pool → App integration → Domain → Create a Cognito-managed domain
- Pick a prefix like `swingingbridges` → full domain becomes `swingingbridges.auth.us-east-1.amazoncognito.com`

### 5. Drop values into `.env.local`

```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=swingingbridges.auth.us-east-1.amazoncognito.com
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. Test the flow

- `npm run dev`
- Visit http://localhost:3000/login
- Click "Continue with Email" → register a new account → log in
- Visit `/admin` → notice you can NOT log into the CMS with a Cognito account (correct — Cognito is for visitors only)
- Create a separate admin user in Payload's admin signup flow

---

## Native social sign-in (deferred until App Store submission)

For the Vercel-deployed web build, Cognito's Hosted UI handles Apple and Google sign-in automatically. **For the iOS App Store specifically**, Apple's review team requires the *native* Sign in with Apple button (not a web pop-up) when other social providers are present. Same goes for the best UX with Google on Android.

The code in `src/lib/auth/cognito.ts` already detects the platform and routes to native plugins on iOS/Android — but you'll need to:

1. **iOS:**
   - Add the "Sign in with Apple" capability in Xcode
   - Set `NEXT_PUBLIC_APPLE_SERVICE_ID` to your Apple Services ID
   - Implement `/api/auth/federate/apple` (stub — exchanges Apple identity token for Cognito session via `InitiateAuth` with `CUSTOM_AUTH` flow)

2. **Android:**
   - Add the Google Services JSON file to `android/app/`
   - Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Implement `/api/auth/federate/google` (stub)

I left those federation endpoints as TODO stubs — they require account-side Cognito identity pool setup that's better done during the actual App Store submission sprint.



| Task                           | Command                                  |
| ------------------------------ | ---------------------------------------- |
| Run dev server                 | `npm run dev`                            |
| Build for production           | `npm run build`                          |
| Regenerate Payload TS types    | `npm run generate:types`                 |
| Sync web build to mobile       | `npm run cap:sync`                       |
| Open iOS project               | `npm run cap:ios`                        |
| Open Android project           | `npm run cap:android`                    |
| Lint                           | `npm run lint`                           |

---

## Roadmap (as of v1)

Confirmed for v1:
- [x] Project scaffold + CMS + auth + AI chat foundation
- [ ] Bridge directory + interactive map (Leaflet)
- [ ] Place directory (restaurants, lodging, attractions)
- [ ] AI chatbot UI with streaming
- [ ] User accounts + favorites
- [ ] Saved itineraries
- [ ] Offline cache for bridge data (Capacitor Preferences)
- [ ] Push notifications (events, festivals)
- [ ] iOS + Android app store submissions

Future considerations:
- Audio guides (recorded local voices telling the history of each bridge)
- AR overlay showing the original 1800s salt works village
- Event calendar integration
- Multi-language support (Spanish at minimum)

---

## License & ownership

Code property of MADE180 Digital Solutions. Content property of 1 Clay County Inc.
See SOW for details.
