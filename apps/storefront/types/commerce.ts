export interface MedusaRegion {
  id: string
  name?: string
  currency_code?: string
}

export interface MedusaCalculatedPrice {
  calculated_amount?: number
  original_amount?: number
  currency_code?: string
}

export interface MedusaVariantPrice {
  id: string
  amount?: number
  currency_code?: string
  min_quantity?: number | null
  max_quantity?: number | null
  price_list_id?: string | null
}

export interface MedusaVariant {
  id: string
  title?: string
  sku?: string
  calculated_price?: MedusaCalculatedPrice | null
  prices?: MedusaVariantPrice[]
}

export interface MedusaProductSummary {
  id: string
  title?: string
  handle?: string
  thumbnail?: string | null
  variants?: MedusaVariant[]
}

export interface CommerceProduct extends MedusaProductSummary {
  purchasable: boolean
  default_variant_id?: string
  unavailable_reason?: string
}

export interface CartLineItem {
  id: string
  title?: string
  subtitle?: string
  quantity: number
  thumbnail?: string | null
  unit_price?: number
  total?: number
  variant_id?: string
  product_id?: string
  product_title?: string
  product_handle?: string
}

export interface MedusaCart {
  id: string
  region_id?: string
  currency_code?: string
  item_total?: number
  subtotal?: number
  total?: number
  discount_total?: number
  tax_total?: number
  shipping_total?: number
  items?: CartLineItem[]
}

