export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['@/assets/main.css']
})


import type { Config } from 'tailwindcss'

/* export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue"
  ],

  theme: {
    extend: {},
  },

  plugins: [require('daisyui')],
} satisfies Config */