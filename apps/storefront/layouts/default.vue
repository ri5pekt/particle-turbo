<template>
  <div class="site-shell">
    <TheHeader
      v-if="siteSettings"
      :settings="siteSettings"
    />
    <main class="site-shell__main">
      <slot />
    </main>
    <TheFooter
      v-if="siteSettings"
      :settings="siteSettings"
    />
  </div>
</template>

<script setup lang="ts">
const { data: siteSettings } = await useSiteSettings()
</script>

<style scoped lang="scss">
.site-shell {
  min-height: 100vh;
  background: $color-white;
}

.site-shell__main {
  display: flex;
  flex: auto;
  flex-direction: column;
  min-height: 60vh;
  padding-top: $main-padding-top;
}

@media (max-width: 481px) {
  .site-shell__main {
    padding-top: 98px;
  }
}
</style>
