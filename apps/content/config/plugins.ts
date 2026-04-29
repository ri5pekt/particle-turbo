export default ({ env }) => ({
  // i18n is built into Strapi v5 core — no separate plugin needed.
  // Enable internationalization on each content type in the Strapi admin:
  //   Content-Type Builder → content type → Advanced Settings → Enable localization
  // Locales are added in Settings → Internationalization.

  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('R2_PUBLIC_URL'),
        s3Options: {
          credentials: {
            accessKeyId: env('R2_ACCESS_KEY_ID'),
            secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
          },
          endpoint: env('R2_ENDPOINT'),
          forcePathStyle: true,
          region: env('R2_REGION', 'auto'),
          params: {
            Bucket: env('R2_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },

  'users-permissions': {
    enabled: true,
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
})
