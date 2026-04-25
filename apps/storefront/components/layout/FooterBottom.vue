<template>
  <div class="footer-bottom">
    <p
      v-if="copyright"
      class="footer-bottom__copyright"
    >
      {{ copyright }}
    </p>

    <ul
      v-if="legalLinks.length"
      class="footer-bottom__legal"
    >
      <li
        v-for="link in legalLinks"
        :key="link.id || link.label"
      >
        <AppLink
          v-if="link.url"
          :to="link.url"
          :target="link.target"
        >
          {{ link.label }}
        </AppLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { LinkItem } from '~/types/content'

withDefaults(defineProps<{
  copyright?: string
  legalLinks?: LinkItem[]
}>(), {
  copyright: '',
  legalLinks: () => [],
})
</script>

<style scoped lang="scss">
.footer-bottom {
  display: flex;
  justify-content: space-between;
}

.footer-bottom__legal {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-bottom__copyright,
.footer-bottom__legal a {
  color: $color-white;
  font-family: $font-ui;
  font-size: 17px;
  font-weight: 300;
  line-height: 155.2%;
  text-transform: capitalize;
  opacity: 0.6;
  transition: opacity 0.15s ease-in;
}

.footer-bottom__legal a:hover,
.footer-bottom__legal a:focus-visible {
  opacity: 1;
}

.footer-bottom__legal li:not(:first-child) a::before {
  margin: 0 13px;
  content: '|';
  opacity: 0.6;
}

@media (max-width: 992px) {
  .footer-bottom {
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
  }

  .footer-bottom__copyright,
  .footer-bottom__legal {
    width: 100%;
    justify-content: center;
    text-align: center;
  }
}

@media (max-width: 625px) {
  .footer-bottom__copyright,
  .footer-bottom__legal {
    display: none;
  }
}
</style>
