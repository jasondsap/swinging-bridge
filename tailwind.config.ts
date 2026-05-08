import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — Appalachian field-guide aesthetic
        bridge: {
          // Backgrounds
          paper: '#FAF6EE', // warm aged-paper background
          parchment: '#F2EBDC', // slightly deeper for cards
          ink: '#1A1A1A', // body ink (vs. pure black)

          // Primary navy from the Land of Swinging Bridges logo
          navy: '#1e3a5f',
          'navy-deep': '#15273f',

          // Sky tones
          sky: '#4a90c2',
          mist: '#a4c4dd',

          // Sun accent
          sun: '#f4c430',
          'sun-deep': '#d6a911',

          // Forest / sage greens
          forest: '#2d5f3f',
          sage: '#7ea487',

          // Earth tones
          timber: '#8b6f47',
          rust: '#a8472a',
          stone: '#9a937f',
        },
      },
      fontFamily: {
        // Fraunces: variable serif with optical sizing — perfect for bridge names.
        // Manrope: clean grotesque body that pairs with the serif.
        // (Loaded via next/font in app/layout.tsx)
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'small-caps': '0.12em',
      },
      // Mobile safe-area helpers
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        // Soft elevations that feel like paper, not screens
        paper: '0 1px 2px rgba(26,26,26,0.04), 0 4px 12px rgba(26,26,26,0.06)',
        'paper-hover': '0 2px 4px rgba(26,26,26,0.06), 0 8px 24px rgba(26,26,26,0.08)',
      },
      backgroundImage: {
        // Subtle paper grain — used as overlay on bg-bridge-paper
        'paper-grain':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.55 0 0 0 0 0.45 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'rotate(-12deg) scale(1.4)' },
          '60%': { opacity: '1', transform: 'rotate(-3deg) scale(0.95)' },
          '100%': { opacity: '1', transform: 'rotate(-3deg) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 400ms ease-out forwards',
        stamp: 'stamp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
