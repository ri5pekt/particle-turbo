<template>
  <section class="footer-column site-footer__box">
    <h2 class="footer-column__heading">{{ column.heading }}</h2>
    <ul
      v-if="column.links?.length"
      class="footer-column__links"
    >
      <li
        v-for="link in column.links"
        :key="link.id || link.label"
      >
        <AppLink
          v-if="link.url"
          class="footer-column__link"
          :to="link.url"
          :target="link.target"
        >
          {{ link.label }}
        </AppLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { FooterColumn } from '~/types/content'

defineProps<{
  column: FooterColumn
}>()
</script>

<style scoped lang="scss">
.footer-column {
  display: block;
}

.footer-column__heading {
  max-width: 153px;
  color: $color-white;
  font-family: $font-ui;
  font-size: 22px;
  font-weight: 600;
  line-height: 133.7%;
  text-transform: capitalize;
}

.footer-column__links {
  margin: 12px 0 0;
}

.footer-column__link {
  color: $color-white;
  font-family: $font-ui;
  font-size: 17px;
  font-weight: 300;
  line-height: 155.2%;
  text-transform: capitalize;
  opacity: 0.7;
  transition: opacity 0.15s ease-in;

  &:hover,
  &:focus-visible {
    opacity: 1;
  }
}
</style>
