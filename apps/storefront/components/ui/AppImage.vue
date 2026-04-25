<template>
  <img
    v-if="src"
    :src="src"
    :alt="resolvedAlt"
    :loading="loading"
  >
</template>

<script setup lang="ts">
import type { StrapiMedia } from '~/types/content'

const props = withDefaults(defineProps<{
  image?: StrapiMedia | null
  alt?: string
  loading?: 'lazy' | 'eager'
}>(), {
  alt: '',
  loading: 'lazy',
})

const config = useRuntimeConfig()

const src = computed(() => {
  const url = props.image?.url

  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${config.public.strapiUrl || 'http://localhost:1337'}${url}`
})

const resolvedAlt = computed(() => {
  return props.image?.alternativeText || props.alt || ''
})
</script>
