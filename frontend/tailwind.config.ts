import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          500: '#10B981',
          700: '#047857',
          900: '#064E3B',
        },
        rose: {
          gold: '#E8A598',
        },
        cream: {
          soft: '#FAFAF8',
          warm: '#FDF6EC',
        },
        charcoal: {
          DEFAULT: '#1C1C1E',
          card: '#2C2C2E',
        },
      },
      backgroundImage: {
        'glossy-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        'emerald-gradient': 'linear-gradient(to bottom right, #10B981, #064E3B)',
      },
    },
  },
  plugins: [],
};
export default config;
