import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsBeforeAfter extends Struct.ComponentSchema {
  collectionName: 'components_sections_before_afters';
  info: {
    description: 'Side-by-side or slider comparison of before and after images';
    displayName: 'Before / After';
    icon: 'collapse';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    after_image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    after_label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'After'>;
    before_image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    before_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Before'>;
    caption: Schema.Attribute.Text;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsBenefits extends Struct.ComponentSchema {
  collectionName: 'components_sections_benefits';
  info: {
    description: 'A grid or row of benefit items with icons';
    displayName: 'Benefits';
    icon: 'star';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'shared.benefit-item', true>;
    layout: Schema.Attribute.Enumeration<['grid', 'row']> &
      Schema.Attribute.DefaultTo<'grid'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_banners';
  info: {
    description: 'Full-width call-to-action banner with headline and button';
    displayName: 'CTA Banner';
    icon: 'expand';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    background_color: Schema.Attribute.String;
    background_image: Schema.Attribute.Media<'images'>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    subheadline: Schema.Attribute.Text;
  };
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_faqs';
  info: {
    description: 'Accordion-style FAQ section';
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'shared.faq-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: 'Full-viewport hero with background video, fallback image, richtext headline, and CTA button.';
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    background_video: Schema.Attribute.Component<'shared.video-pair', false>;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    headline: Schema.Attribute.RichText & Schema.Attribute.Required;
    placeholder_image: Schema.Attribute.Media<'images'>;
  };
}

export interface SectionsHowToUse extends Struct.ComponentSchema {
  collectionName: 'components_sections_how_to_uses';
  info: {
    description: 'Numbered steps showing how to use a product or follow a process';
    displayName: 'How To Use';
    icon: 'layer';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    steps: Schema.Attribute.Component<'shared.step', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsIngredients extends Struct.ComponentSchema {
  collectionName: 'components_sections_ingredients';
  info: {
    description: 'Key ingredients list with icon, name, and description';
    displayName: 'Ingredients';
    icon: 'leaf';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    intro: Schema.Attribute.RichText;
    items: Schema.Attribute.Component<'shared.benefit-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsProductShowcase extends Struct.ComponentSchema {
  collectionName: 'components_sections_product_showcases';
  info: {
    description: 'Display a curated set of products by their Medusa handle. Nuxt resolves the handles to live product data at render time.';
    displayName: 'Product Showcase';
    icon: 'shoppingCart';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    layout: Schema.Attribute.Enumeration<['grid', 'carousel']> &
      Schema.Attribute.DefaultTo<'grid'>;
    medusa_handles: Schema.Attribute.Text;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_texts';
  info: {
    description: 'A free-form rich text block \u2014 use for editorial copy, terms, policies, etc.';
    displayName: 'Rich Text';
    icon: 'pencil';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    max_width: Schema.Attribute.Enumeration<['narrow', 'normal', 'wide']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface SectionsTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonials';
  info: {
    description: 'Customer reviews displayed as a grid or carousel';
    displayName: 'Testimonials';
    icon: 'quote';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    items: Schema.Attribute.Component<'shared.testimonial', true>;
    layout: Schema.Attribute.Enumeration<['grid', 'carousel']> &
      Schema.Attribute.DefaultTo<'carousel'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsTextImage extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_images';
  info: {
    description: 'Side-by-side text block and image, with layout toggle';
    displayName: 'Text + Image';
    icon: 'landscape';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.link', false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    layout: Schema.Attribute.Enumeration<['image_left', 'image_right']> &
      Schema.Attribute.DefaultTo<'image_right'>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsVideo extends Struct.ComponentSchema {
  collectionName: 'components_sections_videos';
  info: {
    description: 'Embedded video section \u2014 YouTube, Vimeo, or hosted';
    displayName: 'Video';
    icon: 'play';
  };
  attributes: {
    ab_test_key: Schema.Attribute.String;
    ab_test_value: Schema.Attribute.String;
    autoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    loop: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    poster: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedBenefitItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_benefit_items';
  info: {
    description: 'A single benefit with icon, headline, and body text. Reused across benefits, ingredients, and how-to sections.';
    displayName: 'Benefit Item';
    icon: 'star';
  };
  attributes: {
    body: Schema.Attribute.Text;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'A single question and answer pair';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: 'A navigation menu item with optional dropdown children';
    displayName: 'Nav Item';
    icon: 'bulletList';
  };
  attributes: {
    children: Schema.Attribute.Component<'shared.link', true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
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

export interface SharedStep extends Struct.ComponentSchema {
  collectionName: 'components_shared_steps';
  info: {
    description: 'A numbered step in a how-to or process section';
    displayName: 'Step';
    icon: 'layer';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    step_number: Schema.Attribute.Integer;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_shared_testimonials';
  info: {
    description: 'A customer review or quote';
    displayName: 'Testimonial';
    icon: 'quote';
  };
  attributes: {
    author: Schema.Attribute.String & Schema.Attribute.Required;
    avatar: Schema.Attribute.Media<'images'>;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    rating: Schema.Attribute.Integer;
    role: Schema.Attribute.String;
    verified: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedVideoPair extends Struct.ComponentSchema {
  collectionName: 'components_shared_video_pairs';
  info: {
    description: 'Desktop and mobile video files for background hero sections';
    displayName: 'Background Video';
    icon: 'play';
  };
  attributes: {
    desktop: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
    mobile: Schema.Attribute.Media<'videos'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.before-after': SectionsBeforeAfter;
      'sections.benefits': SectionsBenefits;
      'sections.cta-banner': SectionsCtaBanner;
      'sections.faq': SectionsFaq;
      'sections.hero': SectionsHero;
      'sections.how-to-use': SectionsHowToUse;
      'sections.ingredients': SectionsIngredients;
      'sections.product-showcase': SectionsProductShowcase;
      'sections.rich-text': SectionsRichText;
      'sections.testimonials': SectionsTestimonials;
      'sections.text-image': SectionsTextImage;
      'sections.video': SectionsVideo;
      'shared.benefit-item': SharedBenefitItem;
      'shared.faq-item': SharedFaqItem;
      'shared.link': SharedLink;
      'shared.nav-item': SharedNavItem;
      'shared.seo': SharedSeo;
      'shared.step': SharedStep;
      'shared.testimonial': SharedTestimonial;
      'shared.video-pair': SharedVideoPair;
    }
  }
}
