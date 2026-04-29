<template>
  <div class="landing-page-shell landing-page red elementor-template">
    <TheHeader
      v-if="page?.show_header !== false && siteSettings"
      :settings="siteSettings"
    />
    <main class="landing-page-shell__main landing-page_wrapper">
      <LandingSectionRenderer
        v-for="section in page?.sections || []"
        :key="section.id || section.__component"
        :section="section"
      />
    </main>
    <TheFooter
      v-if="page?.show_footer !== false && siteSettings"
      :settings="siteSettings"
    />
  </div>
</template>

<script setup lang="ts">
import type { LandingPageData } from '~/types/content'

definePageMeta({
  layout: false,
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data: page, error } = await useAsyncData<LandingPageData>(
  () => `landing-page-${slug.value}`,
  () => $fetch(`/api/landing-pages/${slug.value}`),
)
const { data: siteSettings } = await useSiteSettings()

if (error.value) {
  throw createError(error.value)
}

useSeoMeta({
  title: () => page.value?.seo?.metaTitle || page.value?.title || 'Particle',
  description: () => page.value?.seo?.metaDescription || '',
  robots: () => page.value?.seo?.noIndex ? 'noindex,nofollow' : 'index,follow',
  ogImage: () => page.value?.seo?.ogImage?.url || '',
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

<style scoped lang="scss">
.landing-page-shell {
  min-height: 100vh;
  background: $color-white;
}

.landing-page-shell__main {
  display: flex;
  flex-direction: column;
}
</style>
