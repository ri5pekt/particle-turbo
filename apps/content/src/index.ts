export default {
  register({ strapi }: { strapi: any }) {
    // Register custom services, routes, or policies here
  },

  bootstrap({ strapi }: { strapi: any }) {
    // Run code on application startup (after register phase)
  },

  destroy({ strapi }: { strapi: any }) {
    // Cleanup on application shutdown
  },
}
