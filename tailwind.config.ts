import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1320px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // Apple-inspired neutral palette
        ink: { DEFAULT: "#1D1D1F", soft: "#424245", muted: "#6E6E73", faint: "#86868B" },
        cloud: { DEFAULT: "#F5F5F7", 200: "#E8E8ED", 300: "#D2D2D7" },
        navy: { DEFAULT: "#1D1D1F", 900: "#1D1D1F", 800: "#1D1D1F", 700: "#424245" },   // legacy alias → ink
        electric: { DEFAULT: "#0071E3", 50: "#F0F6FF", 100: "#DCEBFF", 500: "#0071E3", 600: "#0062C4" },
        flame: { DEFAULT: "#E8590C", 50: "#FFF4ED", 500: "#E8590C", 600: "#C2410C" },     // sale badges only
        charcoal: { DEFAULT: "#1D1D1F" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"], display: ["var(--font-sans)", "system-ui", "sans-serif"] },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { "fade-up": "fade-up .9s cubic-bezier(.16,1,.3,1) both", "fade-in": "fade-in 1s ease both", "scale-in": "scale-in 1.1s cubic-bezier(.16,1,.3,1) both" },
      transitionTimingFunction: { apple: "cubic-bezier(.16,1,.3,1)" },
      boxShadow: {
        soft: "0 2px 8px rgb(0 0 0 / .04), 0 12px 40px -16px rgb(0 0 0 / .12)",
        card: "0 1px 2px rgb(0 0 0 / .03), 0 4px 16px rgb(0 0 0 / .04)",
        lift: "0 4px 12px rgb(0 0 0 / .05), 0 24px 48px -12px rgb(0 0 0 / .14)",
      },
      letterSpacing: { tightest: "-.035em", display: "-.025em" },
    },
  },
  plugins: [animate],
} satisfies Config;
