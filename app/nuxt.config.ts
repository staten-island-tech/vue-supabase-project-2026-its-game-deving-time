import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt'],
  supabase: {
    redirect: false
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  css: ['~/assets/css/main.css']
})