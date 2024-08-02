import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {}
  },

  plugins: [
    require('daisyui'),
  ],

  daisyui: {
    themes: true,
    darkTheme: "forest",
  }
} as Config;
