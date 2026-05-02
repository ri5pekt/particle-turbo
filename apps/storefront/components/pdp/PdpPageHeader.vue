<template>
  <section
    v-if="section.enabled !== false"
    class="pdp-page-header"
    :class="`pdp-page-header--${section.theme || 'gravite'}`"
  >
    <div class="pdp-page-header__background">
      <video
        v-if="section.background_video_url"
        class="pdp-page-header__media"
        :src="section.background_video_url"
        autoplay
        muted
        loop
        playsinline
      />
      <img
        v-else-if="backgroundImageSrc"
        class="pdp-page-header__media"
        :src="backgroundImageSrc"
        :alt="section.background_image?.alternativeText || ''"
      >
    </div>

    <div class="pdp-page-header__overlay" />

    <div class="pdp-page-header__content">
      <div class="pdp-page-header__main">
        <h1 class="pdp-page-header__title">
          {{ displayTitle }}
        </h1>

        <div
          v-if="section.rating_label || section.rating_value"
          class="pdp-page-header__rating"
        >
          <div class="pdp-page-header__stars" aria-hidden="true">
            <span :style="{ width: `${section.rating_percent || 100}%` }" />
          </div>
          <span v-if="section.rating_label">{{ section.rating_label }}</span>
          <strong v-if="section.rating_value">{{ section.rating_value }}</strong>
        </div>
      </div>

      <div class="pdp-page-header__sub">
        <div
          v-if="displayBody"
          class="pdp-page-header__body"
          v-html="displayBody"
        />
        <AppLink
          v-if="section.cta_label"
          class="pdp-page-header__button"
          :to="section.cta_href || '#price'"
          data-target="#price"
          @click="handleCtaClick"
        >
          <AppButton variant="primary">
            {{ section.cta_label }}
          </AppButton>
        </AppLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PdpPageHeaderSectionData, StrapiMedia } from '~/types/content'

const props = defineProps<{
  section: PdpPageHeaderSectionData
}>()

const config = useRuntimeConfig()
let activeJumpTween: { kill: () => void } | null = null

const normalizeGraviteText = (value?: string | null) => {
  return (value || '')
    .replace(/Gravit(?:\?|Ac|Ã©|e\u0301|e)/g, 'Gravité')
    .replace(/You(?:\?|�\?\?|â€™|Ã¢Â€Â™)re/g, 'You’re')
}

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

const backgroundImageSrc = computed(() => props.section.background_image_url || mediaUrl(props.section.background_image))
const displayTitle = computed(() => normalizeGraviteText(props.section.title))
const displayBody = computed(() => normalizeGraviteText(props.section.body))

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

const computeScrollY = (target: Element | number | null, offset = 0) => {
  if (typeof target === 'number') {
    return Math.max(0, target - offset)
  }

  if (!target) {
    return 0
  }

  const box = target.getBoundingClientRect()

  return Math.max(0, box.top + window.scrollY - offset)
}

const findTarget = (selector: string) => {
  try {
    return document.querySelector(selector)
  }
  catch {
    return null
  }
}

const killScrollTabTriggers = async () => {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')

  ;['desktop-scroll-tabs', 'mobile-scroll-tabs', 'varros-desktop', 'varros-mobile'].forEach((id) => {
    ScrollTrigger.getById(id)?.kill(true)
  })

  ScrollTrigger.clearScrollMemory?.()
  ScrollTrigger.update()
}

const smoothJumpTo = async (y: number, duration = 0.6) => {
  const [{ gsap }, { ScrollToPlugin }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollToPlugin'),
  ])

  gsap.registerPlugin(ScrollToPlugin)

  await new Promise<void>((resolve) => {
    activeJumpTween?.kill()

    activeJumpTween = gsap.to(window, {
      scrollTo: y,
      duration,
      ease: 'power2.out',
      onComplete: () => {
        activeJumpTween = null
        resolve()
      },
      onInterrupt: () => {
        activeJumpTween = null
        resolve()
      },
    })
  })
}

