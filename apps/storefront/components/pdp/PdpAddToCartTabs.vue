<template>
  <section
    v-if="section.enabled !== false"
    class="product-cart product-cart-tabs"
  >
    <div class="product-cart-tabs__inner">
      <div class="product-cart-tabs__media">
        <div class="story-slider" aria-label="Product media gallery">
          <Transition name="story-fade" mode="out-in">
            <div :key="activeSlide" class="story-slider__slide">
              <AppImage
                :image="activeGalleryItem?.image"
                :alt="activeGalleryItem?.alt || section.product_title || ''"
                loading="eager"
              />
            </div>
          </Transition>

          <div v-if="gallery.length > 1" class="story-slider__bullets" aria-label="Gallery slides">
            <button
              v-for="(_, index) in gallery"
              :key="index"
              class="story-slider__bullet btn-reset"
              :class="{ 'story-slider__bullet--active': index === activeSlide }"
              type="button"
              :aria-label="`Go to slide ${index + 1}`"
              :aria-current="index === activeSlide ? 'true' : undefined"
              @click="setActiveSlide(index)"
            >
              <span :style="index === activeSlide ? progressStyle : undefined" />
            </button>
          </div>
        </div>
      </div>

      <div class="product-cart-tabs__content">
        <h1 class="title-2accent">
          <span>{{ section.brand_label || 'Particle' }}</span> {{ section.product_title }}
        </h1>

        <h2>{{ section.headline }}</h2>

        <a href="#stampedcreambot" class="review-scroll">
          <div class="product-cart__reviews">
            <div class="stars-rating stars-rating--small">
              <span :style="{ width: `${reviewRatingPercent}%` }" />
            </div>
            <span v-if="reviewText" class="text">{{ reviewText }}</span>
          </div>
        </a>

        <div v-if="tabs.length" class="pdp-tabs">
          <div class="pdp-tabs__head" role="tablist">
            <button
              v-for="(tab, index) in tabs"
              :id="tabId(index)"
              :key="tab.id || tab.label || index"
              class="pdp-tabs__tab btn-reset"
              :class="{ active: index === activeTab }"
              type="button"
              role="tab"
              :aria-selected="index === activeTab"
              :aria-controls="panelId(index)"
              :tabindex="index === activeTab ? 0 : -1"
              @click="activeTab = index"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="pdp-tabs__body">
            <div
              v-for="(tab, index) in tabs"
              v-show="index === activeTab"
              :id="panelId(index)"
              :key="tab.id || tab.label || index"
              class="pdp-tabs__panel"
              role="tabpanel"
              :aria-labelledby="tabId(index)"
            >
              <div
                v-if="tab.content"
                class="pdp-tabs__richtext"
                v-html="tab.content"
              />
              <div v-if="tab.steps?.length" class="pdp-tabs__steps">
                <div
                  v-for="step in tab.steps"
                  :key="step.id || step.title"
                  class="pdp-tabs__step"
                >
                  <p class="pdp-tabs__step-title">{{ step.title }}</p>
                  <p class="pdp-tabs__step-text">{{ step.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form class="radio-buttons-style cart price-block-regular buy-box-p3" @submit.prevent>
          <div class="th-products" role="radiogroup" aria-label="Select quantity">
            <button
              v-for="(option, index) in purchaseOptions"
              :key="option.id || option.quantity"
              type="button"
              class="th-products__item btn-reset cart"
              :class="{ active: index === activeOption }"
              role="radio"
              :aria-checked="index === activeOption"
              @click="activeOption = index"
            >
              <span class="radio"><span /></span>

              <div v-if="option.badge_label" class="th-products__popular">
                {{ option.badge_label }}
              </div>

              <div class="th-products__image">
                <AppImage
                  :image="option.image"
                  :alt="option.alt || option.unit_label || ''"
                />
              </div>

              <div class="wrapper-content">
                <div class="th-products__content">
                  <div class="th-products__unit">{{ option.unit_label }}</div>
                  <div v-if="option.saveDisplay" class="th-products__save">
                    You Save: {{ option.saveDisplay }}
                  </div>
                </div>

                <div class="th-products__content-2">
                  <div class="th-products__price">
                    <strong>{{ option.priceSymbol }}</strong>
                    <span class="price-num">{{ option.priceAmount }}</span>
                    <span class="price-per-unit">{{ option.pricePerUnitLabel }}</span>
                  </div>
                  <div class="th-products__total">
                    {{ option.totalDisplay }} Total
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div v-if="showHurryBlock" class="hurry-block">
            <p class="message">
              {{ section.hurry_label }}
              <span v-if="section.hurry_stock_count">{{ section.hurry_stock_count }}</span>
              {{ section.hurry_stock_suffix }}
            </p>
            <div class="bar" aria-hidden="true">
              <div class="thumb" :style="{ width: `${hurryPercent}%` }" />
            </div>
          </div>

          <div class="button-block">
            <button
              class="btn btn-sky single_add_to_cart_button"
              type="button"
              :class="{ loading: isAddingToCart }"
              :disabled="isAddToCartDisabled"
              @click="handleAddToCart"
            >
              {{ section.add_to_cart_label || 'Add To Cart' }}
            </button>
            <p v-if="addToCartMessage" class="product-cart__commerce-message">
              {{ addToCartMessage }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { PdpAddToCartTabsSectionData, ProductData } from '~/types/content'

const props = defineProps<{
  section: PdpAddToCartTabsSectionData
  product?: ProductData | null
}>()

const cart = useCart()
const activeSlide = ref(0)
const activeTab = ref(0)
const activeOption = ref(0)
const progress = ref(0)
let slideTimer: number | undefined
let progressTimer: number | undefined

const gallery = computed(() => props.section.gallery?.filter((item) => item.image?.url) || [])
const tabs = computed(() => props.section.tabs?.filter((tab) => tab.label) || [])
const purchaseOptions = computed(() => getPricedPdpPurchaseOptions(props.section.purchase_options, props.product))
const activeGalleryItem = computed(() => gallery.value[activeSlide.value])
const activePurchaseOption = computed(() => purchaseOptions.value[activeOption.value])
const medusaVariantId = computed(() => props.product?.commerce?.default_variant_id)
const stampedSummary = useStampedReviewsSummary(() => props.product, () => props.section.product_title)
const sectionRatingPercent = computed(() => Math.min(100, Math.max(0, props.section.rating_percent || 100)))
const sectionReviewText = computed(() => {
  return props.section.review_count
    ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(props.section.review_count)} Reviews`
    : ''
})
const reviewRatingPercent = computed(() => stampedSummary.ratingPercent.value ?? sectionRatingPercent.value)
const reviewText = computed(() => stampedSummary.reviewText.value || sectionReviewText.value)
const autoplayMs = computed(() => Math.max(2000, props.section.autoplay_ms || 4500))
const hurryPercent = computed(() => Math.min(Math.max(props.section.hurry_bar_percent || 0, 0), 100))
const showHurryBlock = computed(() => Boolean(props.section.hurry_label || props.section.hurry_stock_count))
const isAddingToCart = computed(() => cart.isLoading.value)
const addToCartMessage = computed(() => {
  if (cart.error.value) {
    return cart.error.value
  }

  if (!props.product?.commerce?.purchasable) {
    return props.product?.commerce?.unavailable_reason || 'This product is not available for purchase yet.'
  }

  return ''
})
const isAddToCartDisabled = computed(() => {
  return isAddingToCart.value || !props.product?.commerce?.purchasable || !medusaVariantId.value
})
const progressStyle = computed<CSSProperties>(() => ({
  transform: `scaleX(${progress.value / 100})`,
}))

const tabId = (index: number) => `pdp-tab-${props.section.id || 'tabs'}-${index}`
const panelId = (index: number) => `pdp-panel-${props.section.id || 'tabs'}-${index}`

const clearSliderTimers = () => {
  if (slideTimer) {
    window.clearInterval(slideTimer)
  }

  if (progressTimer) {
    window.clearInterval(progressTimer)
  }
}

const startSliderTimers = () => {
  clearSliderTimers()
  progress.value = 0

  if (gallery.value.length <= 1) {
    return
  }

  const startedAt = Date.now()
  progressTimer = window.setInterval(() => {
    progress.value = Math.min(((Date.now() - startedAt) / autoplayMs.value) * 100, 100)
  }, 80)

  slideTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % gallery.value.length
    startSliderTimers()
  }, autoplayMs.value)
}

const setActiveSlide = (index: number) => {
  activeSlide.value = index
  startSliderTimers()
}

const handleAddToCart = async () => {
  if (!medusaVariantId.value) {
    return
  }

  await cart.addItem({
    variantId: medusaVariantId.value,
    quantity: activePurchaseOption.value?.quantity || 1,
  })
}

watch(purchaseOptions, (options) => {
  const defaultIndex = options.findIndex((option) => option.default_selected)
  activeOption.value = defaultIndex >= 0 ? defaultIndex : 0
}, { immediate: true })

watch(gallery, (items) => {
  if (activeSlide.value >= items.length) {
    activeSlide.value = 0
  }

  startSliderTimers()
})

onMounted(() => {
  startSliderTimers()
})

onBeforeUnmount(() => {
  clearSliderTimers()
})
</script>

<style scoped lang="scss">
.product-cart-tabs {
  max-width: 1460px;
  margin: 0 auto;
  padding: 30px 20px 120px;
  background: #fff;
}

.product-cart-tabs__inner {
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(430px, 1fr);
  gap: 40px;
  align-items: flex-start;
}

.story-slider {
  position: sticky;
  top: 120px;
  overflow: hidden;
  height: 750px;
  border-radius: 0;
  background: #f6f6f6;
}

.story-slider__slide {
  height: 100%;
}

.story-slider__slide :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-slider__bullets {
  position: absolute;
  top: 28px;
  right: 30px;
  left: 30px;
  display: grid;
  grid-auto-flow: column;
  gap: 9px;
}

.story-slider__bullet {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 78%);
  box-shadow: 0 1px 5px rgb(0 0 0 / 16%);
}

.story-slider__bullet span {
  display: block;
  width: 100%;
  height: 100%;
  background: #fff;
  transform: scaleX(0);
  transform-origin: left center;
}

.story-slider__bullet--active {
  background: rgb(255 255 255 / 78%);
}

.story-fade-enter-active,
.story-fade-leave-active {
  transition: opacity 0.35s ease;
}

.story-fade-enter-from,
.story-fade-leave-to {
  opacity: 0;
}

.product-cart-tabs__content {
  min-width: 0;
  max-width: 690px;
}

.title-2accent {
  margin: 0;
  color: #050446;
  font-size: clamp(42px, 4.5vw, 65px);
  font-weight: 800;
  line-height: 1;
  text-transform: none;
}

.title-2accent span {
  color: #0038b1;
}

.product-cart-tabs__content h2 {
  margin: 10px 0 8px;
  color: #050446;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.16;
}

.review-scroll {
  display: inline-flex;
  margin-bottom: 16px;
  color: inherit;
  text-decoration: none;
}

.product-cart__reviews {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #050446;
  font-size: 11px;
  font-weight: 700;
}

.stars-rating {
  position: relative;
  width: 73px;
  height: 15px;
  background: #d9d9d9;
  clip-path: polygon(5% 0, 7% 35%, 0 35%, 6% 56%, 3% 90%, 15% 68%, 27% 90%, 24% 56%, 30% 35%, 20% 35%, 25% 0, 35% 0, 40% 35%, 32% 35%, 38% 56%, 35% 90%, 47% 68%, 59% 90%, 56% 56%, 62% 35%, 54% 35%, 59% 0, 69% 0, 74% 35%, 66% 35%, 72% 56%, 69% 90%, 81% 68%, 93% 90%, 90% 56%, 96% 35%, 88% 35%, 93% 0);
}

.stars-rating span {
  display: block;
  height: 100%;
  background: #f5b301;
}

.pdp-tabs {
  margin-bottom: 0;
}

.pdp-tabs__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  border-bottom: 1px solid #e1e1e9;
}

.pdp-tabs__tab {
  position: relative;
  flex: 1 1 0;
  padding: 12px;
  border: 0;
  border-radius: 0;
  color: #050446;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
}

.pdp-tabs__tab.active {
  color: #0038b1;
  font-weight: 800;
  background: transparent;
}

.pdp-tabs__tab.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: #0038b1;
  content: '';
}

.pdp-tabs__body {
  min-height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #050446;
  box-shadow: none;
  font-size: 18px;
  line-height: 1.5;
}

.pdp-tabs__richtext :deep(p) {
  margin: 16px 0 0;
}

.pdp-tabs__richtext :deep(ul) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px 18px;
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.pdp-tabs__richtext :deep(li) {
  position: relative;
  padding-left: 20px;
}

.pdp-tabs__richtext :deep(li::before) {
  position: absolute;
  top: 8px;
  left: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1b5a2a;
  content: '';
}

.pdp-tabs__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  overflow: hidden;
  border: 1px solid #e1e1e9;
  border-radius: 6px;
}

.pdp-tabs__step {
  padding: 14px;
  border-right: 1px solid #e1e1e9;
  background: #fff;
  text-align: center;
}

.pdp-tabs__step:last-child {
  border-right: 0;
}

.pdp-tabs__step-title {
  margin: 0 0 4px;
  color: #0038b1;
  font-weight: 900;
}

.pdp-tabs__step-text {
  margin: 0;
}

.th-products {
  display: grid;
  grid-template-columns: calc(38% - 8px) calc(62% - 8px);
  grid-template-rows: 210px;
  gap: 16px;
  margin-top: 28px;
}

.th-products__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 90px;
  overflow: hidden;
  padding: 12px 14px;
  border: 1px solid #e1e1e9;
  border-radius: 0;
  background: #fff;
  box-shadow: none;
  cursor: pointer;
}

.th-products__item.active {
  border-color: #0038b1;
  background: #eef4fb;
}

.th-products__item:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  height: 210px;
  display: grid;
  grid-template-columns: 24px 1fr;
  grid-template-rows: auto 1fr;
  align-items: start;
  gap: 0 10px;
  padding: 20px 10px 14px;
}

.th-products__item:nth-child(2),
.th-products__item:nth-child(3) {
  grid-column: 2;
  grid-row: 1;
  height: calc(50% - 8px);
  padding: 12px 16px 12px 14px;
}

.th-products__item:nth-child(3) {
  align-self: end;
}

.radio {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border: 2px solid #0038b1;
  border-radius: 50%;
}

.radio span {
  width: 10px;
  height: 10px;
  border-radius: inherit;
  background: transparent;
}

.th-products__item.active .radio span {
  background: #0038b1;
}

.th-products__popular {
  position: absolute;
  top: 18px;
  right: -43px;
  width: 145px;
  padding: 5px 0;
  border-radius: 0;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  background: #4e8b5f;
  text-align: center;
  transform: rotate(30deg);
}

.th-products__image {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.th-products__image :deep(img) {
  display: block;
  width: 82px;
  height: 82px;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.th-products__item:nth-child(1) .th-products__image {
  grid-column: 1 / -1;
  grid-row: 2;
  align-self: end;
  justify-self: start;
  width: 46%;
  min-width: 92px;
  height: 142px;
}

.th-products__item:nth-child(1) .th-products__image :deep(img) {
  width: 100%;
  height: 100%;
}

.th-products__item:nth-child(2) .th-products__image,
.th-products__item:nth-child(3) .th-products__image {
  width: 72px;
}

.wrapper-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 14px;
}

.th-products__item:nth-child(1) .wrapper-content {
  position: absolute;
  right: 14px;
  bottom: 18px;
  display: block;
  width: 49%;
}

.th-products__unit {
  color: #050446;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.15;
}

.th-products__save {
  margin-top: 4px;
  color: #4e8b5f;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.15;
}

.th-products__price {
  color: #050446;
  font-weight: 900;
  text-align: right;
  white-space: nowrap;
}

.th-products__price strong {
  font-size: 21px;
}

.price-num {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.th-products__item:nth-child(1) .th-products__price {
  margin-top: 14px;
  text-align: left;
}

.th-products__item:nth-child(1) .price-num {
  font-size: 44px;
}

.price-per-unit,
.th-products__total {
  font-size: 12px;
  font-weight: 500;
}

.th-products__total {
  margin-top: 8px;
  color: rgb(5 4 70 / 65%);
  text-align: right;
}

.th-products__item:nth-child(1) .th-products__total {
  text-align: left;
}

.hurry-block {
  margin-top: 26px;
  padding: 0;
  border-radius: 0;
  background: transparent;
}

.hurry-block .message {
  margin: 0 0 9px;
  color: #050446;
  font-size: 16px;
  font-weight: 700;
}

.hurry-block .message span {
  color: #d01110;
}

.hurry-block .bar {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #eaeaf0;
}

.hurry-block .thumb {
  height: 100%;
  border-radius: inherit;
  background: #d01110;
}

.button-block {
  margin-top: 18px;
}

.single_add_to_cart_button {
  width: 100%;
  min-height: 55px;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  background: #0038b1;
  text-transform: uppercase;
  cursor: pointer;
}

.single_add_to_cart_button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.product-cart__commerce-message {
  margin: 12px 0 0;
  color: #e2401c;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .product-cart-tabs__inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .story-slider {
    position: relative;
    top: auto;
    height: auto;
    max-width: 640px;
    margin: 0 auto;
  }

  .story-slider__slide {
    aspect-ratio: 0.92;
  }
}

@media (max-width: 640px) {
  .product-cart-tabs {
    padding: 28px 14px 34px;
  }

  .pdp-tabs__richtext :deep(ul),
  .pdp-tabs__steps {
    grid-template-columns: 1fr;
  }

  .pdp-tabs__step {
    border-right: 0;
    border-bottom: 1px solid #e1e1e9;
  }

  .pdp-tabs__step:last-child {
    border-bottom: 0;
  }

  .th-products__item {
    grid-template-columns: 20px 64px 1fr;
    padding: 14px;
  }

  .th-products__image :deep(img) {
    width: 64px;
    height: 64px;
  }

  .wrapper-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .th-products__price,
  .th-products__total {
    text-align: left;
  }
}
</style>
