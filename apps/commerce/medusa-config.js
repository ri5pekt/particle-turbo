const { loadEnv, defineConfig } = require('@medusajs/framework/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Disable SSL for local Docker postgres (no SSL configured in dev container)
    databaseDriverOptions: process.env.NODE_ENV === 'production'
      ? { ssl: { rejectUnauthorized: false } }
      : { ssl: false },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000',
      authCors: process.env.AUTH_CORS || 'http://localhost:9000,http://localhost:3000',
      jwtSecret: process.env.JWT_SECRET || 'supersecret-change-in-production',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret-change-in-production',
    },
  },
  admin: {
    disable: false,
    // Disable Vite HMR WebSocket — it opens on a random port that Docker doesn't
    // expose, causing a harmless but noisy ERR_CONNECTION_REFUSED in the browser.
    // Manual refresh still works; HMR is not usable in Docker anyway.
    vite: (config) => ({
      ...config,
      server: {
        ...config?.server,
        hmr: false,
      },
    }),
  },
  // Custom modules added here as the project grows (Phase 2+)
  modules: [],
})
