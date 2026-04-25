<template>
  <div class="cart-page">
    <SectionRenderer
      v-for="section in cartSections"
      :key="section.id || section.__component"
      :section="section"
    />
  </div>
</template>

<script setup lang="ts">
import type { CartMainSectionData, PageData, PageSection } from '~/types/content'

const fallbackSection: CartMainSectionData = {
  __component: 'sections.cart-main',
  enabled: true,
  title_prefix: 'My',
  title_accent: 'Cart',
  checkout_label: 'Proceed to secure checkout',
  empty_title: 'Your cart is empty.',
  empty_button_label: 'Continue Shopping',
  empty_button_url: '/',
  monthly_orders_text: '50,000+ Orders Last Month!',
}

const { data: page } = await useAsyncData<PageData | null>('cart-page', async () => {
  try {
    return await $fetch<PageData>('/api/pages/cart')
  } catch {
    return null
  }
})

const cartSections = computed<PageSection[]>(() => {
  return page.value?.sections?.length ? page.value.sections : [fallbackSection]
})

useSeoMeta({
  title: () => page.value?.seo?.metaTitle || page.value?.title || 'Cart - Particle',
  description: () => page.value?.seo?.metaDescription || 'Review your Particle cart.',
  robots: () => page.value?.seo?.noIndex ? 'noindex,nofollow' : 'noindex,follow',
})

useHead(() => ({
  link: page.value?.seo?.canonicalURL
    ? [
        {
          rel: 'canonical',
          href: page.value.seo.canonicalURL,
        },
      ]
    : [],
}))
</script>

