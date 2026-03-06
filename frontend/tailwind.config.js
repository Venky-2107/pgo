/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#a855f7",
        accent: "#22d3ee",
        background: "#030712",
        surface: "#111827",
        "surface-muted": "#1f2937",
        text: "#f9fafb",
        "text-muted": "#9ca3af",
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      borderRadius: {
        'lg': '20px',
        'xl': '32px',
      },
      animation: {
        'fade': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'primary-glow': '0 0 20px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}
