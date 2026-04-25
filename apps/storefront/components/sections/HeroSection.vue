<template>
  <section
    v-if="hero && hero.enabled !== false"
    class="hero-section"
  >
    <div class="hero-section__media">
      <video
        v-if="videoSrc"
        class="hero-section__video"
        autoplay
        muted
        loop
        playsinline
        :poster="imageSrc"
      >
        <source :src="videoSrc" type="video/mp4">
      </video>
      <img
        v-else-if="imageSrc"
        class="hero-section__image"
        :src="imageSrc"
        :alt="hero?.background_image?.alternativeText || ''"
      >
    </div>
    <div
      class="hero-section__overlay"
      :style="{ opacity: overlayOpacity }"
    />
    <div class="hero-section__content">
      <h1
        v-if="hero?.headline"
        class="hero-section__headline"
        v-html="hero.headline"
      />
      <AppLink
        v-if="hero?.cta?.url"
        class="hero-section__cta"
        :to="hero.cta.url"
        :target="hero.cta.target"
      >
        <AppButton>{{ hero.cta.label }}</AppButton>
      </AppLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroSectionData, StrapiMedia } from '~/types/content'

const props = defineProps<{
  hero?: HeroSectionData | null
}>()

const config = useRuntimeConfig()
const isMobile = useMediaQuery('(max-width: 576px)')

const mediaUrl = (media?: StrapiMedia | null) => {
  const url = media?.url

  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${config.public.strapiUrl || 'http://localhost:1337'}${url}`
}

const imageSrc = computed(() => mediaUrl(props.hero?.background_image))
const videoSrc = computed(() => {
  const media = isMobile.value
    ? props.hero?.mobile_video || props.hero?.background_video
    : props.hero?.background_video

  return mediaUrl(media)
})
const overlayOpacity = computed(() => {
  return 0.05
})
</script>

<style scoped lang="scss">
.hero-section {
  position: relative;
  display: flex;
  align-items: flex-end;
  height: 100vh;
  margin-top: -$main-padding-top;
  overflow: hidden;
  background: $color-hero-bg;
}

.hero-section__media,
.hero-section__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-section__media {
  z-index: 2;
}

.hero-section__video,
.hero-section__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
}

.hero-section__overlay {
  z-index: 2;
  background: #000;
}

.hero-section__content {
  position: relative;
  z-index: 3;
  display: grid;
  justify-items: start;
  max-width: 940px;
  gap: 0;
  padding-bottom: 60px;
  padding-left: 60px;
  text-align: left;
}

.hero-section__headline {
  color: $color-sky;
  font-family: $font-display;
  font-size: 94px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;

  :deep(strong) {
    font-weight: 400;
  }

  :deep(span) {
    display: block;
    color: $color-white;
    font-weight: 700;
  }
}

.hero-section__cta {
  margin-top: 40px;
}

@media only screen and (max-width: 1360px) {
  .hero-section__headline {
    font-size: 74px;
  }
}

@media only screen and (max-width: 950px) {
  .hero-section__content {
    padding-left: 30px;
  }
}

@media (max-width: 576px) {
  .hero-section {
    height: 100svh;
    margin-top: -98px;
  }

  .hero-section__headline {
    font-size: 60px;
  }

  .hero-section__cta {
    margin-top: 26px;

    :deep(.app-button) {
      min-width: 214px;
      min-height: 49px;
    }
  }
}
</style>
