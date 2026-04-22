"use strict"

/**
 * StrapiModuleService
 *
 * Syncs Medusa products (product-level only, no variants) to Strapi.
 * Uses native Node.js fetch (Node 20+) — no extra dependencies needed.
 */
class StrapiModuleService {
  constructor(_deps, options) {
    this.apiUrl_ = (options?.apiUrl ?? "").replace(/\/$/, "")
    this.apiToken_ = options?.apiToken ?? ""
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  async request(method, path, body) {
    const url = `${this.apiUrl_}${path}`
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken_}`,
      },
      body: body ? JSON.stringify({ data: body }) : undefined,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Strapi API ${method} ${path} failed [${response.status}]: ${text}`
      )
    }

    return response.json()
  }

  async findByMedusaId(medusaId) {
    const qs = `?filters[medusaId][$eq]=${encodeURIComponent(medusaId)}`
    const res = await this.request("GET", `/products${qs}`)
    return res.data?.[0] ?? null
  }

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  async upsertProduct(payload) {
    const existing = await this.findByMedusaId(payload.medusaId)

    if (existing) {
      const res = await this.request("PUT", `/products/${existing.documentId}`, {
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        handle: payload.handle,
      })
      return res.data
    }

    const res = await this.request("POST", "/products", {
      medusaId: payload.medusaId,
      title: payload.title,
      subtitle: payload.subtitle,
      description: payload.description,
      handle: payload.handle,
    })
    return res.data
  }

  async deleteProduct(medusaId) {
    const existing = await this.findByMedusaId(medusaId)
    if (!existing) return
    await this.request("DELETE", `/products/${existing.documentId}`)
  }
}

module.exports = StrapiModuleService
