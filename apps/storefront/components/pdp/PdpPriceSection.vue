<template>
  <section
    v-if="section.enabled !== false"
    id="price"
    class="price-section"
    :class="`price-section--${section.theme || 'gravite'}`"
  >
    <div class="price-inner section">
      <div class="slider-section">
        <ClientOnly>
          <Swiper
            v-if="gallery.length > 1"
            class="deodorantSwiper"
            :modules="swiperModules"
            :slides-per-view="1"
            :loop="true"
            :speed="900"
            :autoplay="{ delay: 2000 }"
          >
            <SwiperSlide
              v-for="(image, index) in gallery"
              :key="image.id || index"
            >
              <img
                :src="image.url"
                :alt="normalizeGraviteText(image.alt)"
              >
            </SwiperSlide>
          </Swiper>
        </ClientOnly>
        <div
          v-if="gallery.length <= 1"
          class="deodorantSwiper deodorantSwiper--single"
        >
          <img
            :src="gallery[0]?.url"
            :alt="normalizeGraviteText(gallery[0]?.alt)"
          >
        </div>
      </div>

      <div class="content-section">
        <div class="top-segment">
          <h2
            class="product-title"
            v-html="displayTitle"
          />
          <span
            v-if="section.subtitle"
            class="product-subtitle"
          >
            {{ section.subtitle }}
          </span>
        </div>

        <div class="bottom-segment">
          <div class="products-wrapper">
            <div class="select-title">
              {{ section.select_title || 'Select the quantity:' }}
            </div>

            <form
              class="radio-buttons-style price-block-regular cart"
              @submit.prevent
            >
              <div
                class="products-inner th-products"
                role="radiogroup"
                aria-label="Select quantity"
              >
                <button
                  v-for="(option, index) in pricedOptions"
                  :key="option.id || option.quantity"
                  class="btn-reset price-item cart th-products__item"
                  :class="{ active: activeOption === index }"
                  type="button"
                  role="radio"
                  :aria-checked="activeOption === index"
                  :tabindex="activeOption === index ? 0 : -1"
                  @click="activeOption = index"
                >
                  <div class="product-image">
                    <img
                      :src="option.image_url"
                      :alt="normalizeGraviteText(option.image_alt || option.unit_label)"
                    >
                  </div>

                  <div class="products-content">
                    <div class="qty-segment">
                      <div class="products-unit">
                        {{ option.unit_label || `${option.quantity} ${option.quantity === 1 ? 'Unit' : 'Units'}` }}
                      </div>

                      <div class="sale-price">
                        <strong>{{ option.priceSymbol }}{{ option.priceAmount }}</strong>
                        <span>{{ option.pricePerUnitLabel }}</span>
                      </div>
                    </div>

                    <div
                      v-if="option.quantity && option.quantity > 1"
                      class="bottom-segment"
                    >
                      <div
                        v-if="option.saveDisplay"
                        class="products-save"
                      >
                        You Save: {{ option.saveDisplay }}
                      </div>
                      <div class="products-total">
                        {{ option.totalDisplay }} Total
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div
                v-if="section.hurry_label || section.hurry_stock_count"
                class="product-quantity"
              >
                <span aria-hidden="true">⚡</span>
                {{ section.hurry_label || 'HURRY! Selling out fast!' }}
                <span v-if="section.hurry_stock_count">{{ section.hurry_stock_count }}</span>
                {{ section.hurry_stock_suffix || 'left in stock.' }}
              </div>

              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${progressPercent}%` }"
                />
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
                <p
                  v-if="addToCartMessage"
                  class="price-section__commerce-message"
                >
                  {{ addToCartMessage }}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { ProductData, PdpPriceSectionData, PdpPriceSectionOption } from '~/types/content'

import 'swiper/css'

interface PricedPriceSectionOption extends PdpPriceSectionOption {
  priceSymbol: string
  priceAmount: string
  pricePerUnitLabel: string
  totalDisplay: string
  saveDisplay: string
}

const props = defineProps<{
  section: PdpPriceSectionData
  product?: ProductData | null
}>()

const swiperModules = [Autoplay]
const cart = useCart()
const activeOption = ref(0)

const gallery = computed(() => props.section.gallery?.filter((image) => image.url) || [])
const displayTitle = computed(() => normalizeGraviteText(props.section.title))
const progressPercent = computed(() => Math.min(100, Math.max(0, Number(props.section.progress_percent ?? 23))))
const medusaVariantId = computed(() => props.product?.commerce?.default_variant_id)
const isAddingToCart = computed(() => cart.isLoading.value)
const activePurchaseOption = computed(() => pricedOptions.value[activeOption.value])
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

const normalizeGraviteText = (value?: string | null) => {
  return (value || '')
    .replace(/Gravit(?:\\?|Ac|Ã©|e\\u0301|e)/g, 'Gravité')
    .replace(/Gravité/g, 'Gravité')
}

const getCurrencyParts = (amount: number, currencyCode = 'usd') => {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).formatToParts(amount)

  return {
    symbol: parts.find((part) => part.type === 'currency')?.value || '$',
    amount: parts.filter((part) => part.type !== 'currency').map((part) => part.value).join('').trim(),
  }
}

const formatCurrency = (amount: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

const pricedOptions = computed<PricedPriceSectionOption[]>(() => {
  const variant = props.product?.commerce?.variants?.[0]
  const variantPrice = variant?.calculated_price
  const currencyCode = variantPrice?.currency_code || 'usd'
  const prices = (variant?.prices || []).filter((price) => price.currency_code === currencyCode && !price.price_list_id)
  const basePrice = prices.find((price) => !price.min_quantity && !price.max_quantity)
  const fallbackAmount = Number(variantPrice?.calculated_amount ?? variantPrice?.original_amount ?? 0)
  const baseUnitAmount = Number(basePrice?.amount ?? variantPrice?.original_amount ?? fallbackAmount)

  const findUnitAmount = (quantity: number) => {
    const tier = prices
      .filter((price) => {
        const amount = Number(price.amount)
        const minQuantity = Number(price.min_quantity || 0)
        const maxQuantity = Number(price.max_quantity || 0)

        return Number.isFinite(amount)
          && quantity >= Math.max(1, minQuantity || 1)
          && (!maxQuantity || quantity <= maxQuantity)
      })
      .sort((a, b) => Number(b.min_quantity || 0) - Number(a.min_quantity || 0))[0]

    return Number(tier?.amount ?? fallbackAmount)
  }

  return (props.section.purchase_options || [])
    .filter((option) => option.image_url)
    .map((option) => {
      const quantity = Math.max(1, Number(option.quantity || 1))
      const unitAmount = findUnitAmount(quantity)
      const parts = getCurrencyParts(unitAmount, currencyCode)
      const saveAmount = Math.max(0, (baseUnitAmount - unitAmount) * quantity)

      return {
        ...option,
        priceSymbol: parts.symbol,
        priceAmount: parts.amount,
        pricePerUnitLabel: ' /Per Unit',
        totalDisplay: formatCurrency(unitAmount * quantity, currencyCode),
        saveDisplay: saveAmount > 0 ? formatCurrency(saveAmount, currencyCode) : '',
      }
    })
})

watch(pricedOptions, (options) => {
  const defaultIndex = options.findIndex((option) => option.default_selected)
  activeOption.value = defaultIndex >= 0 ? defaultIndex : 0
}, { immediate: true })

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
.btn-reset {
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  text-align: left;
}

.section {
  max-width: 1300px;
  margin: 0 auto;
}

.price-section {
  padding: 100px 0;
  color: #fff;
  background: #14161f;
}

h2,
h3,
h4 {
  font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
  font-weight: 400;
  text-transform: uppercase;
}

h2 {
  font-size: 40px;
  line-height: 48px;
}

.price-inner {
  display: flex;
  gap: 40px;
  align-items: stretch;
}

.slider-section {
  width: 780px;
  max-width: 60%;
  height: 600px;
}

.deodorantSwiper {
  width: 100%;
  height: 600px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.content-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 0 430px;
  max-width: 470px;
}

.product-title {
  margin-bottom: 12px;
  color: #fff !important;
  font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif !important;
  font-size: 40px;
  font-weight: 400;
  line-height: 48px;
  text-transform: uppercase;
}

.product-subtitle {
  display: block;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
}

.bottom-segment {
  margin-top: 8px;
}

.products-wrapper {
  margin-top: 30px;
}

.select-title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.products-inner {
  display: grid;
  grid-template-columns: 210px 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  margin: 0;
}

.price-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: auto;
  min-height: auto;
  gap: 5px;
  padding: 10px;
  border: 3px solid #14161f;
  border-radius: 6px;
  color: inherit;
  background: #1c1e29;
  cursor: pointer;
  transition: border 0.5s;

  &.active {
    border-color: #54555e;
  }

  &:nth-child(1) {
    grid-row: span 2;
    grid-column: 1;
    flex-direction: column;
    width: 100%;
    max-width: 210px;

    .product-image {
      width: 100%;
      height: 150px;
    }

    .product-image img {
      height: 115px;
    }
  }

  &:nth-child(2),
  &:nth-child(3) {
    grid-column: 2;
    width: 274px;

    .product-image {
      width: 68px;
      height: 100%;
    }

    .product-image img {
      height: 67px;
    }
  }

  &:nth-child(2) {
    grid-row: 1;
  }

  &:nth-child(3) {
    grid-row: 2;
  }
}

.product-image {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: radial-gradient(circle, rgb(94 94 95 / 86%) 0%, #222534 70%);

  img {
    width: 100%;
    object-fit: contain;
  }
}

.products-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5px;
}

.qty-segment,
.products-content .bottom-segment {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
}

.qty-segment {
  align-items: flex-end;
}

.products-unit,
.sale-price {
  font-size: 18px;
  font-weight: 700;
}

.sale-price span,
.products-content .bottom-segment {
  font-size: 14px;
  font-weight: 400;
}

.products-save {
  padding: 3px 5px;
  border-radius: 4px;
  background: rgb(0 182 122 / 10%);
}

.product-quantity {
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;

  span:last-of-type {
    color: #ff739c;
  }
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 8px;
  margin-top: 5px;
  overflow: hidden;
  border-radius: 4px;
  background: #1c1e29;
}

.progress-fill {
  height: 100%;
  background: #ff739c;
  transition: width 0.4s ease-in-out;
}

.single_add_to_cart_button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: auto;
  margin-top: 20px;
  margin-bottom: 0;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  color: #14161f;
  background: #fff;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.35;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.5s;

  &.loading::after {
    content: '';
    width: 18px;
    height: 18px;
    border: 2px solid #243360;
    border-bottom-color: transparent;
    border-radius: 50%;
    animation: price-section-spin 0.7s linear infinite;
  }

  &:hover:not(:disabled) {
    color: #fff;
    background: #222534;
  }

  &:hover:not(:disabled).loading::after {
    border-color: #fff;
    border-bottom-color: transparent;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
}

@keyframes price-section-spin {
  to {
    transform: rotate(360deg);
  }
}

.price-section__commerce-message {
  margin-top: 10px;
  color: #ff739c;
  font-size: 14px;
}

.price-section--varros {
  color: #100f0d;
  background: #f1eee9;

  h2,
  h3,
  h4,
  .product-title {
    color: #100f0d !important;
    font-family: Raleway, Arial, sans-serif !important;
    font-weight: 700;
  }

  .product-subtitle {
    color: #100f0d;
  }

  .price-item {
    border: 1px solid #d2d0cc;
    color: #100f0d;
    background: transparent;

    &.active {
      border-color: #100f0d;
    }
  }

  .product-image {
    background: transparent;
  }

  .products-save {
    color: #fff;
    background: #2a5736;
  }

  .product-quantity {
    color: #100f0d;

    span:last-of-type {
      color: #932829;
    }
  }

  .progress-fill {
    background: #932829;
  }

  .single_add_to_cart_button {
    color: #fff;
    background: #932829;

    &:hover:not(:disabled) {
      color: #fff;
      background: #b44244;
    }

    &.loading::after,
    &:hover:not(:disabled).loading::after {
      border-color: #fff;
      border-bottom-color: transparent;
    }
  }
}

@media (max-width: 1310px) {
  .section {
    padding: 0 20px;
  }
}

@media (max-width: 992px) {
  .price-inner {
    flex-direction: column;
  }

  .content-section {
    max-width: none;
    flex-basis: auto;
  }

  .slider-section {
    width: 100%;
    max-width: 100%;
    flex: 1;
  }
}

@media (max-width: 576px) {
  .price-section {
    padding: 50px 0;
  }

  h2 {
    font-size: 24px;
    line-height: 32px;
  }
}

@media (max-width: 481px) {
  .deodorantSwiper,
  .slider-section {
    height: 280px;
  }

  .product-subtitle {
    font-size: 14px;
  }

  .products-inner {
    display: flex;
    flex-direction: column;
  }

  .price-item:nth-child(1),
  .price-item:nth-child(2),
  .price-item:nth-child(3) {
    width: 100%;
    max-width: 100%;
  }
}
</style>
