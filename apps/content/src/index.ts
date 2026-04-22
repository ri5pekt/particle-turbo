export default {
  register({ strapi }: { strapi: any }) {},

  async bootstrap({ strapi }: { strapi: any }) {
    await createFirstAdmin(strapi)
  },

  destroy({ strapi }: { strapi: any }) {},
}

/**
 * Auto-creates the first Strapi superadmin if:
 *  - STRAPI_ADMIN_EMAIL + STRAPI_ADMIN_INITIAL_PASSWORD are set, AND
 *  - no admin users exist yet
 *
 * Runs once on first boot, then becomes a no-op.
 */
async function createFirstAdmin(strapi: any) {
  try {
    const email    = process.env.STRAPI_ADMIN_EMAIL
    const password = process.env.STRAPI_ADMIN_INITIAL_PASSWORD

    if (!email || !password) return

    const count = await strapi.db.query('admin::user').count({})
    if (count > 0) return

    const superAdminRole = await strapi.db.query('admin::role').findOne({
      where: { code: 'strapi-super-admin' },
    })
    if (!superAdminRole) return

    // Use Strapi's own auth service to hash the password correctly
    const authService = strapi.service('admin::auth')
    const hashedPassword = await authService.hashPassword(password)

    await strapi.db.query('admin::user').create({
      data: {
        email,
        password: hashedPassword,
        firstname: 'Admin',
        lastname: 'User',
        isActive: true,
        registrationToken: null,
        roles: [superAdminRole.id],
      },
    })

    strapi.log.info(`[bootstrap] Strapi admin user created: ${email}`)
  } catch (err: any) {
    // Non-fatal — admin can be created manually via /admin on first visit
    strapi.log.warn(`[bootstrap] Could not auto-create admin user: ${err?.message}`)
  }
}
