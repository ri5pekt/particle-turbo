<template>
  <section
    v-if="section.enabled !== false && images.length"
    class="carousel-section"
    :class="`carousel-section--${section.theme || 'gravite'}`"
  >
    <h2
      v-if="section.title"
      class="carousel-title section"
    >
      {{ displayTitle }}
    </h2>

    <ClientOnly>
      <Swiper
        class="deodoGallerySwiper"
        :modules="swiperModules"
        :slides-per-view="4"
        :space-between="30"
        :loop="true"
        :speed="900"
        :autoplay="{ delay: section.autoplay_ms || 2000 }"
        :breakpoints="breakpoints"
        @swiper="onSwiper"
      >
        <SwiperSlide
          v-for="(image, index) in images"
          :key="image.id || index"
        >
          <img
            :src="image.url"
            :alt="normalizeGraviteText(image.alt)"
          >
        </SwiperSlide>
      </Swiper>
      <template #fallback>
        <div class="deodoGallerySwiper deodoGallerySwiper--fallback">
          <div
            v-for="(image, index) in images.slice(0, 4)"
            :key="image.id || index"
            class="swiper-slide"
          >
            <img
              :src="image.url"
              :alt="normalizeGraviteText(image.alt)"
            >
          </div>
        </div>
      </template>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import type { PdpCarouselSectionData } from '~/types/content'

import 'swiper/css'

const props = defineProps<{
  section: PdpCarouselSectionData
}>()

const swiperModules = [Autoplay]
const breakpoints = {
  0: {
    slidesPerView: 2,
  },
  620: {
    slidesPerView: 3,
  },
  992: {
    slidesPerView: 4,
  },
}

const images = computed(() => props.section.images?.filter((image) => image.url) || [])

const normalizeGraviteText = (value?: string | null) => {
  return (value || '')
    .replace(/Gravit(?:\\?|Ac|Ã©|e\\u0301|e)/g, 'Gravité')
    .replace(/men(?:\\?|\\?\\?|â€™|Ã¢Â€Â™)s/g, 'men’s')
}

const displayTitle = computed(() => normalizeGraviteText(props.section.title))

const onSwiper = (swiper: SwiperInstance) => {
  if (swiper.wrapperEl) {
    swiper.wrapperEl.style.transitionTimingFunction = 'cubic-bezier(0.25, 1, 0.5, 1)'
  }
}
</script>

<style scoped lang="scss">
.section {
  max-width: 1300px;
  margin: 0 auto;
}

.carousel-section {
  padding: 100px 0;
  color: #fff;
  background: #14161f;
}

.carousel-title {
  margin-bottom: 35px;
  font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 48px;
  text-transform: uppercase;
}

.deodoGallerySwiper {
  overflow: hidden;
}

.swiper-slide {
  height: 465px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.deodoGallerySwiper--fallback {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 30px;
}

.carousel-section--varros {
  color: #100f0d;
  background: #f1eee9;

  .carousel-title {
    font-family: Raleway, Arial, sans-serif;
    font-weight: 700;
  }
}

@media (max-width: 1310px) {
  .section {
    padding: 0 20px;
  }
}

@media (max-width: 576px) {
  .carousel-title {
    font-size: 24px;
    line-height: 32px;
  }
}

@media (max-width: 481px) {
  .swiper-slide {
    height: 280px;
  }

  .deodoGallerySwiper--fallback {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
