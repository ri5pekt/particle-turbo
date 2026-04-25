<template>
  <LogosSlider
    v-if="section.__component === 'sections.logos-slider'"
    :section="section"
  />
  <BestSellers
    v-else-if="section.__component === 'sections.best-sellers'"
    :section="section"
  />
  <AllProducts
    v-else-if="section.__component === 'sections.all-products'"
    :section="section"
  />
  <InstaBlock
    v-else-if="section.__component === 'sections.insta-block'"
    :section="section"
  />
  <CartMain
    v-else-if="section.__component === 'sections.cart-main'"
    :section="section"
  />
</template>

<script setup lang="ts">
import type { PageSection } from '~/types/content'

defineProps<{
  section: PageSection
}>()
</script>
