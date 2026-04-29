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

export interface CheckoutMainSectionData {
  id?: number
  __component: 'sections.checkout-main'
  enabled?: boolean
  billing_title_prefix?: string
  billing_title_accent?: string
  payment_title_prefix?: string
  payment_title_accent?: string
  free_shipping_text?: string
  guarantee_text?: string
  ship_different_label?: string
  payment_note?: string
  email_label?: string
  first_name_label?: string
  last_name_label?: string
  address_1_label?: string
  address_2_label?: string
  city_label?: string
  state_label?: string
  postcode_label?: string
  phone_label?: string
  card_number_label?: string
  card_expiry_label?: string
  card_cvv_label?: string
}

export type PageSection =
  | LogosSliderSectionData
  | BestSellersSectionData
  | AllProductsSectionData
  | InstaBlockSectionData
  | CartMainSectionData
  | CheckoutMainSectionData

export interface PageData {
  id?: number
  documentId?: string
  title?: string
  slug?: string
  seo?: SeoSettings | null
  hero?: HeroSectionData | null
  sections?: PageSection[]
}

export interface LandingAdvertorialHeroSectionData {
  id?: number
  __component: 'landing.advertorial-hero'
  enabled?: boolean
  headline?: string
  author?: string
  intro_html?: string
}

export interface LandingMediaItem {
  id?: number
  image?: StrapiMedia | null
  alt?: string
}

export interface LandingReasonItem {
  id?: number
  number?: number
  title?: string
  body_html?: string
  image?: StrapiMedia | null
  alt?: string
  gallery?: LandingMediaItem[]
}

export interface LandingReasonListSectionData {
  id?: number
  __component: 'landing.reason-list'
  enabled?: boolean
  items?: LandingReasonItem[]
}

export interface LandingVideoBlockSectionData {
  id?: number
  __component: 'landing.video-block'
  enabled?: boolean
  title?: string
  video?: StrapiMedia | null
  poster?: StrapiMedia | null
}

export interface LandingSaleOfferSectionData {
  id?: number
  __component: 'landing.sale-offer'
  enabled?: boolean
  background_color?: string
  headline_html?: string
  body_html?: string
  countdown_hours?: number
  cta?: LinkItem | null
}

export interface LandingReviewsAnchorSectionData {
  id?: number
  __component: 'landing.reviews-anchor'
  enabled?: boolean
  title?: string
  product_id?: string
  body?: string
}

export type LandingPageSection =
  | LandingAdvertorialHeroSectionData
  | LandingReasonListSectionData
  | LandingVideoBlockSectionData
  | LandingSaleOfferSectionData
  | LandingReviewsAnchorSectionData

export interface LandingPageData {
  id?: number
  documentId?: string
  title?: string
  slug?: string
  template?: 'default' | 'product-launch' | 'brand-story' | 'promotional' | 'advertorial' | 'quiz-funnel'
  show_header?: boolean
  show_footer?: boolean
  seo?: SeoSettings | null
  sections?: LandingPageSection[]
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

export interface PdpTabStep {
  id?: number
  title?: string
  text?: string
}

export interface PdpTabItem {
  id?: number
  label?: string
  content?: string
  steps?: PdpTabStep[]
}

export interface PdpIngredientItem {
  id?: number
  label?: string
}

export interface PdpComparisonRow {
  id?: number
  feature?: string
  particle_value?: string
  competitor_value?: string
}

export interface PdpFaqItem {
  id?: number
  question?: string
  answer?: string
}

export interface PdpReviewItem {
  id?: number
  quote?: string
  name?: string
  about?: string
  image?: StrapiMedia | null
  image_alt?: string
  video_url?: string
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

export interface PdpAddToCartTabsSectionData {
  id?: number
  __component: 'pdp.add-to-cart-tabs'
  enabled?: boolean
  brand_label?: string
  product_title?: string
  headline?: string
  review_count?: number
  rating_percent?: number
  add_to_cart_label?: string
  hurry_label?: string
  hurry_stock_count?: number
  hurry_stock_suffix?: string
  hurry_bar_percent?: number
  autoplay_ms?: number
  gallery?: PdpGalleryItem[]
  tabs?: PdpTabItem[]
  purchase_options?: PdpPurchaseOption[]
}

export interface PdpIngredientsAccordionSectionData {
  id?: number
  __component: 'pdp.ingredients-accordion'
  enabled?: boolean
  image?: StrapiMedia | null
  image_alt?: string
  ingredients_title?: string
  ingredients?: PdpIngredientItem[]
  comparison_title?: string
  particle_heading?: string
  competitor_heading?: string
  comparison_rows?: PdpComparisonRow[]
  faq_title?: string
  faq_items?: PdpFaqItem[]
  guarantee_title?: string
  guarantee_body?: string
}

export interface PdpReviewsCarouselSectionData {
  id?: number
  __component: 'pdp.reviews-carousel'
  enabled?: boolean
  title_html?: string
  autoplay_ms?: number
  reviews?: PdpReviewItem[]
}

export interface PdpMoreProductsSectionData {
  id?: number
  __component: 'pdp.more-products'
  enabled?: boolean
  title?: string
  limit?: number
  button_label?: string
}

export interface PdpStampedReviewsSectionData {
  id?: number
  __component: 'pdp.stamped-reviews'
  enabled?: boolean
  anchor_id?: string
  product_id?: string
  product_sku?: string
  product_name?: string
  product_url?: string
  image_url?: string
}

export type ProductSection =
  | PdpAddToCartRegularSectionData
  | PdpAddToCartTabsSectionData
  | PdpIngredientsAccordionSectionData
  | PdpReviewsCarouselSectionData
  | PdpStampedReviewsSectionData
  | PdpMoreProductsSectionData

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
