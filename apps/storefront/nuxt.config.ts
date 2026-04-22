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
    // Public values — exposed to the browser via useRuntimeConfig().public
    public: {
      medusaUrl: '',
      strapiUrl: '',
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
          // Inject variables into every component without needing to import
          additionalData: '@use "~/assets/scss/variables" as *;',
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
  modules: [],

  compatibilityDate: '2024-11-01',
})
