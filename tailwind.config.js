import plugin from 'tailwindcss/plugin'

const commonSizes = {};
Array.from({ length: 1000 / 4 }, (_, i) => (i + 1) * 4).forEach(size => {
    commonSizes[size] = `${size}px`;
});

export default {
    content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],

    theme: {
        extend: {
            spacing: {
                ...commonSizes
            },
            borderRadius: {
                ...commonSizes
            },
            fontSize: {
                ...commonSizes
            },
            colors: {
                palette: {
                    positive: "var(--color-palette-positive)",
                    negative: "var(--color-palette-negative)",
                },
            },
            textColor: {
                main: "var(--color-text-main)",
                secondary: "var(--color-text-secondary)"
            },
            backgroundColor: {
                body: "var(--color-bg-body)",
                secondary: "var(--color-bg-secondary)",
                "btn-neutral": "var(--color-bg-btn-neutral)"
            }
        },
    },

    plugins: [
        plugin(function ({ addBase }) {
            addBase({
                '*': {
                    // transition: 'all .3s ease',
                },
            })
        })
    ]
};