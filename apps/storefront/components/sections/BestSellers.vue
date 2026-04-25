<template>
  <section
    v-if="section.enabled !== false && items.length"
    class="best-sellers section-container"
  >
    <div class="best-sellers__inner section-inner">
      <h2 class="best-sellers__title section-title">
        {{ section.title || 'Best Sellers' }}
      </h2>
      <div class="best-sellers__boxes">
        <div
          v-for="(item, index) in items"
          :key="item.id || item.title_html"
          class="best-sellers__box box-product-index"
          :class="[
            `best-sellers__box--${item.hover_effect || 'none'}`,
            { 'best-sellers__box--second': index === 1 },
            { 'best-sellers__box--third': index === 2 },
            { 'best-sellers__box--fourth': index === 3 },
          ]"
        >
          <AppLink
            class="best-sellers__card"
            :to="item.url || '#'"
            :aria-label="`Discover ${stripHtml(item.title_html || '')}`"
          >
            <div class="best-sellers__image">
              <AppImage
                v-if="item.back_image"
                class="best-sellers__image-layer best-sellers__image-layer--back"
                :image="item.back_image"
                :alt="item.alt || ''"
              />
              <AppImage
                class="best-sellers__image-layer best-sellers__image-layer--main"
                :image="item.main_image"
                :alt="item.alt || stripHtml(item.title_html || '')"
              />
              <AppImage
                v-if="item.front_image"
                class="best-sellers__image-layer best-sellers__image-layer--front"
                :image="item.front_image"
                :alt="item.alt || ''"
              />
              <AppImage
                v-if="item.mobile_image"
                class="best-sellers__image-layer best-sellers__image-layer--mobile"
                :image="item.mobile_image"
                :alt="item.alt || stripHtml(item.title_html || '')"
              />
            </div>
            <div class="best-sellers__text">
              <div class="best-sellers__product-title">
                <p class="best-sellers__pre-title">{{ item.pre_title }}</p>
                <p
                  class="best-sellers__main-title"
                  v-html="item.title_html"
                />
              </div>
              <div class="best-sellers__description">
                <p>{{ item.description }}</p>
              </div>
              <div class="best-sellers__button">
                <span>{{ item.button_label || 'Discover' }}</span>
                <img src="/icons/arrow-right.svg" alt="">
              </div>
            </div>
          </AppLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BestSellersSectionData } from '~/types/content'

const props = defineProps<{
  section: BestSellersSectionData
}>()

const items = computed(() => props.section.items?.filter((item) => item.main_image?.url) || [])
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '')
</script>

<style scoped lang="scss">
.best-sellers {
  position: relative;
  padding: 70px 0;
}

.best-sellers__inner {
  position: relative;
  max-width: $section-inner-max;
  margin: auto;
  padding: 0 20px;
}

.best-sellers__title {
  color: $color-navy;
  font-family: $font-heading;
  font-size: 50px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
}

.best-sellers__boxes {
  display: flex;
  flex-wrap: wrap;
  margin: -16px;
  margin-top: 70px;
}

.best-sellers__box {
  width: 25%;
  padding: 16px;
}

.best-sellers__card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 385px;
  padding: 40px 30px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.5s;
  -webkit-tap-highlight-color: transparent;
}

.best-sellers__image {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 330px;
  margin-bottom: -25px;
  font-size: 0;
}

.best-sellers__image-layer {
  position: relative;
  width: auto;
  max-width: none;
  pointer-events: none;
  transition:
    opacity 0.5s,
    transform 0.5s;
}

.best-sellers__image-layer--back,
.best-sellers__image-layer--front {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.best-sellers__image-layer--back {
  z-index: 1;
  opacity: 0;
  mix-blend-mode: multiply;
}

.best-sellers__image-layer--main {
  z-index: 2;
  max-height: 122%;
}

.best-sellers__image-layer--front {
  z-index: 3;
  opacity: 0;
}

.best-sellers__image-layer--mobile {
  display: none;
}

.best-sellers__text {
  position: relative;
  z-index: 9;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.best-sellers__product-title {
  position: relative;
  color: $color-navy-mid;
  font-family: $font-body;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;

  &::after {
    position: relative;
    display: block;
    width: 132px;
    height: 2px;
    margin: 10px auto;
    background: $color-navy-mid;
    content: '';
  }
}

.best-sellers__pre-title {
  font-size: 16px;
  font-weight: 500;
}

.best-sellers__main-title {
  font-size: 32px;
  font-weight: 400;

  :deep(strong) {
    font-weight: 900;
  }
}

.best-sellers__description {
  flex-grow: 1;
  color: $color-navy-mid;
  font-family: $font-body;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;

  p {
    margin-top: 15px;
    font-size: 16px;
  }
}

.best-sellers__button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  margin: auto;
  margin-top: 30px;
  padding: 18px 25px;
  border: 1px solid $color-navy-mid;
  border-radius: 7px;
  color: $color-navy-mid;
  font-family: $font-body;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  text-transform: uppercase;
  transition:
    background-color 0.5s,
    color 0.5s;

  img {
    margin-left: 10px;
    transition: filter 0.5s;
  }
}

@media only screen and (min-width: 950px) {
  .best-sellers__card:hover {
    background: #d0e0cd;

    .best-sellers__image-layer--back,
    .best-sellers__image-layer--front {
      opacity: 1;
    }
  }

  .best-sellers__card:hover .best-sellers__button {
    color: $color-white;
    background: $color-navy-mid;

    img {
      filter: brightness(0) invert(1);
    }
  }

  .best-sellers__box--second .best-sellers__card:hover {
    background: #eaefe9;
  }

  .best-sellers__box--third .best-sellers__card:hover {
    background: #b2d4bc;
  }

  .best-sellers__box--fourth .best-sellers__card:hover {
    background: #dee8dc;
  }

  .best-sellers__box--scale .best-sellers__card:hover .best-sellers__image-layer--main {
    transform: scale(1.1);
  }

  .best-sellers__box--rotate .best-sellers__card:hover .best-sellers__image-layer--main {
    transform: rotate(15deg);
  }
}

@media only screen and (max-width: 1550px) {
  .best-sellers__pre-title {
    font-size: 14px;
  }

  .best-sellers__main-title {
    font-size: 28px;
  }
}

@media only screen and (max-width: 1370px) {
  .best-sellers {
    padding: 55px 0;
  }

  .best-sellers__title {
    font-size: 45px;
  }
}

@media only screen and (max-width: 1350px) {
  .best-sellers__box {
    width: 50%;
    padding: 35px 16px;

    .best-sellers__card {
      margin-right: auto;
      margin-left: 0;
    }

    &:nth-child(odd) .best-sellers__card {
      margin-right: 0;
      margin-left: auto;
    }
  }
}

@media only screen and (max-width: 950px) {
  .best-sellers {
    padding: 35px 0;
  }

  .best-sellers__title {
    font-size: 35px;
  }

  .best-sellers__boxes {
    margin: -26px -16px;
    margin-top: 40px;
  }

  .best-sellers__box {
    width: 100%;
    padding: 26px 16px;

    .best-sellers__card {
      width: 100%;
      max-width: 100%;
      padding: 25px;
    }
  }

  .best-sellers__image {
    height: 245px;
    margin-bottom: 0;
  }

  .best-sellers__image-layer {
    display: none;
  }

  .best-sellers__image-layer--mobile {
    display: block;
    max-height: 120%;
    mix-blend-mode: darken;
  }

  .best-sellers__text {
    margin-top: 15px;
  }
}
</style>
