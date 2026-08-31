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
        // ── Core background layers (CSS Variable RGB token driven) ─────────
        background: 'rgb(var(--background) / <alpha-value>)',
        surface:    'rgb(var(--surface) / <alpha-value>)',
        'surface-2':'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3':'rgb(var(--surface-3) / <alpha-value>)',
        'surface-4':'rgb(var(--surface-4) / <alpha-value>)',
        border:     'rgb(var(--border) / <alpha-value>)',
        'border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',

        // ── Brand / semantic (Clean & Minimal) ──────────────────────────────
        primary: {
          DEFAULT:    '#3B82F6',
          hover:      '#2563EB',
          foreground: '#FFFFFF',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: {
          DEFAULT:    '#10B981',
          hover:      '#059669',
          foreground: '#FFFFFF',
          muted:      'rgba(16,185,129,0.12)',
        },
        warning: {
          DEFAULT:    '#F59E0B',
          hover:      '#D97706',
          foreground: '#000000',
          muted:      'rgba(245,158,11,0.12)',
        },
        danger: {
          DEFAULT:    '#EF4444',
          hover:      '#DC2626',
          foreground: '#FFFFFF',
          muted:      'rgba(239,68,68,0.12)',
        },
        info: {
          DEFAULT:    '#06B6D4',
          hover:      '#0891B2',
          foreground: '#FFFFFF',
          muted:      'rgba(6,182,212,0.12)',
        },
        accent: {
          DEFAULT:    '#8B5CF6',
          foreground: '#FFFFFF',
        },

        // ── Landing redesign: topographic identity (additive, landing-only) ──
        spruce: {
          DEFAULT: '#0E5F54',
          700:     '#0B4C43',
          600:     '#0E5F54',
          500:     '#12897A',
          400:     '#3DB39E',
          300:     '#7CC9BC',
          100:     '#D3E5E0',
          wash:    '#E9F1EE',
        },
        paper: {
          DEFAULT: '#F4F6F4',
          deep:    '#EDF0EE',
          dark:    '#0A1A1E',
        },
        ink: {
          DEFAULT: '#0C1B22',
          900:     '#0A171D',
          800:     '#12252C',
          700:     '#1B333B',
        },

        // ── Landing page specific tokens ────────────────────────────────────
        'landing-bg': 'rgb(var(--background) / <alpha-value>)',
        'landing-bg-alt': 'rgb(var(--surface-2) / <alpha-value>)',
        'landing-surface': 'rgb(var(--surface) / <alpha-value>)',
        'landing-surface-deep': 'rgb(var(--background) / <alpha-value>)',
        'landing-border': 'rgb(var(--border) / <alpha-value>)',
        'landing-border-subtle': 'rgb(var(--border-subtle) / <alpha-value>)',
        'landing-heading': 'rgb(var(--text-bright) / <alpha-value>)',

        // ── Text ────────────────────────────────────────────────────────────
        text: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          bright:  'rgb(var(--text-bright) / <alpha-value>)',
          muted:   'rgb(var(--text-muted) / <alpha-value>)',
          subtle:  'rgb(var(--text-subtle) / <alpha-value>)',
          dim:     'rgb(var(--text-dim) / <alpha-value>)',
        },

        // ── shadcn compat aliases ────────────────────────────────────────────
        foreground:  'rgb(var(--text) / <alpha-value>)',
        card:        { DEFAULT: 'rgb(var(--surface) / <alpha-value>)', foreground: 'rgb(var(--text) / <alpha-value>)' },
        popover:     { DEFAULT: 'rgb(var(--surface) / <alpha-value>)', foreground: 'rgb(var(--text) / <alpha-value>)' },
        secondary:   { DEFAULT: 'rgb(var(--surface-2) / <alpha-value>)', foreground: 'rgb(var(--text-muted) / <alpha-value>)' },
        muted:       { DEFAULT: 'rgb(var(--surface-2) / <alpha-value>)', foreground: 'rgb(var(--text-muted) / <alpha-value>)' },
        destructive: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        input:       'rgb(var(--border) / <alpha-value>)',
        ring:        '#3B82F6',
      },

      borderRadius: {
        none: '0',
        sm:   '0.25rem',
        DEFAULT:'0.5rem',
        md:   '0.5rem',
        lg:   '0.75rem',
        xl:   '1rem',
        '2xl':'1.25rem',
        '3xl':'1.5rem',
        full: '9999px',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem'     }],
        sm:    ['0.8125rem',{ lineHeight: '1.25rem'  }],
        base:  ['0.875rem', { lineHeight: '1.375rem' }],
        lg:    ['1rem',     { lineHeight: '1.5rem'   }],
        xl:    ['1.125rem', { lineHeight: '1.75rem'  }],
        '2xl': ['1.25rem',  { lineHeight: '1.875rem' }],
        '3xl': ['1.5rem',   { lineHeight: '2rem'     }],
      },

      boxShadow: {
        // Minimal, subtle shadows (removed all eye-catching neon glows)
        'glow-primary': '0 1px 3px rgba(0,0,0,0.3)',
        'glow-success': '0 1px 3px rgba(0,0,0,0.3)',
        'glow-danger':  '0 1px 3px rgba(0,0,0,0.3)',
        'glow-warning': '0 1px 3px rgba(0,0,0,0.3)',
        'card':         '0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)',
        'card-hover':   '0 2px 8px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)',
        'modal':        '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
        'dropdown':     '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'inner-top':    'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      backgroundImage: {
        'active-item':  'rgba(59,130,246,0.12)',
        'page-header':  '#0D1626',
        'kpi-primary':  '#0D1626',
        'kpi-success':  '#0D1626',
        'kpi-warning':  '#0D1626',
        'kpi-danger':   '#0D1626',
        'kpi-info':     '#0D1626',
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
        'accordion-down':  { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':    { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'slide-up':        { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'slide-in-right':  { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left':   { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in':         { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in':        { from: { transform: 'scale(0.97)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'slide-up':       'slide-up 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-left':  'slide-in-left 0.25s ease-out',
        'fade-in':        'fade-in 0.15s ease-out',
        'scale-in':       'scale-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
