<template>
  <section
    v-if="section.enabled !== false"
    class="product-cart product-cart-regular"
  >
    <div class="product-cart__inner">
      <div class="product-cart__media-column">
        <div class="slider-product-cart slider-product-cart-regular">
          <div class="swiper-product-thumbs">
            <div class="swiper-product-thumbs__viewport">
              <div
                class="swiper-wrapper"
                :style="{ transform: `translate3d(0, -${thumbOffset}px, 0)` }"
              >
                <button
                  v-for="(item, index) in gallery"
                  :key="item.id || index"
                  type="button"
                  class="swiper-slide btn-reset"
                  :class="{
                    'swiper-slide-thumb-active': index === activeSlide,
                    video: Boolean(item.video),
                  }"
                  :aria-label="`View image ${index + 1}`"
                  @click="activeSlide = index"
                >
                  <AppImage
                    :image="item.image"
                    :alt="item.alt || ''"
                  />
                </button>
              </div>
            </div>
            <div class="nav">
              <button
                type="button"
                class="nav-button product-thumbs-next btn-reset"
                :disabled="thumbWindowStart === 0"
                aria-label="Previous slide"
                @click="slideThumbWindow(-1)"
              >
                <span aria-hidden="true">⌄</span>
              </button>
              <button
                type="button"
                class="nav-button product-thumbs-prev btn-reset"
                :disabled="thumbWindowStart >= maxThumbStart"
                aria-label="Next slide"
                @click="slideThumbWindow(1)"
              >
                <span aria-hidden="true">⌄</span>
              </button>
            </div>
          </div>

          <div class="swiper-product">
            <Transition name="pdp-gallery-fade" mode="out-in">
              <div
                :key="activeSlide"
                class="swiper-slide swiper-slide-active"
              >
                <video
                  v-if="activeGalleryItem?.video"
                  class="product-cart__video"
                  controls
                  playsinline
                  :poster="mediaUrl(activeGalleryItem.image)"
                >
                  <source :src="mediaUrl(activeGalleryItem.video)" type="video/mp4">
                </video>
                <AppImage
                  v-else
                  :image="activeGalleryItem?.image"
                  :alt="activeGalleryItem?.alt || section.product_title || ''"
                />
              </div>
            </Transition>
            <div class="product-cat-pagination">
              <button
                v-for="(_, index) in gallery"
                :key="index"
                type="button"
                class="swiper-pagination-bullet btn-reset"
                :class="{ 'swiper-pagination-bullet-active': index === activeSlide }"
                :aria-label="`Go to slide ${index + 1}`"
                @click="activeSlide = index"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="product-cart__content">
        <h1 class="title-2accent">
          <span>{{ section.brand_label || 'Particle' }}</span> {{ section.product_title }}
        </h1>

        <a href="#stampedcreambot" class="review-scroll">
          <div class="product-cart__reviews">
            <div class="stars-rating stars-rating--small" aria-hidden="true">
              <svg
                v-for="(fill, index) in reviewStarFills"
                :key="index"
                class="stars-rating__star"
                viewBox="0 0 24 24"
                focusable="false"
              >
                <defs>
                  <linearGradient :id="starGradientId(index)" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop :offset="`${fill}%`" stop-color="#f5b301" />
                    <stop :offset="`${fill}%`" stop-color="#d9d9d9" />
                  </linearGradient>
                </defs>
                <path
                  :fill="`url(#${starGradientId(index)})`"
                  d="M12 1.5l3.13 6.34 7 .99-5.06 4.93 1.19 6.96L12 17.43l-6.26 3.29 1.19-6.96-5.06-4.93 7-.99L12 1.5z"
                />
              </svg>
            </div>
            <span v-if="reviewText" class="text">{{ reviewText }}</span>
          </div>
        </a>

        <h2>{{ section.headline }}</h2>
        <div
          v-if="section.excerpt"
          class="excerpt"
          v-html="section.excerpt"
        />

        <div v-if="section.guarantees?.length" class="guarantee">
          <div
            v-for="guarantee in section.guarantees"
            :key="guarantee.id || guarantee.label"
            class="guarantee__item"
          >
            <AppImage
              :image="guarantee.icon"
              :alt="guarantee.alt || guarantee.label || ''"
            />
            <p>{{ guarantee.label }}</p>
          </div>
        </div>

        <section v-if="section.stock_text" class="columns-block">
          <div class="product-quantity">
            <span class="stock-count" v-html="section.stock_text" />
          </div>
        </section>

        <form class="radio-buttons-style cart price-block-regular buy-box-p3" @submit.prevent>
          <div class="th-products" role="radiogroup" aria-label="Select quantity">
            <button
              v-for="(option, index) in purchaseOptions"
              :key="option.id || option.quantity"
              type="button"
              class="th-products__item btn-reset cart"
              :class="[
                { active: index === activeOption },
                index === 0 ? 'th-products__item--featured' : 'th-products__item--compact',
              ]"
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
                  <div class="th-products__price">
                    <strong>{{ option.priceSymbol }}</strong>
                    <span class="price-num">{{ option.priceAmount }}</span>
                    <span>{{ option.pricePerUnitLabel }}</span>
                  </div>
                  <div class="th-products__total">
                    {{ option.totalDisplay }} Total
                  </div>
                  <div v-if="option.saveDisplay" class="th-products__save">
                    You Save: {{ option.saveDisplay }}
                  </div>
                </div>
              </div>
            </button>
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
import type { PdpAddToCartRegularSectionData, ProductData, StrapiMedia } from '~/types/content'

