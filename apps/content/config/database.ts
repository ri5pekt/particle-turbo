export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env('DATABASE_PORT', '5432'),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env('DATABASE_SSL', 'false') === 'true',
    },
    acquireConnectionTimeout: 60000,
  },
})
