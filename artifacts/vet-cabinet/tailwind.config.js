/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        dark: {
          950: '#040a04',
          900: '#060d06',
          850: '#0a160a',
          800: '#0a1a0a',
          750: '#0e1f0e',
          700: '#122612',
          600: '#1a351a',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        amber: {
          400: '#fbbf24',
          300: '#fcd34d',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-up': 'fadeInUp .55s both',
        'slide-left': 'slideInLeft .55s both',
        'scale-in': 'scaleIn .45s both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float-y': 'floatY 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
        ,fadeInUp: {'0%': { opacity:'0', transform:'translateY(14px)' }, '100%': { opacity:'1', transform:'translateY(0)' }}
        ,slideInLeft: {'0%': { opacity:'0', transform:'translateX(-18px)' }, '100%': { opacity:'1', transform:'translateX(0)' }}
        ,scaleIn: {'0%': { opacity:'0', transform:'scale(.96)' }, '100%': { opacity:'1', transform:'scale(1)' }}
        ,glowPulse: {'0%,100%': { boxShadow:'0 0 12px rgba(74,222,128,.12)' }, '50%': { boxShadow:'0 0 28px rgba(74,222,128,.28)' }}
        ,floatY: {'0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-5px)' }}
      }
    },
  },
  plugins: [],
}