const props = defineProps<{
  section: PdpAddToCartRegularSectionData
  product?: ProductData | null
}>()

const config = useRuntimeConfig()
const cart = useCart()
const activeSlide = ref(0)
const isMobileThumbs = useMediaQuery('(max-width: 768px)')
const isCompactThumbs = useMediaQuery('(max-width: 1310px)')

const gallery = computed(() => props.section.gallery?.filter((item) => item.image?.url) || [])
const purchaseOptions = computed(() => getPricedPdpPurchaseOptions(props.section.purchase_options, props.product))
const activeGalleryItem = computed(() => gallery.value[activeSlide.value])
const activeOption = ref(0)
const activePurchaseOption = computed(() => purchaseOptions.value[activeOption.value])
const stampedSummary = useStampedReviewsSummary(() => props.product, () => props.section.product_title)
const reviewRatingPercent = computed(() => stampedSummary.ratingPercent.value ?? sectionRatingPercent.value)
const reviewText = computed(() => stampedSummary.reviewText.value || sectionReviewText.value)
const reviewStarFills = computed(() => {
  const rating = Math.min(5, Math.max(0, (reviewRatingPercent.value / 100) * 5))

  return Array.from({ length: 5 }, (_, index) => Math.min(100, Math.max(0, (rating - index) * 100)))
})
const starGradientId = (index: number) => {
  return `pdp-regular-star-${props.section.id || 'hero'}-${index}`
}
const medusaVariantId = computed(() => props.product?.commerce?.default_variant_id)
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
const visibleThumbs = 4
const thumbWindowStart = ref(0)
const maxThumbStart = computed(() => Math.max(0, gallery.value.length - visibleThumbs))
const sectionRatingPercent = computed(() => Math.min(100, Math.max(0, props.section.rating_percent || 100)))
const sectionReviewText = computed(() => {
  return props.section.review_count
    ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(props.section.review_count)} Reviews`
    : ''
})
const thumbOffset = computed(() => {
  if (isMobileThumbs.value) {
    return 0
  }

  return thumbWindowStart.value * (isCompactThumbs.value ? 97 : 129.25)
})

const slideThumbWindow = (direction: 1 | -1) => {
  const nextStart = Math.min(Math.max(thumbWindowStart.value + direction, 0), maxThumbStart.value)
  thumbWindowStart.value = nextStart

  if (activeSlide.value < nextStart) {
    activeSlide.value = nextStart
  } else if (activeSlide.value >= nextStart + visibleThumbs) {
    activeSlide.value = nextStart + visibleThumbs - 1
  }
}

watch(purchaseOptions, (options) => {
  const defaultIndex = options.findIndex((option) => option.default_selected)
  activeOption.value = defaultIndex >= 0 ? defaultIndex : 0
}, { immediate: true })

watch(activeSlide, (value) => {
  if (value < thumbWindowStart.value) {
    thumbWindowStart.value = value
  } else if (value >= thumbWindowStart.value + visibleThumbs) {
    thumbWindowStart.value = Math.min(value - visibleThumbs + 1, maxThumbStart.value)
  }
})

watch(gallery, () => {
  thumbWindowStart.value = Math.min(thumbWindowStart.value, maxThumbStart.value)
  activeSlide.value = Math.min(activeSlide.value, Math.max(0, gallery.value.length - 1))
})

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

const handleAddToCart = async () => {
  if (!medusaVariantId.value || isAddToCartDisabled.value) {
    return
  }

  await cart.addItem({
    variantId: medusaVariantId.value,
    quantity: Math.max(1, Number(activePurchaseOption.value?.quantity || 1)),
  })
}
</script>

<style scoped lang="scss">
.product-cart {
  margin-top: 10px;
  margin-bottom: 40px;
  padding-right: 15px;
  padding-left: 15px;
}

.product-cart__inner {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 110px;
}

.product-cart__media-column {
  min-width: 545px;
}

.slider-product-cart {
  position: relative;
  display: flex;
  width: 545px;
  height: 500px;
  gap: 55px;
  margin-top: 49px;
  margin-left: auto;
  overflow: hidden;
}

.swiper-product-thumbs {
  width: 90px;
}

.swiper-product-thumbs__viewport {
  height: 500px;
  overflow: hidden;
}

.swiper-product-thumbs .swiper-wrapper {
  display: grid;
  gap: 17px;
  transition: transform 0.35s ease;
}

.swiper-product-thumbs .swiper-slide {
  position: relative;
  display: flex;
  width: 90px;
  min-width: 90px;
  height: 112.25px;
  max-height: 112.25px;
  cursor: pointer;

  :deep(img) {
    width: 100%;
    height: 100%;
    margin-right: auto;
    margin-left: auto;
    object-fit: cover;
  }
}

.swiper-product-thumbs .swiper-slide-thumb-active {
  outline: 2px solid #0038b1;
  outline-offset: -2px;
}

.swiper-product-thumbs .swiper-slide.video::before {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgb(5 4 70 / 80%);
  transform: translate(-50%, -50%);
  content: '';
}

.swiper-product-thumbs .swiper-slide.video::after {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 15px solid $color-white;
  transform: translate(-35%, -50%);
  content: '';
}

.swiper-product-thumbs .nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;
}

.nav-button {
  color: $color-navy;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
}

.product-thumbs-next {
  transform: rotate(180deg);
}

.swiper-product {
  position: relative;
  overflow: hidden;
}

.swiper-product .swiper-slide {
  width: 400px;
  height: 500px;
}

.swiper-product :deep(img),
.product-cart__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-cat-pagination {
  display: none;
}

.pdp-gallery-fade-enter-active,
.pdp-gallery-fade-leave-active {
  transition: opacity 0.2s ease;
}

.pdp-gallery-fade-enter-from,
.pdp-gallery-fade-leave-to {
  opacity: 0;
}

.product-cart__content {
  max-width: 730px;
}

.title-2accent {
  max-width: 700px;
  margin-bottom: 30px;
  color: $color-navy;
  font-family: $font-heading;
  font-size: 60px;
  font-weight: 800;
  line-height: 113.7%;
  letter-spacing: 0.02em;
  text-transform: capitalize;

  span {
    color: #0038b1;
  }
}

.review-scroll {
  display: inline-block;
  color: $color-navy;
  font-size: 16px;
  font-weight: 600;
  line-height: 113.7%;
}

.product-cart__reviews {
  display: flex;
  gap: 5px;
  margin: 18px 0 18px -1px;
}

.stars-rating--small {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: max-content;
}

.stars-rating__star {
  display: block;
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
}

.product-cart__reviews .text {
  margin-top: 2px;
}

.product-cart__content h2 {
  max-width: 654px;
  color: $color-navy;
  font-size: 26px;
  font-weight: 700;
  line-height: 113.7%;
}

.excerpt {
  margin-bottom: 30px;

  :deep(p) {
    max-width: 730px;
    margin: 9px 0 10px;
    color: $color-navy;
    font-size: 18px;
    line-height: 1.5;
  }
}

.guarantee {
  display: flex;
}

.guarantee__item {
  display: flex;
  align-items: center;
  gap: 20px;

  &:not(:last-child) {
    margin-right: 80px;
  }

  :deep(img) {
    max-width: 31px;
  }

  p {
    color: $color-navy;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }
}

.columns-block {
  margin-top: 18px;
}

.stock-count {
  color: #8bb99a;
  font-size: 24px;
  font-weight: 800;

  :deep(.quantity) {
    color: #4f715d;
    font-weight: 800;
  }
}

.product-cart .th-products {
  display: grid;
  grid-template-columns: 286px minmax(360px, 1fr);
  grid-template-rows: repeat(2, 97px);
  gap: 16px;
  max-width: 730px;
  margin-top: 46px;
}

.th-products__item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 0;
  padding: 16px 18px;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  background: $color-white;
  cursor: pointer;
  overflow: hidden;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease;

  &.active {
    border-color: #0038b1;
    background: #ebf0f4;
  }
}

.th-products__item--featured {
  grid-row: 1 / span 2;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  min-height: 210px;
  padding: 28px 18px 16px;

  .th-products__image {
    width: 142px;
    height: 112px;
    margin: 0;
  }

  .wrapper-content {
    width: 100%;
  }

  .th-products__content {
    margin-left: 148px;
    margin-top: -88px;
  }

  .th-products__price {
    margin-top: 4px;
  }
}

.th-products__item--compact {
  justify-content: space-between;

  .th-products__image {
    width: 86px;
    height: 64px;
    margin-left: 25px;
  }

  .wrapper-content {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
  }

  .th-products__content {
    display: grid;
    grid-template-columns: minmax(130px, 1fr) 150px;
    align-items: center;
    width: 100%;
  }

  .th-products__unit {
    grid-column: 1;
    grid-row: 1;
  }

  .th-products__price {
    grid-column: 2;
    grid-row: 1;
    justify-content: flex-end;
  }

  .th-products__total {
    grid-column: 2;
    grid-row: 2;
    text-align: right;
  }

  .th-products__save {
    grid-column: 1;
    grid-row: 2;
  }
}

.radio {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid #0038b1;
  border-radius: 50%;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: 0.25s ease;
  }
}

.th-products__item.active .radio span {
  background: #0038b1;
}

.th-products__popular {
  position: absolute;
  top: 16px;
  right: -54px;
  width: 190px;
  padding: 5px 0;
  color: $color-white;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  background: #08733b;
  transform: rotate(36deg);
}

.th-products__image {
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(img) {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
    mix-blend-mode: multiply;
  }
}

.wrapper-content {
  flex: 1;
}

.th-products__content {
  color: $color-navy;
  text-align: left;
}

.th-products__unit {
  color: #0038b1;
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
}

.th-products__price {
  display: flex;
  align-items: baseline;
  color: $color-navy;
  font-weight: 700;

  strong {
    font-size: 22px;
  }

  .price-num {
    font-size: 38px;
    line-height: 1;
  }

  span:last-child {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
}

.th-products__total,
.th-products__save {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 700;
}

.th-products__total {
  color: #525789;
  font-weight: 500;
}

.th-products__save {
  color: #237b43;
  white-space: nowrap;
}

.button-block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  text-align: center;
}

.single_add_to_cart_button {
  margin: 30px 0;
  min-width: 240px;
  padding: 10px 45px;
  border-radius: 7px;
  color: $color-white;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
  text-transform: uppercase;
  background: #0b44c9;
  cursor: pointer;
}

.single_add_to_cart_button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.single_add_to_cart_button.loading {
  position: relative;
  color: transparent;
}

.single_add_to_cart_button.loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  border: 3px solid $color-white;
  border-bottom-color: transparent;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pdp-button-spin 0.8s linear infinite;
}

.product-cart__commerce-message {
  width: 100%;
  margin: -18px 0 18px;
  color: #b42318;
  font-size: 14px;
  font-weight: 700;
}

@keyframes pdp-button-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (max-width: 1800px) {
  .product-cart__inner {
    gap: 65px;
  }
}

@media (max-width: 1600px) {
  .product-cart__inner {
    gap: 20px;
  }

  .slider-product-cart {
    width: 535px;
    min-width: 535px;
    gap: 40px;
  }
}

@media (max-width: 1440px) {
  .title-2accent {
    font-size: 60px;
  }

  .product-cart__content h2 {
    font-size: 20px;
  }

  .slider-product-cart {
    width: 500px;
    min-width: 500px;
    gap: 30px;
  }
}

@media (max-width: 1310px) {
  .product-cart__inner {
    gap: 15px;
  }

  .product-cart__media-column,
  .slider-product-cart {
    width: 444px;
    min-width: 444px;
  }

  .slider-product-cart {
    height: 371px;
    gap: 10px;
  }

  .swiper-product .swiper-slide {
    width: 371px;
    height: 371px;
  }

  .swiper-product-thumbs,
  .swiper-product-thumbs .swiper-slide {
    width: 63px;
    min-width: 63px;
    height: 80px;
    max-height: 80px;
  }
}

@media (max-width: 1024px) {
  .product-cart .th-products {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }

  .th-products__item--featured {
    grid-row: auto;
    flex-direction: row;
    align-items: center;

    .th-products__content {
      margin-top: 0;
      margin-left: 0;
    }
  }
}

@media (max-width: 992px) {
  .product-cart__inner {
    flex-direction: column;
    width: 100%;
    gap: 55px;
  }

  .product-cart__media-column,
  .product-cart__content {
    width: 100%;
    max-width: none;
  }

  .product-cart .th-products {
    gap: 32px 14px;
  }
}

@media (max-width: 768px) {
  .slider-product-cart {
    flex-direction: column-reverse;
    width: 100%;
    min-width: 315px;
    height: auto;
    margin: 0 auto;
  }

  .swiper-product {
    max-width: 300px;
    margin-right: auto;
    margin-left: auto;
    padding-bottom: 50px;
  }

  .swiper-product .swiper-slide,
  .swiper-product :deep(img),
  .product-cart__video {
    width: 300px;
    height: 350px;
    object-fit: cover;
  }

  .swiper-product-thumbs {
    width: 100%;
  }

  .swiper-product-thumbs .swiper-wrapper {
    display: flex;
    justify-content: center;
  }

  .swiper-product-thumbs .swiper-slide {
    width: 74px;
    min-width: 74px;
    height: 74px;
    max-height: 74px;
  }

  .swiper-product-thumbs .nav {
    display: none;
  }
}

@media (max-width: 625px) {
  .product-cart .th-products {
    display: flex;
    flex-direction: column;
  }

  .product-cart .th-products__item {
    width: 100%;
    min-height: 130px;
    justify-content: center;
    padding-bottom: 10px;
  }

  .th-products__item--featured {
    flex-direction: row;
    align-items: center;

    .th-products__image {
      width: 115px;
      height: 90px;
    }

    .th-products__content {
      margin-top: 0;
      margin-left: 0;
    }
  }

  .th-products__image :deep(img) {
    max-height: 100px;
  }

  .single_add_to_cart_button {
    margin: 20px 0 0;
    padding: 23px 35px;
    font-size: 19px;
  }
}

@media (max-width: 576px) {
  .title-2accent {
    font-size: 32px;
  }

  .review-scroll {
    font-size: 20px;
  }

  .guarantee {
    gap: 33px;
  }

  .guarantee__item {
    gap: 13px;

    &:not(:last-child) {
      margin-right: 0;
    }

    :deep(img) {
      max-width: 21px;
    }

    p {
      font-size: 13px;
    }
  }
}
</style>
