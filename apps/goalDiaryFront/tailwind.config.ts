import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		keyframes: {
  			'fade-in-up': {
  				'0%': { opacity: '0.4', transform: 'translateY(56px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'fade-in': {
  				'0%': { opacity: '0.4' },
  				'100%': { opacity: '1' },
  			},
  			'pop-in': {
  				'0%': { transform: 'scale(0.94)', opacity: '0.88' },
  				'65%': { transform: 'scale(1.04)' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			'slide-in-from-left': {
  				'0%': { opacity: '0.4', transform: 'translateX(-80px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'slide-in-from-right': {
  				'0%': { opacity: '0.4', transform: 'translateX(80px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'letter-drop': {
  				'0%': { opacity: '0', transform: 'translateY(-16px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  		},
  		animation: {
  			'fade-in-up': 'fade-in-up 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  			'fade-in': 'fade-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  			'pop-in': 'pop-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  			'slide-in-from-left': 'slide-in-from-left 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  			'slide-in-from-right': 'slide-in-from-right 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  			'letter-drop': 'letter-drop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
