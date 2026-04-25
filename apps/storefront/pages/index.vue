<template>
  <div class="home-page">
    <HeroSection :hero="page?.hero" />
    <SectionRenderer
      v-for="section in page?.sections || []"
      :key="section.id || section.__component"
      :section="section"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageData } from '~/types/content'

const { data: page, error } = await useAsyncData<PageData>('home-page', () => {
  return $fetch('/api/pages/home')
})

if (error.value) {
  throw createError(error.value)
}

useSeoMeta({
  title: () => page.value?.seo?.metaTitle || page.value?.title || 'Particle',
  description: () => page.value?.seo?.metaDescription || '',
  robots: () => page.value?.seo?.noIndex ? 'noindex,nofollow' : 'index,follow',
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
