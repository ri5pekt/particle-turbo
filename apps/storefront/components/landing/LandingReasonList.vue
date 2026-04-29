<template>
  <section
    v-if="section.enabled !== false && items.length"
    class="landing-reasons"
  >
    <div class="landing-reasons__inner">
      <article
        v-for="item in items"
        :key="item.id || item.number"
        class="landing-reasons__item"
      >
        <div class="landing-reasons__number">
          {{ item.number }}
        </div>

        <div class="landing-reasons__media">
          <div
            v-if="item.gallery?.length"
            class="landing-reasons__gallery"
          >
            <ClientOnly>
              <Swiper
                class="landing-reasons__swiper"
                :modules="swiperModules"
                :slides-per-view="1"
                :navigation="true"
                :pagination="{ clickable: true }"
                :loop="item.gallery.length > 1"
              >
                <SwiperSlide
                  v-for="galleryItem in item.gallery"
                  :key="galleryItem.id || galleryItem.image?.url"
                >
                  <AppImage
                    class="landing-reasons__gallery-image"
                    :image="galleryItem.image"
                    :alt="galleryItem.alt || item.title || ''"
                  />
                </SwiperSlide>
              </Swiper>
              <template #fallback>
                <AppImage
                  class="landing-reasons__gallery-image"
                  :image="item.gallery[0]?.image"
                  :alt="item.gallery[0]?.alt || item.title || ''"
                />
              </template>
            </ClientOnly>
          </div>
          <AppImage
            v-else
            class="landing-reasons__image"
            :image="item.image"
            :alt="item.alt || item.title || ''"
          />
        </div>

        <div class="landing-reasons__content">
          <h2 class="landing-reasons__title">
            {{ item.title }}
          </h2>
          <div
            v-if="item.body_html"
            class="landing-reasons__body"
            v-html="item.body_html"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { LandingReasonListSectionData } from '~/types/content'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps<{
  section: LandingReasonListSectionData
}>()

const items = computed(() => props.section.items?.filter((item) => item.title) || [])
const swiperModules = [Navigation, Pagination]
</script>

<style scoped lang="scss">
.landing-reasons {
  padding: 0 0 60px;
  background: $color-white;
}

.landing-reasons__inner {
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
  gap: 70px;
}

.landing-reasons__item {
  position: relative;
  display: flex;
  align-items: stretch;
  padding: 0;

  &:nth-child(even) {
    flex-direction: row-reverse;

    .landing-reasons__number {
      right: auto;
      left: 25%;
    }

    .landing-reasons__media {
      border-radius: 0 5px 5px 0;
    }

    .landing-reasons__content {
      border-radius: 5px 0 0 5px;
    }
  }
}

.landing-reasons__number {
  position: absolute;
  top: -13px;
  right: 25%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 46px;
  padding: 0 0 3px;
  border-radius: 100%;
  color: $color-white;
  font-family: $font-body;
  font-size: 30px;
  font-weight: 500;
  line-height: 30px;
  background: #0038b1;
}

.landing-reasons__media {
  width: 50%;
  height: 450px;
  overflow: hidden;
  border-radius: 5px 0 0 5px;
  background: #ecf0f4;
}

.landing-reasons__image {
  display: block;
  width: 100%;
  height: 450px;
  object-fit: cover;
}

.landing-reasons__gallery {
  position: relative;
  width: 100%;
  height: 450px;
  overflow: hidden;
}

.landing-reasons__swiper {
  width: 100%;
  height: 100%;
}

.landing-reasons__gallery-image {
  width: 100%;
  height: 450px;
  object-fit: cover;
}

.landing-reasons__gallery {
  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    top: 45%;
    width: 50px;
    height: 75px;
    color: #fff;

    &::after {
      font-size: 25px;
      font-weight: 900;
    }
  }

  :deep(.swiper-button-prev) {
    left: 3%;
  }

  :deep(.swiper-button-next) {
    right: 3%;
  }

  :deep(.swiper-pagination) {
    bottom: 15px;
    display: none;
  }

  :deep(.swiper-pagination-bullet) {
    width: 12px;
    height: 12px;
    background: #cfd8e6;
    opacity: 1;
  }

  :deep(.swiper-pagination-bullet-active) {
    background: #0038af;
  }
}

.landing-reasons__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  padding: 20px 20px 20px 40px;
  border-radius: 0 5px 5px 0;
  background: #ecf0f4;
}

.landing-reasons__title {
  margin: 0 0 15px;
  color: #0f0f0f;
  font-family: $font-body;
  font-size: 25px;
  font-weight: 600;
  line-height: 136%;
}

.landing-reasons__body {
  margin: 0;
  color: #000;
  font-family: $font-body;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;

  :deep(p),
  :deep(ol),
  :deep(ul) {
    margin: 0 0 10px;
    padding: 0;
    color: #000;
    font-size: 18px;
    line-height: 24px;
  }

  :deep(ol),
  :deep(ul) {
    list-style: none;
  }

  :deep(li) {
    position: relative;
    padding: 10px 0 10px 30px;
    list-style: none;

    &::before {
      position: absolute;
      top: 17px;
      left: 0;
      width: 14px;
      height: 9px;
      border-bottom: 3px solid #0038b1;
      border-left: 3px solid #0038b1;
      content: '';
      transform: rotate(-45deg);
    }
  }
}

@media (max-width: 1024px) {
  .landing-reasons__inner {
    max-width: 91%;
  }
}

@media (max-width: 620px) {
  .landing-reasons__inner {
    gap: 70px;
  }

  .landing-reasons__item {
    flex-direction: column-reverse;

    &:nth-child(even) {
      flex-direction: column-reverse;

      .landing-reasons__number {
        right: auto;
        left: 46%;
      }
    }
  }

  .landing-reasons__media {
    width: 100%;
    height: auto;
    border-radius: 0 !important;
  }

  .landing-reasons__image,
  .landing-reasons__gallery,
  .landing-reasons__gallery-image {
    height: auto;
    min-height: 320px;
  }

  .landing-reasons__gallery {
    height: 320px;
  }

  .landing-reasons__gallery-image {
    height: 320px;
  }

  .landing-reasons__gallery {
    :deep(.swiper-button-prev),
    :deep(.swiper-button-next) {
      display: none;
    }
  }

  .landing-reasons__gallery {
    :deep(.swiper-pagination) {
      display: block;
    }
  }

  .landing-reasons__gallery {
    :deep(.swiper-pagination-bullets.swiper-pagination-horizontal) {
      bottom: 15px;
    }
  }

  .landing-reasons__gallery {
    :deep(.swiper-pagination-bullet) {
      display: inline-block;
    }
  }

  .landing-reasons__gallery-dots {
    display: none;
  }

  .landing-reasons__content {
    width: 100%;
    padding: 30px 20px 20px 40px;
    border-radius: 0 !important;
  }

  .landing-reasons__number {
    top: -13px;
    right: 46%;
    width: 33px;
    height: 31px;
    padding: 0 0 2px;
    font-size: 21px;
    line-height: 21px;
  }

  .landing-reasons__title {
    font-size: 20px;
  }
}
</style>
