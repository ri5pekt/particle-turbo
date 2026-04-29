<template>
  <main class="all-products-page">
    <AllProducts
      v-if="allProductsSection"
      :section="allProductsSection"
    />
  </main>
</template>

<script setup lang="ts">
import type { AllProductsSectionData, PageData } from '~/types/content'

const { data: page, error } = await useAsyncData<PageData>('all-products-page-home-source', () => {
  return $fetch('/api/pages/home')
})

if (error.value) {
  throw createError(error.value)
}

const allProductsSection = computed(() => {
  return page.value?.sections?.find((section): section is AllProductsSectionData => {
    return section.__component === 'sections.all-products'
  }) || null
})

if (!allProductsSection.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'All Products section was not found on the home page.',
  })
}

useSeoMeta({
  title: () => `All Products | ${page.value?.title || 'Particle'}`,
  description: () => page.value?.seo?.metaDescription || 'Browse all Particle products.',
  robots: () => page.value?.seo?.noIndex ? 'noindex,nofollow' : 'index,follow',
})
</script>

<style scoped lang="scss">
.all-products-page {
  background: #fff;
}
</style>
