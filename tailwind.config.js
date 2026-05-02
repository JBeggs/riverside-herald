/** @type {import('tailwindcss').Config} */

const rgbVar = (name) => `rgb(var(${name}) / <alpha-value>)`

module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-heading)', 'Georgia', 'serif'],
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        playfair: ['var(--font-heading)', 'Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        bg: rgbVar('--color-bg'),
        surface: rgbVar('--color-surface'),
        'surface-raised': rgbVar('--color-surface-raised'),
        primary: {
          DEFAULT: rgbVar('--color-primary'),
          hover: rgbVar('--color-primary-hover'),
        },
        secondary: rgbVar('--color-secondary'),
        accent: rgbVar('--color-accent'),
        danger: rgbVar('--color-danger'),
        'on-accent': rgbVar('--color-on-accent'),
        'border-default': rgbVar('--color-border'),
        ring: rgbVar('--color-ring'),
        text: {
          DEFAULT: rgbVar('--color-text'),
          light: rgbVar('--color-text-muted'),
          muted: rgbVar('--color-text-muted'),
        },
        neutral: {
          50: rgbVar('--color-neutral-50'),
          100: rgbVar('--color-neutral-100'),
          200: rgbVar('--color-neutral-200'),
          300: rgbVar('--color-neutral-300'),
          400: rgbVar('--color-neutral-400'),
          500: rgbVar('--color-neutral-500'),
          600: rgbVar('--color-neutral-600'),
          700: rgbVar('--color-neutral-700'),
          800: rgbVar('--color-neutral-800'),
          900: rgbVar('--color-neutral-900'),
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
