<template>
  <section
    v-if="section.enabled !== false && videoSrc"
    class="landing-video"
  >
    <div class="landing-video__inner">
      <h2 class="landing-video__title">
        {{ section.title }}
      </h2>
      <video
        class="landing-video__player"
        :src="videoSrc"
        :poster="posterSrc || undefined"
        controls
        loop
        muted
        playsinline
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingVideoBlockSectionData, StrapiMedia } from '~/types/content'

const props = defineProps<{
  section: LandingVideoBlockSectionData
}>()

const config = useRuntimeConfig()
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

const videoSrc = computed(() => mediaUrl(props.section.video))
const posterSrc = computed(() => mediaUrl(props.section.poster))
</script>

<style scoped lang="scss">
.landing-video {
  width: 100%;
  padding: 80px 20px;
  margin-top: 50px;
  text-align: center;
  background: #fff;
}

.landing-video__inner {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.landing-video__title {
  margin: 0 0 40px;
  color: #0f0f0f;
  font-family: $font-body;
  font-size: 30px;
  font-weight: 700;
  line-height: 136%;
  text-align: center;
  text-transform: uppercase;
}

.landing-video__player {
  display: block;
  width: 100%;
  max-width: 100%;
  background: #000;
}

@media only screen and (max-width: 950px) {
  .landing-video {
    padding: 50px 20px;
    margin-top: 30px;
  }
}

@media (max-width: 820px) {
  .landing-video__title {
    font-size: 24px;
  }
}
</style>
