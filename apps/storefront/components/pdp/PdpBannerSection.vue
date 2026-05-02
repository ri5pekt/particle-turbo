<template>
  <section
    v-if="section.enabled !== false"
    class="banner-section"
    :class="`banner-section--${section.theme || 'gravite'}`"
  >
    <div class="inner">
      <picture>
        <source
          v-if="section.background_image_mobile_url"
          media="(max-width: 767px)"
          :srcset="section.background_image_mobile_url"
        >
        <img
          class="bg-img"
          :src="section.background_image_url"
          :alt="section.background_image_alt || section.background_image_mobile_alt || ''"
        >
      </picture>

      <div
        class="section-inner section"
        :class="{ 'section-inner-alternative': section.content_position !== 'bottom' }"
      >
        <div class="banner-content">
          <h2
            class="banner-title"
            v-html="displayTitle"
          />
          <div
            v-if="displayBody"
            class="banner-subtitle"
            v-html="displayBody"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PdpBannerSectionData } from '~/types/content'

const props = defineProps<{
  section: PdpBannerSectionData
}>()

const normalizeGraviteText = (value?: string | null) => {
  return (value || '')
    .replace(/Gravit(?:\\?|Ac|Ã©|e\\u0301|e)/g, 'Gravité')
    .replace(/men(?:\\?|\\?\\?|â€™|Ã¢Â€Â™)s/g, 'men’s')
}

const displayTitle = computed(() => normalizeGraviteText(props.section.title))
const displayBody = computed(() => normalizeGraviteText(props.section.body))
</script>

<style scoped lang="scss">
.section {
  max-width: 1300px;
  margin: 0 auto;
}

.banner-section {
  padding: 100px 0;
  color: #fff;
  background: #14161f;
}

h2,
h3,
h4 {
  color: #fff !important;
  font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
  font-weight: 400;
  text-transform: uppercase;
}

h2 {
  font-size: 50px;
  line-height: 1.25;
}

h3 {
  font-size: 24px;
}

:deep(p) {
  margin: 16px 0 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.5;

  &:first-child {
    margin-top: 0;
  }
}

:deep(a) {
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
}

.inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 740px;
  overflow: hidden;
}

picture {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.bg-img {
  width: 100%;
  height: 100%;
  max-height: 740px;
  object-fit: cover;
}

.section-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 100%;
}

.banner-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 473px;
  margin-bottom: 50px;
  color: #fff;
}

.section-inner-alternative {
  align-items: flex-start;

  .banner-content {
    max-width: 524px;
    margin-top: 60px;
    margin-bottom: 0;
  }
}

.banner-section--varros {
  padding: 0;
  color: #fff;
  background: #f1eee9;

  h2,
  h3,
  h4 {
    color: #fff !important;
    font-family: Raleway, Arial, sans-serif;
    font-weight: 700;
  }

  .banner-content {
    color: #fff;
  }
}

@media (max-width: 1310px) {
  .section {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .section-inner-alternative {
    align-items: flex-end;
  }

  .section-inner-alternative .banner-content {
    margin-top: 0;
    margin-bottom: 50px;
  }

  .section-inner-alternative .banner-subtitle {
    font-size: 14px;
    line-height: 21px;
  }
}

@media (max-width: 576px) {
  .banner-section {
    padding: 50px 0;
  }

  h2 {
    font-size: 40px;
    line-height: 1.2;
  }

  h3 {
    font-size: 16px;
  }

  :deep(p) {
    font-size: 16px;
    line-height: 1.5;
  }

  :deep(a) {
    font-size: 16px;
  }
}
</style>

<style lang="scss">
.banner-section--varros {
  .banner-title,
  .banner-subtitle,
  .banner-subtitle p,
  h2,
  h3,
  h4 {
    color: #fff !important;
  }
}
</style>
