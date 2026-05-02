<template>
  <div v-if="section.enabled !== false && items.length">
    <section
      ref="desktopRoot"
      class="horizontal-accordion"
    >
      <div class="section-inner">
        <p class="title">
          {{ displayTitle }}
        </p>
        <div class="accordion">
          <button
            v-for="(item, index) in items"
            :key="`accordion-desktop-${item.id || index}`"
            class="item btn-reset"
            :class="{ active: activeIndex === index }"
            type="button"
            @click="setActive(index, true)"
          >
            <div class="image">
              <img
                :src="item.image_url"
                :alt="normalizeGraviteText(item.image_alt)"
                :title="normalizeGraviteText(item.image_title || item.image_alt)"
              >
            </div>
            <div class="text">
              <p
                class="quote"
                :style="textWidthStyle"
              >
                {{ normalizeGraviteText(item.quote) }}
              </p>
              <p
                class="name"
                :style="textWidthStyle"
              >
                {{ normalizeGraviteText(item.customer) }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>

    <section class="horizontal-accordion-mobile">
      <p class="title">
        {{ displayTitle }}
      </p>
      <ClientOnly>
        <Swiper
          class="slider-accordion"
          :modules="swiperModules"
          :slides-per-view="1.35"
          :space-between="24"
          :centered-slides="true"
          :loop="true"
          :speed="1000"
          :autoplay="{ delay: section.autoplay_ms || 3000, disableOnInteraction: true }"
        >
          <SwiperSlide
            v-for="(item, index) in items"
            :key="`accordion-mobile-${item.id || index}`"
          >
            <article class="item active">
              <div class="image">
                <img
                  :src="item.image_url"
                  :alt="normalizeGraviteText(item.image_alt)"
                  :title="normalizeGraviteText(item.image_title || item.image_alt)"
                >
              </div>
              <div class="text">
                <p class="quote">
                  {{ normalizeGraviteText(item.quote) }}
                </p>
                <p class="name">
                  {{ normalizeGraviteText(item.customer) }}
                </p>
              </div>
            </article>
          </SwiperSlide>
        </Swiper>
        <template #fallback>
          <div class="slider-accordion slider-accordion--fallback">
            <article
              v-for="(item, index) in items.slice(0, 2)"
              :key="`accordion-fallback-${item.id || index}`"
              class="item active"
            >
              <div class="image">
                <img
                  :src="item.image_url"
                  :alt="normalizeGraviteText(item.image_alt)"
                  :title="normalizeGraviteText(item.image_title || item.image_alt)"
                >
              </div>
              <div class="text">
                <p class="quote">
                  {{ normalizeGraviteText(item.quote) }}
                </p>
                <p class="name">
                  {{ normalizeGraviteText(item.customer) }}
                </p>
              </div>
            </article>
          </div>
        </template>
      </ClientOnly>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { PdpHorizontalAccordionSectionData } from '~/types/content'

import 'swiper/css'

const props = defineProps<{
  section: PdpHorizontalAccordionSectionData
}>()

const swiperModules = [Autoplay]
const desktopRoot = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const textWidth = ref<number | null>(null)
const hasStarted = ref(false)
let intervalId: number | null = null
let observer: IntersectionObserver | null = null

const items = computed(() => props.section.items || [])

const normalizeGraviteText = (value?: string | null) => {
  return (value || '')
    .replace(/Gravit(?:\\?|Ac|Ã©|e\\u0301|e)/g, 'Gravité')
    .replace(/men(?:\\?|\\?\\?|â€™|Ã¢Â€Â™)s/g, 'men’s')
}

const displayTitle = computed(() => normalizeGraviteText(props.section.title))
const textWidthStyle = computed(() => textWidth.value ? { width: `${textWidth.value}px` } : undefined)

const updateTextWidth = async () => {
  await nextTick()

  const activeItem = desktopRoot.value?.querySelector<HTMLElement>('.accordion .item.active')
  const quote = activeItem?.querySelector<HTMLElement>('.quote')

  if (quote) {
    textWidth.value = quote.offsetWidth
  }
}

const setActive = (index: number, resetTimer = false) => {
  activeIndex.value = index
  void updateTextWidth()

  if (resetTimer) {
    startTimer()
  }
}

const switchAccordion = () => {
  if (!items.value.length) {
    return
  }

  setActive((activeIndex.value + 1) % items.value.length)
}

const stopTimer = () => {
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

const startTimer = () => {
  stopTimer()
  intervalId = window.setInterval(switchAccordion, props.section.autoplay_ms || 3000)
}

const startAccordion = () => {
  if (hasStarted.value) {
    return
  }

  hasStarted.value = true
  void updateTextWidth()
  startTimer()
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  void updateTextWidth()

  if (!desktopRoot.value || window.innerWidth <= 950) {
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          startAccordion()
        }
      })
    },
    { threshold: 0.5 },
  )

  observer.observe(desktopRoot.value)
})

onBeforeUnmount(() => {
  stopTimer()
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.btn-reset {
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  text-align: left;
}

.horizontal-accordion {
  padding: 120px 0;
  background: #14161f;
}

.horizontal-accordion-mobile {
  display: none;
}

.section-inner {
  max-width: 1600px;
  margin: auto;
  padding: 0 20px;

  > .title {
    color: #fff;
    font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
    font-size: 40px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }
}

.accordion {
  display: flex;
  gap: 32px;
  margin-top: 40px;
}

.item {
  position: relative;
  height: 640px;
  flex: 1;
  overflow: hidden;
  border-radius: 6px;
  cursor: pointer;
  transition: flex 0.5s;

  &.active {
    flex: 2.5;

    .image {
      filter: grayscale(0);
    }

    .text,
    .quote,
    .name {
      opacity: 1;
    }

    .quote,
    .name {
      transform: translateY(0);
    }
  }
}

.image {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(1);
  transition: filter 0.5s;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgb(0 0 0 / 0%) 57.07%, rgb(28 30 32 / 36%) 80.97%, rgb(0 0 0 / 60%) 100%);
  }

  img {
    width: auto;
    max-width: none;
    height: 100%;
  }
}

.text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  opacity: 0;
  transition: opacity 0.5s;
}

.quote {
  color: #fff;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s 0.4s, transform 0.5s 0.4s;
}

.name {
  margin-top: 16px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s 0.6s, transform 0.5s 0.6s;
}

@media (max-width: 950px) {
  .horizontal-accordion {
    display: none;
  }

  .horizontal-accordion-mobile {
    display: block;
    padding: 60px 0;
    overflow: hidden;
    background: #14161f;

    > .title {
      color: #fff;
      font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
      font-size: 26px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      text-transform: uppercase;
    }
  }

  .slider-accordion {
    margin-top: 32px;
  }

  .slider-accordion--fallback {
    display: flex;
    gap: 24px;
    padding: 0 20px;
    overflow: hidden;

    .item {
      min-width: 74%;
    }
  }

  .item {
    height: 500px;
    flex: 1;
  }

  .text {
    padding: 24px 16px;
  }

  .quote {
    font-size: 16px;
  }

  .name {
    font-size: 15px;
  }
}
</style>
