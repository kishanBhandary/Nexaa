/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Mobile-specific breakpoints
        'mobile-sm': {'max': '374px'},
        'mobile': {'max': '640px'},
        'tablet': {'min': '641px', 'max': '1024px'},
        // Touch device detection
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      },
      // Mobile-friendly spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '104': '26rem',
      },
      // Mobile-optimized typography
      fontSize: {
        'xs-mobile': ['0.75rem', {lineHeight: '1rem'}],
        'sm-mobile': ['0.875rem', {lineHeight: '1.25rem'}],
        'base-mobile': ['1rem', {lineHeight: '1.5rem'}],
        'lg-mobile': ['1.125rem', {lineHeight: '1.75rem'}],
        'xl-mobile': ['1.25rem', {lineHeight: '1.75rem'}],
        '2xl-mobile': ['1.5rem', {lineHeight: '2rem'}],
        '3xl-mobile': ['1.875rem', {lineHeight: '2.25rem'}],
        '4xl-mobile': ['2.25rem', {lineHeight: '2.5rem'}],
      },
      // Mobile-friendly colors
      colors: {
        // Add touch-friendly colors
        'touch-primary': '#3B82F6',
        'touch-secondary': '#6B7280',
        'touch-success': '#10B981',
        'touch-warning': '#F59E0B',
        'touch-danger': '#EF4444',
      },
      // Mobile-optimized shadows
      boxShadow: {
        'mobile': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'mobile-lg': '0 4px 16px rgba(0, 0, 0, 0.16)',
        'mobile-xl': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
      // Mobile animations
      animation: {
        'fade-in-mobile': 'fadeInMobile 0.3s ease-out',
        'slide-up-mobile': 'slideUpMobile 0.3s ease-out',
        'bounce-mobile': 'bounceMobile 0.5s ease-in-out',
      },
      keyframes: {
        fadeInMobile: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUpMobile: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceMobile: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      // Mobile-friendly z-index
      zIndex: {
        'mobile-nav': '1000',
        'mobile-modal': '1050',
        'mobile-tooltip': '1100',
      },
    },
  },
  plugins: [],
}