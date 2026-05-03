/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0B3362', // Professional Navy Blue
                    hover: '#0A2A52',   // Darker Navy
                    light: '#1E4D8C',   // Lighter Navy
                    dark: '#071F3D',    // Very Dark Navy
                },
                secondary: {
                    DEFAULT: '#FFFFFF',   // White
                    hover: '#F8F9FA',     // Off-white
                },
                accent: '#0A192F',      // Navy Blue Accent
                'navy': '#0A192F',      // Dark Navy Blue

                // Neutrals
                dark: '#0A192F',        // Navy Blue (Primary Text)
                medium: '#6B7280',      // Gray (Secondary Text)
                light: '#FFFFFF',       // White Background
                white: '#FFFFFF',       // Pure White
                border: '#E5E7EB',      // Light Gray Border

                // Feedback
                success: '#10B981',     // Green
                warning: '#F59E0B',     // Yellow
                error: '#EF4444',       // Red
                info: '#3B82F6',        // Blue

                // Custom Backgrounds
                'bg-light': '#FFFFFF',       // White Background
                'bg-dark': '#F8F9FA',        // Light Gray
                'bg-card': '#FFFFFF',        // White Card
                'bg-card-hover': '#F8F9FA',  // Light Gray Hover
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
