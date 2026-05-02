import type { Schema, Struct } from '@strapi/strapi';

export interface GlobalFooter extends Struct.ComponentSchema {
  collectionName: 'components_global_footers';
  info: {
    description: 'Global footer configuration. Link columns are managed via the Navigation collection (identifiers: footer-particle, footer-products, footer-bundles, footer-legal).';
    displayName: 'Footer';
    icon: 'layout';
  };
  attributes: {
    columns: Schema.Attribute.Component<'global.footer-column', true>;
    copyright_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'\u00A9 Particle. All Rights Reserved'>;
    legal_links: Schema.Attribute.Component<'shared.link', true>;
    newsletter_heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Newsletter'>;
    payment_heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'We Accept'>;
    payment_icons: Schema.Attribute.Media<'images', true>;
    show_newsletter_form: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    show_skin_cancer_badge: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    show_trustpilot: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    skin_cancer_badge: Schema.Attribute.Media<'images'>;
  };
}

export interface GlobalFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_global_footer_columns';
  info: {
    description: 'A single link column in the footer (e.g. Particle, Products, Bundles & Sets).';
    displayName: 'Footer Column';
    icon: 'bulletList';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
  };
}

export interface GlobalHeader extends Struct.ComponentSchema {
  collectionName: 'components_global_headers';
  info: {
    description: 'Global header configuration. Navigation is managed separately via the Navigation collection (identifier: main-nav).';
    displayName: 'Header';
    icon: 'layout';
  };
  attributes: {
    cta_label: Schema.Attribute.String;
    cta_url: Schema.Attribute.String;
    nav: Schema.Attribute.Component<'global.nav-top-item', true>;
    transparent_on_home: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface GlobalMegaItem extends Struct.ComponentSchema {
  collectionName: 'components_global_mega_items';
  info: {
    description: "A single item inside a megamenu dropdown. Set is_heading=true for section dividers like 'Face' or 'Body'.";
    displayName: 'Mega Menu Item';
    icon: 'bulletList';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    is_heading: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface GlobalNavTopItem extends Struct.ComponentSchema {
  collectionName: 'components_global_nav_top_items';
  info: {
    description: 'A top-level header navigation item. Add mega_menu items for a dropdown, or just set url for a direct link.';
    displayName: 'Nav Top Item';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    mega_menu: Schema.Attribute.Component<'global.mega-item', true>;
    url: Schema.Attribute.String;
  };
}

export interface GlobalSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_global_social_links';
  info: {
    description: 'A social media profile link. Platform is used by the frontend to render the correct icon.';
    displayName: 'Social Link';
    icon: 'earth';
  };
  attributes: {
    aria_label: Schema.Attribute.String;
    platform: Schema.Attribute.Enumeration<
      [
        'instagram',
        'facebook',
        'youtube',
        'tiktok',
        'twitter_x',
        'pinterest',
        'linkedin',
        'snapchat',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LandingAdvertorialHero extends Struct.ComponentSchema {
  collectionName: 'components_landing_advertorial_heroes';
  info: {
    description: 'Landing page headline, byline, and intro copy for long-form advertorials.';
    displayName: 'Advertorial Hero';
    icon: 'heading';
  };
  attributes: {
    author: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    headline: Schema.Attribute.Text & Schema.Attribute.Required;
    intro_html: Schema.Attribute.RichText;
  };
}

export interface LandingMediaItem extends Struct.ComponentSchema {
  collectionName: 'components_landing_media_items';
  info: {
    description: 'A reusable image item for landing page galleries.';
    displayName: 'Landing Media Item';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface LandingReasonItem extends Struct.ComponentSchema {
  collectionName: 'components_landing_reason_items';
  info: {
    description: 'A numbered advertorial reason with body copy and either one image or a gallery.';
    displayName: 'Landing Reason Item';
    icon: 'check';
  };
  attributes: {
    alt: Schema.Attribute.String;
    body_html: Schema.Attribute.RichText;
    gallery: Schema.Attribute.Component<'landing.media-item', true>;
    image: Schema.Attribute.Media<'images'>;
    number: Schema.Attribute.Integer & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LandingReasonList extends Struct.ComponentSchema {
  collectionName: 'components_landing_reason_lists';
  info: {
    description: 'A landing-only list of numbered advertorial reasons.';
    displayName: 'Reason List';
    icon: 'bulletList';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'landing.reason-item', true>;
  };
}

export interface LandingReviewsAnchor extends Struct.ComponentSchema {
  collectionName: 'components_landing_reviews_anchors';
  info: {
    description: 'Landing page review widget placeholder or anchor.';
    displayName: 'Reviews Anchor';
    icon: 'star';
  };
  attributes: {
    body: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    product_id: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Customer Reviews'>;
  };
}

export interface LandingSaleOffer extends Struct.ComponentSchema {
  collectionName: 'components_landing_sale_offers';
  info: {
    description: 'Promotional sale callout with countdown labels and CTA.';
    displayName: 'Sale Offer';
    icon: 'priceTag';
  };
  attributes: {
    background_color: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#ECF0F4'>;
    body_html: Schema.Attribute.RichText;
    countdown_hours: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    headline_html: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface LandingVideoBlock extends Struct.ComponentSchema {
  collectionName: 'components_landing_video_blocks';
  info: {
    description: 'Landing page video section.';
    displayName: 'Video Block';
    icon: 'play';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    poster: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    video: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
  };
}

export interface PdpAddToCartRegular extends Struct.ComponentSchema {
  collectionName: 'components_pdp_add_to_cart_regulars';
  info: {
    description: 'Regular PDP hero section with vertical gallery and product purchase panel.';
    displayName: 'Add to Cart - Regular';
    icon: 'shoppingCart';
  };
  attributes: {
    add_to_cart_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Add To Cart'>;
    brand_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Particle'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    excerpt: Schema.Attribute.RichText;
    gallery: Schema.Attribute.Component<'pdp.gallery-item', true>;
    guarantees: Schema.Attribute.Component<'pdp.guarantee-item', true>;
    headline: Schema.Attribute.Text & Schema.Attribute.Required;
    product_title: Schema.Attribute.String & Schema.Attribute.Required;
    purchase_options: Schema.Attribute.Component<'pdp.purchase-option', true>;
    rating_percent: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<100>;
    review_count: Schema.Attribute.Integer;
    stock_text: Schema.Attribute.String;
  };
}

export interface PdpAddToCartTabs extends Struct.ComponentSchema {
  collectionName: 'components_pdp_add_to_cart_tabs';
  info: {
    description: 'PDP hero with auto story slider, tabs, quantity cards, hurry stock bar, and add-to-cart.';
    displayName: 'Add to Cart - Tabs';
    icon: 'shoppingCart';
  };
  attributes: {
    add_to_cart_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Add To Cart'>;
    autoplay_ms: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4500>;
    brand_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Particle'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    gallery: Schema.Attribute.Component<'pdp.gallery-item', true>;
    headline: Schema.Attribute.Text & Schema.Attribute.Required;
    hurry_bar_percent: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<41>;
    hurry_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'HURRY! Selling out fast!'>;
    hurry_stock_count: Schema.Attribute.Integer;
    hurry_stock_suffix: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'left in stock.'>;
    product_title: Schema.Attribute.String & Schema.Attribute.Required;
    purchase_options: Schema.Attribute.Component<'pdp.purchase-option', true>;
    rating_percent: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<100>;
    review_count: Schema.Attribute.Integer;
    tabs: Schema.Attribute.Component<'pdp.tab-item', true>;
  };
}

export interface PdpBannerSection extends Struct.ComponentSchema {
  collectionName: 'components_pdp_banner_sections';
  info: {
    description: 'Gravite image banner with title and rich text overlay.';
    displayName: 'Banner Section';
    icon: 'landscape';
  };
  attributes: {
    background_image_alt: Schema.Attribute.String;
    background_image_mobile_alt: Schema.Attribute.String;
    background_image_mobile_url: Schema.Attribute.String;
    background_image_url: Schema.Attribute.String & Schema.Attribute.Required;
    body: Schema.Attribute.RichText;
    content_position: Schema.Attribute.Enumeration<['top', 'bottom']> &
      Schema.Attribute.DefaultTo<'top'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    theme: Schema.Attribute.Enumeration<['gravite', 'varros']> &
      Schema.Attribute.DefaultTo<'gravite'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpCarouselImage extends Struct.ComponentSchema {
  collectionName: 'components_pdp_carousel_images';
  info: {
    displayName: 'Carousel Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpCarouselSection extends Struct.ComponentSchema {
  collectionName: 'components_pdp_carousel_sections';
  info: {
    description: 'Reusable Gravite-style image carousel.';
    displayName: 'Carousel Section';
    icon: 'images';
  };
  attributes: {
    autoplay_ms: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<2000>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    images: Schema.Attribute.Component<'pdp.carousel-image', true>;
    theme: Schema.Attribute.Enumeration<['gravite', 'varros']> &
      Schema.Attribute.DefaultTo<'gravite'>;
    title: Schema.Attribute.String;
  };
}

export interface PdpComparisonRow extends Struct.ComponentSchema {
  collectionName: 'components_pdp_comparison_rows';
  info: {
    description: 'A feature comparison row for the PDP ingredients accordion.';
    displayName: 'PDP Comparison Row';
    icon: 'bulletList';
  };
  attributes: {
    competitor_value: Schema.Attribute.String & Schema.Attribute.Required;
    feature: Schema.Attribute.String & Schema.Attribute.Required;
    particle_value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_faq_items';
  info: {
    description: 'A question and answer row for PDP accordion sections.';
    displayName: 'PDP FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpGalleryItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_gallery_items';
  info: {
    description: 'A gallery slide for PDP add-to-cart sections.';
    displayName: 'PDP Gallery Item';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    video: Schema.Attribute.Media<'videos'>;
  };
}

export interface PdpGuaranteeItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_guarantee_items';
  info: {
    description: 'Small guarantee row under the PDP product excerpt.';
    displayName: 'PDP Guarantee Item';
    icon: 'check';
  };
  attributes: {
    alt: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpHorizontalAccordion extends Struct.ComponentSchema {
  collectionName: 'components_pdp_horizontal_accordions';
  info: {
    description: 'Desktop horizontal testimonial gallery with mobile carousel.';
    displayName: 'Horizontal Accordion';
    icon: 'apps';
  };
  attributes: {
    autoplay_ms: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<3000>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'pdp.horizontal-accordion-item', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpHorizontalAccordionItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_horizontal_accordion_items';
  info: {
    description: 'One testimonial card in the Gravite horizontal accordion.';
    displayName: 'Horizontal Accordion Item';
    icon: 'user';
  };
  attributes: {
    customer: Schema.Attribute.String & Schema.Attribute.Required;
    image_alt: Schema.Attribute.String;
    image_title: Schema.Attribute.String;
    image_url: Schema.Attribute.String & Schema.Attribute.Required;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PdpIngredientItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_ingredient_items';
  info: {
    description: 'A single ingredient row in the PDP ingredients accordion.';
    displayName: 'PDP Ingredient Item';
    icon: 'check';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpIngredientsAccordion extends Struct.ComponentSchema {
  collectionName: 'components_pdp_ingredients_accordions';
  info: {
    description: 'PDP accordion section with ingredients, comparison table, FAQ, guarantee, and supporting image.';
    displayName: 'Ingredients Accordion';
    icon: 'bulletList';
  };
  attributes: {
    comparison_rows: Schema.Attribute.Component<'pdp.comparison-row', true>;
    comparison_title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Particle Face Cream VS Competitors'>;
    competitor_heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Competitors'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    faq_items: Schema.Attribute.Component<'pdp.faq-item', true>;
    faq_title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Frequently Asked Questions'>;
    guarantee_body: Schema.Attribute.Text;
    guarantee_title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'30 Day Money Back Guarantee'>;
    image: Schema.Attribute.Media<'images'>;
    image_alt: Schema.Attribute.String;
    ingredients: Schema.Attribute.Component<'pdp.ingredient-item', true>;
    ingredients_title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Premium Ingredients'>;
    particle_heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Particle Face Cream'>;
  };
}

export interface PdpMoreProducts extends Struct.ComponentSchema {
  collectionName: 'components_pdp_more_products';
  info: {
    description: 'Recommended products grid for the bottom of PDP pages.';
    displayName: 'More Products';
    icon: 'shoppingCart';
  };
  attributes: {
    button_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Shop Now'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    limit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'More Products For You'>;
  };
}

export interface PdpPageHeader extends Struct.ComponentSchema {
  collectionName: 'components_pdp_page_headers';
  info: {
    description: 'Full-screen PDP header with background video or image, title, rating, copy, and CTA.';
    displayName: 'Page Header';
    icon: 'crown';
  };
  attributes: {
    background_image: Schema.Attribute.Media<'images'>;
    background_image_url: Schema.Attribute.String;
    background_video_url: Schema.Attribute.String;
    body: Schema.Attribute.RichText;
    cta_href: Schema.Attribute.String;
    cta_label: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    rating_label: Schema.Attribute.String;
    rating_percent: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<100>;
    rating_value: Schema.Attribute.Decimal;
    theme: Schema.Attribute.Enumeration<['gravite', 'varros']> &
      Schema.Attribute.DefaultTo<'gravite'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpPriceSection extends Struct.ComponentSchema {
  collectionName: 'components_pdp_price_sections';
  info: {
    description: 'Reusable Gravite-style add to cart price section.';
    displayName: 'Price Section';
    icon: 'priceTag';
  };
  attributes: {
    add_to_cart_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Add To Cart'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    gallery: Schema.Attribute.Component<
      'pdp.price-section-gallery-image',
      true
    >;
    hurry_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'HURRY! Selling out fast!'>;
    hurry_stock_count: Schema.Attribute.Integer;
    hurry_stock_suffix: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'left in stock.'>;
    progress_percent: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<23>;
    purchase_options: Schema.Attribute.Component<
      'pdp.price-section-option',
      true
    >;
    select_title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Select the quantity:'>;
    subtitle: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['gravite', 'varros']> &
      Schema.Attribute.DefaultTo<'gravite'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpPriceSectionGalleryImage extends Struct.ComponentSchema {
  collectionName: 'components_pdp_price_section_gallery_images';
  info: {
    displayName: 'Price Section Gallery Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpPriceSectionOption extends Struct.ComponentSchema {
  collectionName: 'components_pdp_price_section_options';
  info: {
    displayName: 'Price Section Option';
    icon: 'shoppingCart';
  };
  attributes: {
    default_selected: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    image_alt: Schema.Attribute.String;
    image_url: Schema.Attribute.String & Schema.Attribute.Required;
    quantity: Schema.Attribute.Integer & Schema.Attribute.Required;
    unit_label: Schema.Attribute.String;
  };
}

export interface PdpPurchaseOption extends Struct.ComponentSchema {
  collectionName: 'components_pdp_purchase_options';
  info: {
    description: 'A quantity/price option in the PDP add-to-cart box.';
    displayName: 'PDP Purchase Option';
    icon: 'shoppingCart';
  };
  attributes: {
    alt: Schema.Attribute.String;
    badge_label: Schema.Attribute.String;
    default_selected: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    price_per_unit: Schema.Attribute.String & Schema.Attribute.Required;
    quantity: Schema.Attribute.Integer & Schema.Attribute.Required;
    save_label: Schema.Attribute.String;
    total_label: Schema.Attribute.String;
    unit_label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpReviewItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_review_items';
  info: {
    description: 'A customer review card for PDP review carousels.';
    displayName: 'PDP Review Item';
    icon: 'star';
  };
  attributes: {
    about: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    image_alt: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    quote: Schema.Attribute.RichText & Schema.Attribute.Required;
    video_url: Schema.Attribute.Text;
  };
}

export interface PdpReviewsCarousel extends Struct.ComponentSchema {
  collectionName: 'components_pdp_reviews_carousels';
  info: {
    description: 'PDP carousel for customer reviews and testimonial videos.';
    displayName: 'Reviews Carousel';
    icon: 'star';
  };
  attributes: {
    autoplay_ms: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5500>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    reviews: Schema.Attribute.Component<'pdp.review-item', true>;
    title_html: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Reviews of <span>Particle men</span>'>;
  };
}

export interface PdpScrollTabImage extends Struct.ComponentSchema {
  collectionName: 'components_pdp_scroll_tab_images';
  info: {
    description: 'Image URL used in a Gravite scroll tab.';
    displayName: 'Scroll Tab Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpScrollTabItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_scroll_tab_items';
  info: {
    description: 'One item in the Gravite pinned scroll tabs section.';
    displayName: 'Scroll Tab Item';
    icon: 'bulletList';
  };
  attributes: {
    images_desktop: Schema.Attribute.Component<'pdp.scroll-tab-image', true>;
    images_mobile: Schema.Attribute.Component<'pdp.scroll-tab-image', true>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpScrollTabs extends Struct.ComponentSchema {
  collectionName: 'components_pdp_scroll_tabs';
  info: {
    description: 'Pinned animated tabs section used by Gravite fragrance pages.';
    displayName: 'Scroll Tabs';
    icon: 'layer';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    tabs: Schema.Attribute.Component<'pdp.scroll-tab-item', true>;
    theme: Schema.Attribute.Enumeration<['gravite', 'varros']> &
      Schema.Attribute.DefaultTo<'gravite'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PdpStampedReviews extends Struct.ComponentSchema {
  collectionName: 'components_pdp_stamped_reviews';
  info: {
    description: 'Stamped.io main reviews widget for PDP pages.';
    displayName: 'Stamped Reviews';
    icon: 'star';
  };
  attributes: {
    anchor_id: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'stampedcreambot'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    image_url: Schema.Attribute.Text;
    product_id: Schema.Attribute.String & Schema.Attribute.Required;
    product_name: Schema.Attribute.String;
    product_sku: Schema.Attribute.String;
    product_url: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<['default', 'dark', 'varros']> &
      Schema.Attribute.DefaultTo<'default'>;
  };
}

export interface PdpTabItem extends Struct.ComponentSchema {
  collectionName: 'components_pdp_tab_items';
  info: {
    description: 'A tab in the PDP tabbed add-to-cart layout.';
    displayName: 'PDP Tab Item';
    icon: 'bulletList';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    steps: Schema.Attribute.Component<'pdp.tab-step', true>;
  };
}

export interface PdpTabStep extends Struct.ComponentSchema {
  collectionName: 'components_pdp_tab_steps';
  info: {
    description: 'A short title/body step used inside a PDP tab.';
    displayName: 'PDP Tab Step';
    icon: 'check';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsAllProducts extends Struct.ComponentSchema {
  collectionName: 'components_sections_all_products';
  info: {
    description: 'Tabbed homepage product grid.';
    displayName: 'All Products';
    icon: 'shoppingCart';
  };
  attributes: {
    categories: Schema.Attribute.Component<'shared.product-category', true>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'shared.all-product-item', true>;
    subtitle_html: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'All Products'>;
  };
}

export interface SectionsBestSellers extends Struct.ComponentSchema {
  collectionName: 'components_sections_best_sellers';
  info: {
    description: 'Homepage best-sellers product card grid.';
    displayName: 'Best Sellers';
    icon: 'shoppingCart';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'shared.best-seller-item', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Best Sellers'>;
  };
}

export interface SectionsCartMain extends Struct.ComponentSchema {
  collectionName: 'components_sections_cart_main';
  info: {
    description: 'Main cart table and order summary powered by Medusa.';
    displayName: 'Cart Main';
    icon: 'shoppingCart';
  };
  attributes: {
    checkout_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Proceed to secure checkout'>;
    empty_button_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Continue Shopping'>;
    empty_button_url: Schema.Attribute.String & Schema.Attribute.DefaultTo<'/'>;
    empty_title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your cart is empty.'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    monthly_orders_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'50,000+ Orders Last Month!'>;
    title_accent: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Cart'>;
    title_prefix: Schema.Attribute.String & Schema.Attribute.DefaultTo<'My'>;
  };
}

export interface SectionsCheckoutMain extends Struct.ComponentSchema {
  collectionName: 'components_sections_checkout_main';
  info: {
    description: 'Checkout form labels and supporting copy powered by Medusa.';
    displayName: 'Checkout Main';
    icon: 'creditCard';
  };
  attributes: {
    address_1_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Street address'>;
    address_2_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Apartment, suite, unit, etc.'>;
    billing_title_accent: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'details'>;
    billing_title_prefix: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Billing'>;
    card_cvv_label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'CVV'>;
    card_expiry_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Expiration date'>;
    card_number_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Card number'>;
    city_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Town / City'>;
    email_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Email address'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    first_name_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'First name'>;
    free_shipping_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Free Shipping'>;
    guarantee_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'30 Day Money Back Guarantee'>;
    last_name_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Last name'>;
    payment_note: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Payment provider fields will replace this section when Medusa payments are configured.'>;
    payment_title_accent: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Information'>;
    payment_title_prefix: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Payment'>;
    phone_label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Phone'>;
    postcode_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Postcode / ZIP'>;
    ship_different_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Ship to a different address?'>;
    state_label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'State'>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: 'Full-width hero banner with headline, CTA, and background image or video';
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    background_image: Schema.Attribute.Media<'images'>;
    background_video: Schema.Attribute.Media<'videos'>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    headline: Schema.Attribute.Text & Schema.Attribute.Required;
    mobile_video: Schema.Attribute.Media<'videos'>;
    overlay_opacity: Schema.Attribute.Integer;
    text_align: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'center'>;
  };
}

export interface SectionsInstaBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_insta_blocks';
  info: {
    description: 'Homepage Instagram/social proof block with title, subtitle, decorative molecules, and a video.';
    displayName: 'Insta Block';
    icon: 'instagram';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    molecule_one: Schema.Attribute.Media<'images'>;
    molecule_two: Schema.Attribute.Media<'images'>;
    subtitle_html: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Get Obsessed <span>#particleformen</span>'>;
    title_html: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1 MILLION<span>Particle </span> Men'>;
    video: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
  };
}

export interface SectionsLogosSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_logos_sliders';
  info: {
    description: 'Infinite auto-scrolling strip of press/partner logos. Add logos in display order \u2014 the frontend will loop them.';
    displayName: 'Logos Slider';
    icon: 'landscape';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    logos: Schema.Attribute.Component<'shared.logo-item', true>;
  };
}

export interface SharedAllProductItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_all_product_items';
  info: {
    description: 'A product card in the homepage All Products section.';
    displayName: 'All Product Item';
    icon: 'shoppingCart';
  };
  attributes: {
    alt: Schema.Attribute.String;
    button_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Discover'>;
    category_slug: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedBestSellerItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_best_seller_items';
  info: {
    description: 'A product card in the homepage best-sellers section.';
    displayName: 'Best Seller Item';
    icon: 'shoppingCart';
  };
  attributes: {
    alt: Schema.Attribute.String;
    back_image: Schema.Attribute.Media<'images'>;
    button_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Discover'>;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    front_image: Schema.Attribute.Media<'images'>;
    hover_effect: Schema.Attribute.Enumeration<['none', 'scale', 'rotate']> &
      Schema.Attribute.DefaultTo<'none'>;
    main_image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    mobile_image: Schema.Attribute.Media<'images'>;
    pre_title: Schema.Attribute.String & Schema.Attribute.Required;
    title_html: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'A labelled URL with optional target';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    target: Schema.Attribute.Enumeration<['_self', '_blank']> &
      Schema.Attribute.DefaultTo<'_self'>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLogoItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_logo_items';
  info: {
    description: 'A single logo in a logos slider or press bar.';
    displayName: 'Logo Item';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface SharedProductCategory extends Struct.ComponentSchema {
  collectionName: 'components_shared_product_categories';
  info: {
    description: 'A tab category for product grids.';
    displayName: 'Product Category';
    icon: 'bulletList';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Meta title, description, OG image, canonical URL';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'global.footer': GlobalFooter;
      'global.footer-column': GlobalFooterColumn;
      'global.header': GlobalHeader;
      'global.mega-item': GlobalMegaItem;
      'global.nav-top-item': GlobalNavTopItem;
      'global.social-link': GlobalSocialLink;
      'landing.advertorial-hero': LandingAdvertorialHero;
      'landing.media-item': LandingMediaItem;
      'landing.reason-item': LandingReasonItem;
      'landing.reason-list': LandingReasonList;
      'landing.reviews-anchor': LandingReviewsAnchor;
      'landing.sale-offer': LandingSaleOffer;
      'landing.video-block': LandingVideoBlock;
      'pdp.add-to-cart-regular': PdpAddToCartRegular;
      'pdp.add-to-cart-tabs': PdpAddToCartTabs;
      'pdp.banner-section': PdpBannerSection;
      'pdp.carousel-image': PdpCarouselImage;
      'pdp.carousel-section': PdpCarouselSection;
      'pdp.comparison-row': PdpComparisonRow;
      'pdp.faq-item': PdpFaqItem;
      'pdp.gallery-item': PdpGalleryItem;
      'pdp.guarantee-item': PdpGuaranteeItem;
      'pdp.horizontal-accordion': PdpHorizontalAccordion;
      'pdp.horizontal-accordion-item': PdpHorizontalAccordionItem;
      'pdp.ingredient-item': PdpIngredientItem;
      'pdp.ingredients-accordion': PdpIngredientsAccordion;
      'pdp.more-products': PdpMoreProducts;
      'pdp.page-header': PdpPageHeader;
      'pdp.price-section': PdpPriceSection;
      'pdp.price-section-gallery-image': PdpPriceSectionGalleryImage;
      'pdp.price-section-option': PdpPriceSectionOption;
      'pdp.purchase-option': PdpPurchaseOption;
      'pdp.review-item': PdpReviewItem;
      'pdp.reviews-carousel': PdpReviewsCarousel;
      'pdp.scroll-tab-image': PdpScrollTabImage;
      'pdp.scroll-tab-item': PdpScrollTabItem;
      'pdp.scroll-tabs': PdpScrollTabs;
      'pdp.stamped-reviews': PdpStampedReviews;
      'pdp.tab-item': PdpTabItem;
      'pdp.tab-step': PdpTabStep;
      'sections.all-products': SectionsAllProducts;
      'sections.best-sellers': SectionsBestSellers;
      'sections.cart-main': SectionsCartMain;
      'sections.checkout-main': SectionsCheckoutMain;
      'sections.hero': SectionsHero;
      'sections.insta-block': SectionsInstaBlock;
      'sections.logos-slider': SectionsLogosSlider;
      'shared.all-product-item': SharedAllProductItem;
      'shared.best-seller-item': SharedBestSellerItem;
      'shared.link': SharedLink;
      'shared.logo-item': SharedLogoItem;
      'shared.product-category': SharedProductCategory;
      'shared.seo': SharedSeo;
    }
  }
}
