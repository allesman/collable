import type { Config } from "tailwindcss";
import themes from "daisyui/src/theming/themes";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],

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

