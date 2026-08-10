import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Category colors
        'category-study': '#2563eb',
        'category-exercise': '#16a34a',
        'category-personal': '#ea580c',
        'category-spaces': '#7c3aed',
        'category-rating': '#f59e0b',
        
        // Dark mode category colors
        'category-study-dark': '#3b82f6',
        'category-exercise-dark': '#22c55e',
        'category-personal-dark': '#f97316',
        'category-spaces-dark': '#a78bfa',

        // Runtime accent, written per route onto the document root.
        // Marks only: hover fills, active dots, title rules.
        accent: 'var(--header-accent)',
        'section-accent': 'var(--section-accent)',
        'accent-ink': 'var(--accent-ink)',

        // Surfaces are translucent white so they tint *with* the section band
        // instead of sitting on top of it. Never make these opaque.
        'surface-primary': 'rgb(255 255 255 / 0.5)',
        'surface-secondary': 'rgb(255 255 255 / 0.35)',
        'surface-tertiary': 'rgb(255 255 255 / 0.2)',

        'surface-primary-dark': 'rgb(255 255 255 / 0.04)',
        'surface-secondary-dark': 'rgb(255 255 255 / 0.07)',
        'surface-tertiary-dark': 'rgb(255 255 255 / 0.1)',

        // Ink carries hierarchy, colour carries location: text never uses accents.
        'content-primary': '#111111',
        'content-secondary': '#4b4b4b',
        'content-tertiary': '#6b6b63',

        'content-primary-dark': '#f1efe8',
        'content-secondary-dark': '#a8a49b',
        'content-tertiary-dark': '#86837b',

        // Hairlines are alphas, never solids: a fixed grey goes muddy on coral
        // and disappears on yellow.
        'border-light': 'rgb(0 0 0 / 0.06)',
        'border-medium': 'rgb(0 0 0 / 0.12)',

        'border-light-dark': 'rgb(255 255 255 / 0.1)',
        'border-medium-dark': 'rgb(255 255 255 / 0.18)',
      },
      borderRadius: {
        DEFAULT: '0',
        'none': '0',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'base': ['14px', { lineHeight: '1.5' }],
        'lg': ['15px', { lineHeight: '1.5' }],
        'xl': ['16px', { lineHeight: '1.5' }],
        '2xl': ['18px', { lineHeight: '1.5' }],
        '3xl': ['20px', { lineHeight: '1.5' }],
        '4xl': ['24px', { lineHeight: '1.5' }],
        '5xl': ['28px', { lineHeight: '1.5' }],
        '6xl': ['32px', { lineHeight: '1.5' }],
      },
      fontWeight: {
        '400': '400',
        '600': '600',
        '700': '700',
      },
    },
  },
  plugins: [],
};

export default config;
