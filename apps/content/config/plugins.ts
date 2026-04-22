export default () => ({
  // i18n is built into Strapi v5 core — no separate plugin needed.
  // Enable internationalization on each content type in the Strapi admin:
  //   Content-Type Builder → content type → Advanced Settings → Enable localization
  // Locales are added in Settings → Internationalization.

  'users-permissions': {
    enabled: true,
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
})
