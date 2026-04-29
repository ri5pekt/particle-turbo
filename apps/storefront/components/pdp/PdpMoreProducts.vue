<template>
  <section
    v-if="section.enabled !== false && products.length"
    class="more-products"
  >
    <div class="more-products__inner">
      <h2 class="more-products__title">
        {{ section.title || 'More Products For You' }}
      </h2>

      <div class="more-products__grid">
        <AppLink
          v-for="item in products"
          :key="item.id"
          class="more-products__card"
          :to="item.handle ? `/product/${item.handle}` : '#'"
        >
          <div class="more-products__image-wrap">
            <img
              v-if="item.thumbnail"
              class="more-products__image"
              :src="item.thumbnail"
              :alt="item.title || 'Particle product'"
              loading="lazy"
            >
          </div>
          <div class="more-products__body">
            <h3 class="more-products__name">
              {{ item.title }}
            </h3>
            <p
              v-if="formatProductPrice(item)"
              class="more-products__price"
            >
              {{ formatProductPrice(item) }}
            </p>
            <span class="more-products__button">
              {{ section.button_label || 'Shop Now' }}
            </span>
          </div>
        </AppLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MedusaProductSummary } from '~/types/commerce'
import type { PdpMoreProductsSectionData, ProductData } from '~/types/content'

const props = defineProps<{
  section: PdpMoreProductsSectionData
  product?: ProductData | null
}>()

const limit = computed(() => Math.max(1, props.section.limit || 4))
const { data } = await useAsyncData(
  () => `pdp-more-products-${props.product?.handle || 'all'}-${limit.value}`,
  () => $fetch<MedusaProductSummary[]>('/api/cart/recommendations', {
    query: {
      exclude_handle: props.product?.handle || '',
      limit: limit.value,
    },
  }),
  {
    default: () => [],
  },
)

const products = computed(() => data.value || [])

const formatProductPrice = (item: MedusaProductSummary) => {
  const price = item.variants?.[0]?.calculated_price
  const amount = Number(price?.calculated_amount ?? price?.original_amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (price?.currency_code || 'usd').toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}
</script>

<style scoped lang="scss">
.more-products {
  padding: 80px 20px;
  background: #fff;
}

.more-products__inner {
  max-width: 1360px;
  margin: 0 auto;
}

.more-products__title {
  margin: 0;
  color: #050446;
  font-family: $font-heading;
  font-size: 50px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  text-transform: capitalize;
}

.more-products__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 55px;
  gap: 24px;
}

.more-products__card {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
  background: #f5f5f5;
  color: #050446;
  text-decoration: none;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;

  &:hover {
    box-shadow: 0 18px 35px rgb(0 0 0 / 10%);
    transform: translateY(-3px);
  }
}

.more-products__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  padding: 28px;
  background: #f5f5f5;
}

.more-products__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.more-products__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 28px;
  text-align: center;
}

.more-products__name {
  margin: 0;
  color: #050446;
  font-family: $font-heading;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.more-products__price {
  margin: 12px 0 0;
  color: #0038b1;
  font-family: $font-heading;
  font-size: 18px;
  font-weight: 700;
}

.more-products__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 145px;
  margin-top: 22px;
  padding: 14px 22px;
  border-radius: 999px;
  background: #0038b1;
  color: #fff;
  font-family: $font-heading;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
}

@media (max-width: 1100px) {
  .more-products__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 625px) {
  .more-products {
    padding: 60px 15px;
  }

  .more-products__title {
    font-size: 40px;
  }

  .more-products__grid {
    grid-template-columns: 1fr;
    margin-top: 35px;
  }
}
</style>
