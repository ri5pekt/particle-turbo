import type { Schema, Struct } from '@strapi/strapi';

export interface GlobalFooter extends Struct.ComponentSchema {
  collectionName: 'components_global_footers';
  info: {
    description: 'Global footer configuration. Link columns are managed via the Navigation collection (identifiers: footer-particle, footer-products, footer-bundles, footer-legal).';
    displayName: 'Footer';
    icon: 'layout';
  };
  attributes: {
    copyright_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'\u00A9 Particle. All Rights Reserved'>;
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
    transparent_on_home: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: 'Full-viewport hero with background video, fallback image, HTML headline, and CTA button.';
    displayName: 'Home Page Hero';
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
    image: Schema.Attribute.Media<'images'>;
    is_section_heading: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Meta title, description, OG image, canonical URL';
    displayName: 'SEO Settings';
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
      'global.footer': GlobalFooter;
      'global.header': GlobalHeader;
      'sections.hero': SectionsHero;
      'shared.link': SharedLink;
      'shared.nav-item': SharedNavItem;
      'shared.seo': SharedSeo;
      'shared.video-pair': SharedVideoPair;
    }
  }
}
