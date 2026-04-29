<template>
  <section
    v-if="section.enabled !== false && section.reviews?.length"
    class="slider-particle-men-v1 video-played-layout"
  >
    <div class="section-inner">
      <h2
        id="reviews-carousel-title-vp"
        class="title"
        v-html="section.title_html || 'Reviews of <span>Particle men</span>'"
      />
      <div
        class="slider-men-status sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ statusText }}
      </div>
      <ClientOnly>
        <Swiper
          class="slider-men-v1"
          role="region"
          aria-roledescription="carousel"
          aria-labelledby="reviews-carousel-title-vp"
          :modules="swiperModules"
          :slides-per-view="1"
          :space-between="32"
          :speed="1000"
          :autoplay="{ delay: section.autoplay_ms || 5500, disableOnInteraction: false }"
          :scrollbar="{ draggable: true }"
          :breakpoints="breakpoints"
          @slide-change="onSlideChange"
        >
          <SwiperSlide
            v-for="review in section.reviews"
            :key="review.id || review.name"
          >
            <article class="review">
              <div class="image">
                <video
                  v-if="review.video_url"
                  ref="videoRefs"
                  autoplay
                  muted
                  loop
                  playsinline
                  class="slider-video"
                >
                  <source :src="review.video_url" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
                <button
                  v-if="review.video_url"
                  class="button-vol btn-reset"
                  type="button"
                  :aria-label="mutedVideos[review.video_url] === false ? 'Mute video' : 'Unmute video'"
                  @click="toggleMute(review.video_url)"
                >
                  <img
                    src="/icons/unmute.svg"
                    alt=""
                    class="unmute"
                    :class="{ hidden: mutedVideos[review.video_url] === false }"
                  >
                  <img
                    src="/icons/mute.svg"
                    alt=""
                    class="mute"
                    :class="{ hidden: mutedVideos[review.video_url] !== false }"
                  >
                </button>
                <div
                  v-if="review.video_url"
                  class="video-progress"
                />
                <AppImage
                  v-else
                  :image="review.image"
                  :alt="review.image_alt || review.name || ''"
                />
              </div>
              <div class="text">
                <div
                  class="content"
                  v-html="review.quote"
                />
                <p class="name">
                  {{ review.name }}
                </p>
                <p class="about">
                  {{ review.about }}
                </p>
              </div>
            </article>
          </SwiperSlide>
        </Swiper>
        <template #fallback>
          <div class="slider-men-v1 slider-men-v1--fallback">
            <article
              v-for="review in section.reviews.slice(0, 3)"
              :key="review.id || review.name"
              class="review"
            >
              <div class="image">
                <AppImage
                  :image="review.image"
                  :alt="review.image_alt || review.name || ''"
                />
              </div>
              <div class="text">
                <div
                  class="content"
                  v-html="review.quote"
                />
                <p class="name">
                  {{ review.name }}
                </p>
                <p class="about">
                  {{ review.about }}
                </p>
              </div>
            </article>
          </div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Autoplay, Scrollbar } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import type { PdpReviewsCarouselSectionData } from '~/types/content'

import 'swiper/css'
import 'swiper/css/scrollbar'

const props = defineProps<{
  section: PdpReviewsCarouselSectionData
}>()

const swiperModules = [Autoplay, Scrollbar]
const breakpoints = {
  681: {
    slidesPerView: 2,
  },
  993: {
    slidesPerView: 3,
  },
}
const activeIndex = ref(0)
const mutedVideos = reactive<Record<string, boolean>>({})
const videoRefs = ref<HTMLVideoElement[]>([])

const statusText = computed(() => {
  const reviews = props.section.reviews || []
  const review = reviews[activeIndex.value]

  return review?.name
    ? `Review ${activeIndex.value + 1} of ${reviews.length}, ${review.name}`
    : ''
})

const onSlideChange = (swiper: SwiperInstance) => {
  activeIndex.value = swiper.activeIndex
}

const toggleMute = (videoUrl: string) => {
  const shouldUnmute = mutedVideos[videoUrl] !== false

  Object.keys(mutedVideos).forEach((key) => {
    mutedVideos[key] = true
  })

  mutedVideos[videoUrl] = !shouldUnmute

  videoRefs.value.forEach((video) => {
    video.muted = video.currentSrc !== videoUrl && video.src !== videoUrl
      ? true
      : !shouldUnmute
  })

  if (shouldUnmute) {
    window.setTimeout(() => {
      mutedVideos[videoUrl] = true
      const video = videoRefs.value.find((item) => item.currentSrc === videoUrl || item.src === videoUrl)
      if (video) {
        video.muted = true
      }
    }, 5500)
  }
}
</script>

<style scoped lang="scss">
.slider-particle-men-v1 {
  padding: 120px 20px 75px;
  background: #f5f5f5;
}

.section-inner {
  max-width: 1360px;
  margin: auto;
}

.title {
  margin: 0;
  color: #050446;
  font-family: $font-heading;
  font-size: 50px;
  font-style: normal;
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  text-transform: capitalize;

  :deep(span) {
    color: #0038b1;
  }
}

.slider-men-v1 {
  margin-top: 60px;
  overflow: hidden;

  :deep(.swiper-slide) {
    height: auto;
  }

  :deep(.swiper-scrollbar) {
    position: static;
    margin-top: 50px;
  }

  :deep(.swiper-scrollbar-drag) {
    background: #0038b1;
    cursor: pointer;
  }
}

.slider-men-v1--fallback {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.review {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image {
  position: relative;
  width: 100%;
  height: 475px;
  background: #e7e7e7;

  > :deep(img),
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
  }
}

.video-progress {
  position: absolute;
  z-index: 9;
  bottom: 0;
  left: 0;
  display: none;
  width: 0%;
  height: 6px;
  background: #0038b1;
}

.button-vol {
  position: absolute;
  z-index: 9;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 100%;
  background: rgb(0 0 0 / 30%);
  backdrop-filter: blur(15px);
  cursor: pointer;
  transform: translateX(-50%) translateY(-50%);

  &:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 3px;
  }

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
}

.unmute,
.mute {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.hidden {
  display: none;
}

.text {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: 32px;
  background: #fff;
  line-height: 1.5;

  p {
    font-size: inherit;
  }
}

.content {
  flex-grow: 1;
  color: #050446;
  font-family: $font-heading;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;

  :deep(p) {
    margin: 0;
  }
}

.name {
  margin: 24px 0 0;
  color: #0038b1;
  font-family: $font-heading;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
}

.about {
  margin: 5px 0 0;
  color: #050446;
  font-family: $font-heading;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
}

@media only screen and (max-width: 950px) {
  .slider-particle-men-v1 {
    padding-top: 70px;
  }

  .title {
    font-size: 40px;
  }

  .slider-men-v1 {
    margin-top: 40px;
  }

  .slider-men-v1--fallback {
    grid-template-columns: 1fr;
  }

  .image {
    height: 360px;
  }

  .text {
    padding: 16px;
  }

  .content,
  .name {
    font-size: 18px;
  }

  .name {
    margin-top: 18px;
  }
}
</style>
