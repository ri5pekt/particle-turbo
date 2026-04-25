<template>
  <section
    v-if="section.enabled !== false && logos.length"
    class="logos-slider"
    aria-label="Featured logos"
  >
    <div class="logos-slider__inner">
      <div class="logos-slider__track">
        <AppLink
          v-for="(logo, index) in repeatedLogos"
          :key="`${logo.id || logo.alt}-${index}`"
          class="logos-slider__item"
          :to="logo.url || '#'"
          :aria-label="logo.alt"
        >
          <AppImage
            :image="logo.image"
            :alt="logo.alt || ''"
          />
        </AppLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LogosSliderSectionData } from '~/types/content'

const props = defineProps<{
  section: LogosSliderSectionData
}>()

const logos = computed(() => props.section.logos?.filter((logo) => logo.image) || [])
const repeatedLogos = computed(() => [...logos.value, ...logos.value])
</script>

<style scoped lang="scss">
.logos-slider {
  position: relative;
  overflow: hidden;
  direction: ltr;
}

.logos-slider__inner {
  position: relative;
  padding: 50px 0;
  overflow: hidden;
  background: $color-white;
  box-shadow:
    6px 9px 30px 0 rgb(40 32 71 / 5%),
    4px -14px 10px 0 rgb(163 163 176 / 2%),
    0 4px 4px 0 rgb(255 255 255 / 46%) inset;

  &::before,
  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    width: 235px;
    pointer-events: none;
    content: '';
  }

  &::before {
    left: -35px;
    background: linear-gradient(to right, white, white 15%, transparent);
  }

  &::after {
    right: -35px;
    background: linear-gradient(to left, white, white 15%, transparent);
  }
}

.logos-slider__track {
  display: flex;
  align-items: center;
  white-space: nowrap;
  width: max-content;
  pointer-events: none;
  animation: logo-scroll 20s linear infinite;
}

.logos-slider__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 20px;
  filter: grayscale(1);
  opacity: 0.3;

  :deep(img) {
    max-height: 52px;
    object-fit: contain;
  }
}

@keyframes logo-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 950px) {
  .logos-slider__inner {
    padding-top: 35px;
    padding-bottom: 35px;

    &::before,
    &::after {
      width: 80px;
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }

  .logos-slider__item {
    margin: 0 20px;

    :deep(img) {
      height: 25px;
    }
  }
}
</style>
