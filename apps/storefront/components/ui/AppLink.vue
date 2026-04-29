<template>
  <NuxtLink
    v-if="isRoutableInternal"
    v-bind="attrs"
    :to="href"
  >
    <slot />
  </NuxtLink>
  <a
    v-else
    v-bind="attrs"
    :href="href"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  to?: string
  target?: '_self' | '_blank'
}>(), {
  to: '/',
  target: '_self',
})

const attrs = useAttrs()

const href = computed(() => {
  return props.to.replace(/^\/products\//, '/product/')
})

const isRoutableInternal = computed(() => {
  return href.value === '/'
    || href.value === '/cart'
    || href.value.startsWith('/lpage/')
    || href.value.startsWith('/product/')
})
</script>
