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

        // Surface colors (light mode)
        'surface-primary': '#ffffff',
        'surface-secondary': '#f9fafb',
        'surface-tertiary': '#f3f4f6',

        // Surface colors (dark mode)
        'surface-primary-dark': '#0f172a',
        'surface-secondary-dark': '#1e293b',
        'surface-tertiary-dark': '#334155',

        // Content colors (light mode)
        'content-primary': '#111827',
        'content-secondary': '#374151',
        'content-tertiary': '#6b7280',

        // Content colors (dark mode)
        'content-primary-dark': '#f1f5f9',
        'content-secondary-dark': '#cbd5e1',
        'content-tertiary-dark': '#94a3b8',

        // Border colors (light mode)
        'border-light': '#e5e7eb',
        'border-medium': '#d1d5db',

        // Border colors (dark mode)
        'border-light-dark': '#334155',
        'border-medium-dark': '#475569',
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
