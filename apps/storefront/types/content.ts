import type { CommerceProduct } from './commerce'

export interface LinkItem {
  id?: number
  label?: string
  url?: string
  target?: '_self' | '_blank'
}

export interface StrapiMedia {
  id?: number
  documentId?: string
  url?: string
  alternativeText?: string | null
  caption?: string | null
  width?: number
  height?: number
  formats?: Record<string, unknown> | null
  name?: string
}

export interface MegaMenuItem {
  id?: number
  label?: string
  url?: string
  is_heading?: boolean
  image?: StrapiMedia | null
}

export interface NavTopItem {
  id?: number
  label?: string
  url?: string
  mega_menu?: MegaMenuItem[]
}

export interface HeaderSettings {
  id?: number
  transparent_on_home?: boolean
  cta_label?: string
  cta_url?: string
  nav?: NavTopItem[]
}

export interface FooterColumn {
  id?: number
  heading?: string
  links?: LinkItem[]
}

export interface SocialLink {
  id?: number
  platform?: string
  url?: string
  aria_label?: string
}

export interface FooterSettings {
  id?: number
  newsletter_heading?: string
  show_newsletter_form?: boolean
  show_trustpilot?: boolean
  payment_heading?: string
  payment_icons?: StrapiMedia[]
  show_skin_cancer_badge?: boolean
  skin_cancer_badge?: StrapiMedia | null
  copyright_text?: string
  columns?: FooterColumn[]
  legal_links?: LinkItem[]
}

export interface SeoSettings {
  id?: number
  metaTitle?: string
  metaDescription?: string
  canonicalURL?: string
  noIndex?: boolean
  ogImage?: StrapiMedia | null
}

export interface SiteSettings {
  id?: number
  documentId?: string
  site_name?: string
  logo?: StrapiMedia | null
  logo_dark?: StrapiMedia | null
  favicon?: StrapiMedia | null
  default_seo?: SeoSettings | null
  contact_email?: string
  contact_phone?: string
  announcement_bar_text?: string
  announcement_bar_link?: LinkItem | null
  social_links?: SocialLink[]
  header?: HeaderSettings | null
  footer?: FooterSettings | null
}

export interface HeroSectionData {
  id?: number
  enabled?: boolean
  headline?: string
  cta?: LinkItem | null
  background_image?: StrapiMedia | null
  background_video?: StrapiMedia | null
  mobile_video?: StrapiMedia | null
  overlay_opacity?: number
  text_align?: 'left' | 'center' | 'right'
}

export interface LogoItem {
  id?: number
  image?: StrapiMedia | null
  alt?: string
  url?: string
}

export interface LogosSliderSectionData {
  id?: number
  __component: 'sections.logos-slider'
  enabled?: boolean
  logos?: LogoItem[]
}

export interface BestSellerItem {
  id?: number
  pre_title?: string
  title_html?: string
  description?: string
  url?: string
  button_label?: string
  hover_effect?: 'none' | 'scale' | 'rotate'
  back_image?: StrapiMedia | null
  main_image?: StrapiMedia | null
  front_image?: StrapiMedia | null
  mobile_image?: StrapiMedia | null
  alt?: string
}

export interface BestSellersSectionData {
  id?: number
  __component: 'sections.best-sellers'
  enabled?: boolean
  title?: string
  items?: BestSellerItem[]
}

export interface ProductCategory {
  id?: number
  label?: string
  slug?: string
  icon?: StrapiMedia | null
}

export interface AllProductItem {
  id?: number
  category_slug?: string
  title?: string
  description?: string
  url?: string
  button_label?: string
  image?: StrapiMedia | null
  alt?: string
}

export interface AllProductsSectionData {
  id?: number
  __component: 'sections.all-products'
  enabled?: boolean
  title?: string
  subtitle_html?: string
  categories?: ProductCategory[]
  items?: AllProductItem[]
}

export interface InstaBlockSectionData {
  id?: number
  __component: 'sections.insta-block'
  enabled?: boolean
  subtitle_html?: string
  title_html?: string
  video?: StrapiMedia | null
  molecule_one?: StrapiMedia | null
  molecule_two?: StrapiMedia | null
}

export interface CartMainSectionData {
  id?: number
  __component: 'sections.cart-main'
  enabled?: boolean
  title_prefix?: string
  title_accent?: string
  checkout_label?: string
  empty_title?: string
  empty_button_label?: string
  empty_button_url?: string
  monthly_orders_text?: string
}

export type PageSection =
  | LogosSliderSectionData
  | BestSellersSectionData
  | AllProductsSectionData
  | InstaBlockSectionData
  | CartMainSectionData

export interface PageData {
  id?: number
  documentId?: string
  title?: string
  slug?: string
  seo?: SeoSettings | null
  hero?: HeroSectionData | null
  sections?: PageSection[]
}

export interface PdpGalleryItem {
  id?: number
  image?: StrapiMedia | null
  video?: StrapiMedia | null
  alt?: string
}

export interface PdpGuaranteeItem {
  id?: number
  label?: string
  icon?: StrapiMedia | null
  alt?: string
}

export interface PdpPurchaseOption {
  id?: number
  quantity?: number
  unit_label?: string
  price_per_unit?: string
  total_label?: string
  save_label?: string
  badge_label?: string
  default_selected?: boolean
  image?: StrapiMedia | null
  alt?: string
}

export interface PdpAddToCartRegularSectionData {
  id?: number
  __component: 'pdp.add-to-cart-regular'
  enabled?: boolean
  brand_label?: string
  product_title?: string
  review_count?: number
  rating_percent?: number
  headline?: string
  excerpt?: string
  stock_text?: string
  add_to_cart_label?: string
  gallery?: PdpGalleryItem[]
  guarantees?: PdpGuaranteeItem[]
  purchase_options?: PdpPurchaseOption[]
}

export type ProductSection = PdpAddToCartRegularSectionData

export interface ProductData {
  id?: number
  documentId?: string
  title?: string
  subtitle?: string
  description?: string
  handle?: string
  thumbnail?: StrapiMedia | null
  images?: StrapiMedia[]
  commerce?: CommerceProduct | null
  seo?: SeoSettings | null
  sections?: ProductSection[]
}
