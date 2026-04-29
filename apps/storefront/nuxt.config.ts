// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  typescript: {
    strict: true,
    typeCheck: false, // run separately via `nuxt typecheck`
  },

  runtimeConfig: {
    // Server-only secrets — never exposed to the browser
    medusaApiKey: '',
    strapiApiToken: '',
    redisUrl: '',
    stampedPublicKey: '',
    stampedStoreHash: '',
    stampedStoreUrl: 'www.particleformen.com',
    stampedWidgetCacheTtl: 86400,
    // Public values — exposed to the browser via useRuntimeConfig().public
    public: {
      adminBarEnabled: false,
      medusaUrl: '',
      strapiUrl: '',
      googleMapsApiKey: '',
    },
  },

  // Route-level caching policy.
  // Public pages use SWR; private/user pages are always server-rendered fresh.
  routeRules: {
    // Public — cached with stale-while-revalidate
    '/': { swr: 60 },
    '/product/**': { swr: 300 },
    '/products/**': { swr: 300 },
    '/collection/**': { swr: 300 },
    '/collections/**': { swr: 300 },
    '/blog/**': { swr: 600 },
    '/page/**': { swr: 600 },
    '/lpage/**': { swr: 300 },
    // Private — never cached
    '/cart': { ssr: true, headers: { 'cache-control': 'no-store' } },
    '/checkout/**': { ssr: true, headers: { 'cache-control': 'no-store' } },
    '/account/**': { ssr: true, headers: { 'cache-control': 'no-store' } },
    '/order/**': { ssr: true, headers: { 'cache-control': 'no-store' } },
  },

  // SCSS global setup — variables available in every .vue file and .scss file
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Prepend variables to every .scss file so tokens are globally available.
          // @import (not @use) is required here — additionalData runs before
          // the file is parsed, so Sass module-system @use rules cannot be used.
          additionalData: '@import "~/assets/scss/variables";',
        },
      },
    },
  },

  // Auto-import components and composables
  components: [
    { path: '~/components', pathPrefix: false },
  ],

  // Load global SCSS (reset, typography, utilities)
  // Variables are injected separately via vite preprocessorOptions above
  css: ['~/assets/scss/main.scss'],

  // Modules — added progressively as needed
  modules: ['@vueuse/nuxt'],

  compatibilityDate: '2024-11-01',
})
