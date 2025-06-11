// tailwind.config.js
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                fadeIn: 'fadeIn 0.2s ease-in-out',
                slideIn: 'slideIn 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-20px) scale(0.95)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0) scale(1)',
                    },
                },
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}
