<template>
  <NuxtLink
    v-if="isInternal"
    v-bind="attrs"
    :to="to"
  >
    <slot />
  </NuxtLink>
  <a
    v-else
    v-bind="attrs"
    :href="to"
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

const isInternal = computed(() => {
  return props.to.startsWith('/') || props.to.startsWith('#')
})
</script>
