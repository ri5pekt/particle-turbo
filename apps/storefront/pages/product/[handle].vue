<template>
  <div class="product-page">
    <PdpSectionRenderer
      v-for="(section, index) in product?.sections || []"
      :key="`${section.__component}-${section.id || index}`"
      :section="section"
      :product="product"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductData } from '~/types/content'

const route = useRoute()
const cart = useCart()
const handle = computed(() => String(route.params.handle || ''))

const { data: product, error } = await useAsyncData<ProductData>(
  () => `product-page-${handle.value}`,
  () => $fetch(`/api/products/${handle.value}`),
)

if (error.value) {
  throw createError(error.value)
}

useSeoMeta({
  title: () => product.value?.seo?.metaTitle || product.value?.title || 'Particle',
  description: () => product.value?.seo?.metaDescription || product.value?.subtitle || '',
  robots: () => product.value?.seo?.noIndex ? 'noindex,nofollow' : 'index,follow',
  ogImage: () => product.value?.seo?.ogImage?.url || product.value?.thumbnail?.url || '',
})

useHead(() => ({
  link: product.value?.seo?.canonicalURL
    ? [
        {
          rel: 'canonical',
          href: product.value.seo.canonicalURL,
        },
      ]
    : [],
}))

onMounted(() => {
  if (!product.value?.commerce?.purchasable) {
    return
  }

  window.setTimeout(() => {
    void cart.prepareCart()
  }, 250)
})
</script>
