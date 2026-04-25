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
      'pdp.add-to-cart-regular': PdpAddToCartRegular;
      'pdp.gallery-item': PdpGalleryItem;
      'pdp.guarantee-item': PdpGuaranteeItem;
      'pdp.purchase-option': PdpPurchaseOption;
      'sections.all-products': SectionsAllProducts;
      'sections.best-sellers': SectionsBestSellers;
      'sections.cart-main': SectionsCartMain;
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
