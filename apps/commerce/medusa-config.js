const { loadEnv, defineConfig } = require('@medusajs/framework/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const databaseSslEnabled = process.env.DATABASE_SSL === 'true'

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: databaseSslEnabled
      ? { ssl: { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } }
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
  modules: [
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/braintree-payment',
            id: 'braintree',
            options: {
              enabled: process.env.BRAINTREE_ENABLED === 'true',
              environment: process.env.BRAINTREE_ENVIRONMENT || 'sandbox',
              merchantId: process.env.BRAINTREE_MERCHANT_ID,
              publicKey: process.env.BRAINTREE_PUBLIC_KEY,
              privateKey: process.env.BRAINTREE_PRIVATE_KEY,
              merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT_ID,
              submitForSettlement: process.env.BRAINTREE_SUBMIT_FOR_SETTLEMENT === 'true',
            },
          },
        ],
      },
    },
  ],
})
