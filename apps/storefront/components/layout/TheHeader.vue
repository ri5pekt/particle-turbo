<template>
  <header
    class="site-header"
    :class="{ 'site-header--scrolled': isScrolled }"
  >
    <AnnouncementBar
      :text="settings.announcement_bar_text"
      :link="settings.announcement_bar_link"
    />
    <NavBar
      :settings="settings"
      :scrolled="isScrolled"
    />
  </header>
</template>

<script setup lang="ts">
import type { SiteSettings } from '~/types/content'

defineProps<{
  settings: SiteSettings
}>()

const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 40)
</script>

<style scoped lang="scss">
.site-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 180;
  width: 100%;
  background-color: $color-navy-deep;
  transition:
    all 0.2s ease-in-out;
}

.site-header--scrolled {
  top: -$topstrip-height;
  background-color: $color-navy-deep;
  box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
}
</style>
