import type { MedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, generateJwtToken } from "@medusajs/framework/utils"
import { dbQuery } from "./ppu"

const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

export const createCustomerSessionForEmail = async (
  req: MedusaRequest,
  emailInput: string,
  defaults: {
    first_name?: string
    last_name?: string
  } = {}
) => {
  const email = emailInput.trim().toLowerCase()
  const customerResult = await dbQuery<{ id: string }>(req.scope, `
    select id
    from customer
    where lower(email) = lower($1)
      and deleted_at is null
    order by created_at asc
    limit 1
  `, [email])
  const customerId = customerResult.rows[0]?.id || newId("cus")

  if (!customerResult.rows[0]?.id) {
    await dbQuery(req.scope, `
      insert into customer (id, email, first_name, last_name, has_account, created_at, updated_at)
      values ($1, $2, $3, $4, true, now(), now())
    `, [
      customerId,
      email,
      defaults.first_name || "",
      defaults.last_name || "",
    ])
  } else {
    await dbQuery(req.scope, `
      update customer
      set has_account = true, updated_at = now()
      where id = $1
    `, [customerId])
  }

  const identityResult = await dbQuery<{ id: string, app_metadata: Record<string, unknown> | null }>(req.scope, `
    select ai.id, ai.app_metadata
    from provider_identity pi
    join auth_identity ai on ai.id = pi.auth_identity_id
    where lower(pi.entity_id) = lower($1)
      and pi.provider = 'emailpass'
      and pi.deleted_at is null
      and ai.deleted_at is null
    order by ai.created_at asc
    limit 1
  `, [email])
  const authIdentityId = identityResult.rows[0]?.id || newId("authid")
  const appMetadata = {
    ...(identityResult.rows[0]?.app_metadata || {}),
    customer_id: customerId,
  }

  if (identityResult.rows[0]?.id) {
    await dbQuery(req.scope, `
      update auth_identity
      set app_metadata = $2::jsonb, updated_at = now()
      where id = $1
    `, [authIdentityId, JSON.stringify(appMetadata)])
  } else {
    await dbQuery(req.scope, `
      insert into auth_identity (id, app_metadata, created_at, updated_at)
      values ($1, $2::jsonb, now(), now())
    `, [authIdentityId, JSON.stringify(appMetadata)])
  }

  const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE) as {
    projectConfig?: {
      http?: {
        jwtSecret?: string
        jwtExpiresIn?: string
        jwtOptions?: Record<string, unknown>
      }
    }
  }
  const httpConfig = config.projectConfig?.http || {}
  const token = await generateJwtToken({
    actor_id: customerId,
    actor_type: "customer",
    auth_identity_id: authIdentityId,
    app_metadata: {
      customer_id: customerId,
    },
    user_metadata: {},
  }, {
    secret: httpConfig.jwtSecret || process.env.JWT_SECRET || "",
    expiresIn: httpConfig.jwtExpiresIn,
    jwtOptions: httpConfig.jwtOptions,
  })

  return {
    token,
    customer_id: customerId,
  }
}
