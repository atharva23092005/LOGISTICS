/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    container: { center: true, padding: '1rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        // ── Core background layers (CSS variable driven) ─────────────────
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        'surface-4': 'var(--color-surface-4)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',

        // ── Brand / semantic ─────────────────────────────────────────────
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          foreground: '#FFFFFF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: {
          DEFAULT: '#059669',
          hover: '#047857',
          foreground: '#FFFFFF',
          muted: 'var(--color-success-muted)',
        },
        warning: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          foreground: '#FFFFFF',
          muted: 'var(--color-warning-muted)',
        },
        danger: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          foreground: '#FFFFFF',
          muted: 'var(--color-danger-muted)',
        },
        info: {
          DEFAULT: '#0891B2',
          hover: '#0E7490',
          foreground: '#FFFFFF',
          muted: 'var(--color-info-muted)',
        },
        accent: {
          DEFAULT: '#7C3AED',
          foreground: '#FFFFFF',
        },

        // ── Text ─────────────────────────────────────────────────────────
        text: {
          DEFAULT: 'var(--color-text)',
          bright: 'var(--color-text-bright)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          dim: 'var(--color-text-dim)',
        },

        // ── shadcn compat aliases ────────────────────────────────────────
        foreground: 'var(--color-text)',
        card: { DEFAULT: 'var(--color-surface)', foreground: 'var(--color-text)' },
        popover: { DEFAULT: 'var(--color-surface)', foreground: 'var(--color-text)' },
        secondary: { DEFAULT: 'var(--color-surface-2)', foreground: 'var(--color-text-muted)' },
        muted: { DEFAULT: 'var(--color-surface)', foreground: 'var(--color-text-muted)' },
        destructive: { DEFAULT: '#DC2626', foreground: '#FFFFFF' },
        input: 'var(--color-border)',
        ring: '#2563EB',

        // ── Landing page theme-aware surfaces ───────────────────────────
        landing: {
          bg: 'var(--landing-bg)',
          'bg-alt': 'var(--landing-bg-alt)',
          surface: 'var(--landing-surface)',
          'surface-deep': 'var(--landing-surface-deep)',
          border: 'var(--landing-border)',
          'border-subtle': 'var(--landing-border-subtle)',
          heading: 'var(--landing-text-heading)',
          footer: 'var(--landing-footer-bg)',
        },
      },

      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full: '9999px',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
      },

      boxShadow: {
        'glow-primary': 'var(--shadow-glow)',
        'glow-success': 'var(--shadow-glow)',
        'glow-danger': 'var(--shadow-glow)',
        'glow-warning': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'modal': 'var(--shadow-modal)',
        'dropdown': 'var(--shadow-dropdown)',
        'inner-top': 'var(--shadow-inner-top)',
      },

      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        sidebar: '14rem',
        'sidebar-sm': '3.5rem',
        topbar: '3.5rem',
      },

      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'slide-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { transform: 'scale(0.97)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
