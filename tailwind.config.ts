import type { Config } from "tailwindcss";
import themes from "daisyui/src/theming/themes";
const plugin = require('tailwindcss/plugin')
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
        soft: '0 0px 2px var(--tw-shadow-color)',
        softer: '0 0px 6px var(--tw-shadow-color)',
      },
    },
  },

  plugins: [
    require("daisyui"),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],

  daisyui: {
    themes:
      // true
      [
        {
          sunset: {
            ...themes["sunset"],
            primary: "#ef9995",
            secondary: "#a4cbb4",
            "base-200": "#091319",
          },
          retro: { ...themes["retro"] },
        },
      ]
    ,
    darkMode: ['class', '[data-theme="sunset"]'],
  }
} as Config;

