<template>
  <div
    v-if="text"
    class="announcement-bar"
  >
    <AppLink
      v-if="link?.url"
      class="announcement-bar__link"
      :to="link.url"
      :target="link.target"
    >
      {{ text }}
    </AppLink>
    <span v-else>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import type { LinkItem } from '~/types/content'

defineProps<{
  text?: string
  link?: LinkItem | null
}>()
</script>

<style scoped lang="scss">
.announcement-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: $topstrip-height;
  padding: 0 $space-4;
  color: $color-white;
  background: $color-topstrip;
  font-family: $font-ui;
  font-size: 15px;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
}

.announcement-bar__link {
  transition: color $transition-base;

  &:hover,
  &:focus-visible {
    color: $color-sky;
  }
}
</style>
