/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-dark': '#0d1117',
                'card-bg': '#161b22',
                'text-primary': '#c9d1d9',
                'text-secondary': '#8b949e',
                'accent': '#58a6ff',
                'border': '#30363d',
                'leetcode-easy': '#00b8a3',
                'leetcode-medium': '#ffc01e',
                'leetcode-hard': '#ff375f',
                'heatmap-0': '#161b22',
                'heatmap-1': '#0e4429',
                'heatmap-2': '#006d32',
                'heatmap-3': '#26a641',
                'heatmap-4': '#39d353',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
