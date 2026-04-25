<template>
  <PdpAddToCartRegular
    v-if="section.__component === 'pdp.add-to-cart-regular'"
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