const handleCtaClick = async (event: MouseEvent) => {
  const href = props.section.cta_href || '#price'

  if (!import.meta.client || !href.startsWith('#')) {
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()

  const html = document.documentElement
  const previousScrollBehavior = html.style.scrollBehavior

  if (history.replaceState) {
    history.replaceState(null, '', href)
  }

  html.style.scrollBehavior = 'auto'
  window.dispatchEvent(new CustomEvent('pdp:scroll-tabs-skip-jump-start'))
  await killScrollTabTriggers()
  await nextFrame()
  await nextFrame()
  const target = findTarget(href)
    || document.querySelector('#price, .price-section, [data-price-section], .add-to-cart, #add-to-cart')

  await smoothJumpTo(computeScrollY(target))
  await nextFrame()
  window.dispatchEvent(new CustomEvent('pdp:scroll-tabs-skip-jump-complete'))
  html.style.scrollBehavior = previousScrollBehavior
}
</script>

<style scoped lang="scss">
.pdp-page-header {
  position: relative;
  height: calc(100dvh - #{$main-padding-top});
  min-height: 640px;
  overflow: hidden;
  color: #fff;
  background: #07112b;
}

.pdp-page-header__background,
.pdp-page-header__overlay {
  position: absolute;
  inset: 0;
}

.pdp-page-header__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdp-page-header__overlay {
  background:
    linear-gradient(90deg, rgb(0 0 0 / 34%) 0%, rgb(0 0 0 / 8%) 48%, rgb(0 0 0 / 18%) 100%),
    linear-gradient(0deg, rgb(0 0 0 / 18%) 0%, rgb(0 0 0 / 0%) 45%);
}

.pdp-page-header__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1420px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.pdp-page-header__main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-width: 503px;
  margin-top: -210px;
}

.pdp-page-header__sub {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  max-width: 472px;
  height: 100%;
  padding-bottom: 60px;
}

.pdp-page-header__title {
  margin: 0 0 24px;
  color: #fff !important;
  font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
  font-size: 85px;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  text-shadow: 0 2px 16px rgb(0 0 0 / 18%);
}

.pdp-page-header__rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.pdp-page-header__stars {
  position: relative;
  width: 96px;
  height: 21px;
  overflow: hidden;

  &::before,
  span::before {
    content: '★★★★★';
    position: absolute;
    inset: 0;
    font-size: 21px;
    line-height: 1;
    letter-spacing: 0;
  }

  &::before {
    color: rgb(255 255 255 / 45%);
  }

  span {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  span::before {
    color: #f5b301;
  }
}

.pdp-page-header__body {
  max-width: 472px;
  color: #fff !important;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.5;

  :deep(p + p) {
    margin-top: 25px;
  }
}

.pdp-page-header__button {
  display: inline-flex;
  margin-top: 32px;

  :deep(.app-button) {
    min-width: auto;
    min-height: auto;
    padding: 19px 32px;
    border-radius: 6px;
    color: #07112b !important;
    background: #fff !important;
    font-size: 20px;
    font-weight: 800;

    &:hover {
      background: #f2f6fb;
    }
  }
}

.pdp-page-header--varros {
  color: #fff;
  background: #f1eee9;

  .pdp-page-header__overlay {
    background:
      linear-gradient(90deg, rgb(0 0 0 / 44%) 0%, rgb(0 0 0 / 8%) 48%, rgb(0 0 0 / 32%) 100%),
      linear-gradient(0deg, rgb(0 0 0 / 28%) 0%, rgb(0 0 0 / 0%) 45%);
  }

  .pdp-page-header__title {
    color: #fff !important;
    font-family: Raleway, Arial, sans-serif;
    font-weight: 700;
    text-shadow: none;
  }

  .pdp-page-header__body {
    color: #fff !important;
    font-family: Raleway, Arial, sans-serif;

    :deep(strong) {
      font-weight: 700;
    }
  }

  .pdp-page-header__button {
    :deep(.app-button) {
      color: #07112b !important;
      background: #fff !important;

      &:hover {
        background: #f2f6fb !important;
      }
    }
  }
}

@media (max-width: 767px) {
  .pdp-page-header {
    height: auto;
    min-height: 760px;
  }

  .pdp-page-header__content {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 760px;
    height: auto;
    padding: 140px 20px 42px;
  }

  .pdp-page-header__sub {
    height: auto;
    padding-bottom: 0;
  }

  .pdp-page-header__title {
    font-size: 47px;
    line-height: 1.25;
  }

  .pdp-page-header__main {
    height: auto;
    margin-top: 0;
  }

  .pdp-page-header__body {
    font-size: 16px;
    line-height: 1.4;
  }

  .pdp-page-header__overlay {
    background:
      linear-gradient(180deg, rgb(0 0 0 / 38%) 0%, rgb(0 0 0 / 54%) 56%, rgb(0 0 0 / 74%) 100%);
  }
}
</style>

<style lang="scss">
.pdp-page-header--varros {
  color: #fff !important;

  .pdp-page-header__title,
  .pdp-page-header__body,
  .pdp-page-header__body p,
  .pdp-page-header__body strong {
    color: #fff !important;
  }

  .pdp-page-header__button .app-button {
    color: #07112b !important;
    background: #fff !important;
  }
}
</style>
