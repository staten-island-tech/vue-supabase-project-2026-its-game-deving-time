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
  css: ['~/assets/css/main.css'],
  app: {
  head: {
    link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap'
        }
      ],
    htmlAttrs: {
      'data-theme': 'light'
    }
  }
}
})
