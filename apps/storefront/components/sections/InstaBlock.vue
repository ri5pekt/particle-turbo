<template>
  <section
    v-if="section.enabled !== false && videoSrc"
    class="insta-block"
  >
    <AppImage
      v-if="section.molecule_one"
      class="insta-block__molecule-one"
      :image="section.molecule_one"
      alt=""
    />
    <AppImage
      v-if="section.molecule_two"
      class="insta-block__molecule-two"
      :image="section.molecule_two"
      alt=""
    />

    <div class="insta-block__wrapper">
      <div class="insta-block__title">
        <div
          v-if="section.subtitle_html"
          class="insta-block__sub-title"
          v-html="section.subtitle_html"
        />
        <h2
          v-if="section.title_html"
          class="insta-block__heading"
          v-html="section.title_html"
        />
      </div>

      <video
        class="insta-block__video"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
      >
        <source :src="videoSrc" type="video/mp4">
      </video>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { InstaBlockSectionData, StrapiMedia } from '~/types/content'

const props = defineProps<{
  section: InstaBlockSectionData
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
</script>

<style scoped lang="scss">
.insta-block {
  position: relative;
  z-index: 0;
  overflow: visible;
}

.insta-block__molecule-one {
  position: absolute;
  top: -77px;
  left: 0;
  z-index: 0;
  pointer-events: none;
}

.insta-block__molecule-two {
  position: absolute;
  bottom: 140px;
  left: 33%;
  z-index: 0;
  pointer-events: none;
}

.insta-block__wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 1721px;
  gap: 155px;
  margin: 0 auto;
}

.insta-block__title {
  margin-top: 8%;
  margin-left: auto;
}

.insta-block__heading {
  color: $color-navy-mid;
  font-family: $font-heading;
  font-size: 130px;
  font-weight: 400;
  line-height: 92.7%;
  text-transform: uppercase;

  :deep(span) {
    display: block;
    font-weight: 900;
  }
}

.insta-block__sub-title {
  margin-bottom: 105px;
  color: #30312c;
  font-family: $font-body;
  font-size: 25px;
  font-weight: 200;
  line-height: 133.7%;
  text-transform: capitalize;

  :deep(span) {
    color: #58af70;
    font-weight: 700;
  }
}

.insta-block__video {
  width: auto;
  max-width: 750px;
  height: 100%;
  margin-left: auto;
}

@media (max-width: 1600px) {
  .insta-block__wrapper {
    padding: 0 20px;
  }

  .insta-block__heading {
    font-size: 90px;
  }
}

@media (max-width: 1440px) {
  .insta-block__heading {
    font-size: 75px;
  }

  .insta-block__video {
    width: 600px;
  }

  .insta-block__molecule-two {
    bottom: 55px;
    left: 20%;
  }
}

@media (max-width: 1140px) {
  .insta-block__video {
    width: 500px;
  }

  .insta-block__heading {
    font-size: 65px;
  }

  .insta-block__molecule-one {
    width: 150px;
  }
}

@media (max-width: 992px) {
  .insta-block__wrapper {
    flex-direction: column;
    gap: 90px;
  }

  .insta-block__title {
    margin-left: 0;
  }

  .insta-block__sub-title {
    margin-bottom: 40px;
  }

  .insta-block__video {
    width: 730px;
    margin-right: auto;
  }

  .insta-block__molecule-two {
    display: none;
  }
}

@media (max-width: 768px) {
  .insta-block__video {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .insta-block__heading {
    font-size: 45px;
  }

  .insta-block__molecule-one {
    display: none;
  }

  .insta-block__wrapper {
    align-items: flex-start;
    gap: 50px;
  }

  .insta-block__sub-title {
    display: none;
  }
}
</style>
