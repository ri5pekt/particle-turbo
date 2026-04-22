/**
 * TypeScript mirror of service.js — used by the TypeScript compiler for type-checking only.
 * At runtime Node loads service.js (CommonJS).
 */

type StrapiModuleOptions = {
  apiUrl: string
  apiToken: string
}

export type ProductPayload = {
  medusaId: string
  title?: string
  subtitle?: string
  description?: string
  handle?: string
}

export type StrapiDocument = {
  documentId: string
  medusaId: string
  [key: string]: any
}

export default class StrapiModuleService {
  private apiUrl_: string
  private apiToken_: string

  constructor(_deps: Record<string, never>, options: StrapiModuleOptions) {
    this.apiUrl_ = options.apiUrl?.replace(/\/$/, "") ?? ""
    this.apiToken_ = options.apiToken ?? ""
  }

  private async request<T = any>(
    method: string,
    path: string,
    body?: Record<string, any>
  ): Promise<T> {
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

    return response.json() as T
  }

  private async findByMedusaId(medusaId: string): Promise<StrapiDocument | null> {
    const qs = `?filters[medusaId][$eq]=${encodeURIComponent(medusaId)}`
    const res = await this.request<{ data: StrapiDocument[] }>("GET", `/products${qs}`)
    return res.data?.[0] ?? null
  }

  async upsertProduct(payload: ProductPayload): Promise<StrapiDocument> {
    const existing = await this.findByMedusaId(payload.medusaId)

    if (existing) {
      const res = await this.request<{ data: StrapiDocument }>(
        "PUT",
        `/products/${existing.documentId}`,
        {
          title: payload.title,
          subtitle: payload.subtitle,
          description: payload.description,
          handle: payload.handle,
        }
      )
      return res.data
    }

    const res = await this.request<{ data: StrapiDocument }>("POST", "/products", {
      medusaId: payload.medusaId,
      title: payload.title,
      subtitle: payload.subtitle,
      description: payload.description,
      handle: payload.handle,
    })
    return res.data
  }

  async deleteProduct(medusaId: string): Promise<void> {
    const existing = await this.findByMedusaId(medusaId)
    if (!existing) return
    await this.request("DELETE", `/products/${existing.documentId}`)
  }
}
