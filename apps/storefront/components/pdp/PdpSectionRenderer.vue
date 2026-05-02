<template>
  <PdpPageHeader
    v-if="section.__component === 'pdp.page-header'"
    :section="section"
  />
  <PdpScrollTabs
    v-else-if="section.__component === 'pdp.scroll-tabs'"
    :section="section"
  />
  <PdpBannerSection
    v-else-if="section.__component === 'pdp.banner-section'"
    :section="section"
  />
  <PdpHorizontalAccordion
    v-else-if="section.__component === 'pdp.horizontal-accordion'"
    :section="section"
  />
  <PdpPriceSection
    v-else-if="section.__component === 'pdp.price-section'"
    :section="section"
    :product="product"
  />
  <PdpCarouselSection
    v-else-if="section.__component === 'pdp.carousel-section'"
    :section="section"
  />
  <PdpAddToCartRegular
    v-else-if="section.__component === 'pdp.add-to-cart-regular'"
    :section="section"
    :product="product"
  />
  <PdpAddToCartTabs
    v-else-if="section.__component === 'pdp.add-to-cart-tabs'"
    :section="section"
    :product="product"
  />
  <PdpIngredientsAccordion
    v-else-if="section.__component === 'pdp.ingredients-accordion'"
    :section="section"
  />
  <PdpReviewsCarousel
    v-else-if="section.__component === 'pdp.reviews-carousel'"
    :section="section"
  />
  <PdpStampedReviews
    v-else-if="section.__component === 'pdp.stamped-reviews'"
    :section="section"
  />
  <PdpMoreProducts
    v-else-if="section.__component === 'pdp.more-products'"
    :section="section"
    :product="product"
  />
</template>

<script setup lang="ts">
import type { ProductData, ProductSection } from '~/types/content'

defineProps<{
  section: ProductSection
  product?: ProductData | null
}>()
</script>
