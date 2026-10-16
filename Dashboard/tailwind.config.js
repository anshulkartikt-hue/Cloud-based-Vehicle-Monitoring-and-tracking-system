const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: v('canvas'),
        surface: v('surface'),
        surface2: v('surface2'),
        line: v('line'),
        ink: v('ink'),
        muted: v('muted'),
        accent: v('accent'),
        'accent-ink': v('accent-ink'),
        ok: v('ok'),
        warn: v('warn'),
        danger: v('danger'),
        navy: { DEFAULT: '#0b1530', 900: '#070e22', 800: '#13204a', 700: '#1c2c5e' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px rgb(15 23 42 / 0.05)',
        lift: '0 2px 4px rgb(15 23 42 / 0.06), 0 16px 32px rgb(15 23 42 / 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
};
