/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        primary: { DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "rgb(var(--muted-rgb) / <alpha-value>)", foreground: "rgb(var(--foreground-rgb) / <alpha-value>)" },
        destructive: { DEFAULT: "#ef4444", foreground: "#ffffff" },
        muted: { DEFAULT: "rgb(var(--muted-rgb) / <alpha-value>)", foreground: "rgb(var(--muted-foreground-rgb) / <alpha-value>)" },
        accent: { DEFAULT: "rgb(var(--gold-rgb) / <alpha-value>)", foreground: "var(--accent-foreground)" },
        popover: { DEFAULT: "rgb(var(--card-rgb) / <alpha-value>)", foreground: "rgb(var(--foreground-rgb) / <alpha-value>)" },
        card: { DEFAULT: "rgb(var(--card-rgb) / <alpha-value>)", foreground: "rgb(var(--foreground-rgb) / <alpha-value>)" },
        gold: {
          DEFAULT: "rgb(var(--gold-rgb) / <alpha-value>)",
          light: "rgb(var(--gold-light-rgb) / <alpha-value>)",
          dark: "rgb(var(--gold-dark-rgb) / <alpha-value>)",
        },
        blue: {
          DEFAULT: "#0066CC",
          light: "#3399FF",
          dark: "#004C99",
        },
        dark: {
          DEFAULT: "#0a0a0a",
          gray: "#1a1a1a",
          light: "#2a2a2a",
        },
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        alexandria: ['Alexandria', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        gold: "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-lg": "0 0 40px rgba(212, 175, 55, 0.4)",
        "gold-xl": "0 0 60px rgba(212, 175, 55, 0.5)",
        blue: "0 0 20px rgba(0, 102, 204, 0.3)",
        "blue-lg": "0 0 40px rgba(0, 102, 204, 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 175, 55, 0.6)" },
        },
        "glow-text": {
          "0%, 100%": { textShadow: "0 0 20px rgba(212, 175, 55, 0.5)" },
          "50%": { textShadow: "0 0 40px rgba(212, 175, 55, 0.8)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "pulse-gold": "pulse-gold 3s ease-in-out infinite",
        "glow-text": "glow-text 4s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
