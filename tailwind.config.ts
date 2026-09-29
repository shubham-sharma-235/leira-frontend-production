import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                "card-foreground": "var(--card-foreground)",
                "muted-foreground": "var(--muted-foreground)",
                secondary: "var(--secondary)",
                "secondary-foreground": "var(--secondary-foreground)",
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                border: "var(--border)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
                muted: "var(--muted)",
                destructive: "var(--destructive)",
                "destructive-foreground": "var(--destructive-foreground)",
            },
        },
    },
    plugins: [],
};
export default config;
