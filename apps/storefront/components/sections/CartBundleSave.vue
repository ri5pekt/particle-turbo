<template>
  <section
    v-if="offers.length"
    class="cart-bundles-sets"
  >
    <div class="cart-bundles-sets__container">
      <h2 class="title-2accent">
        <span>Bundle</span> and Save
      </h2>

      <div class="cart-bundles-sets__wrapper">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="cart-bundles-sets__item"
        >
          <div class="cart-bundles-sets__img">
            <AppLink :to="`/product/${offer.product_handle}`">
              <img
                v-if="offer.thumbnail"
                :src="offer.thumbnail"
                :alt="offer.product_title"
                decoding="async"
              >
            </AppLink>
          </div>

          <div class="cart-bundles-sets__content">
            <h3 v-html="formattedTitle(offer.product_title)" />
            <p v-if="offer.description">{{ offer.description }}</p>
            <div
              v-if="savingAmount(offer) > 0"
              class="cart-bundles-sets__save cart-bundles-sets__save--mobile"
            >
              You save
              <span class="woocommerce-Price-amount amount">
                <bdi>
                  <span class="woocommerce-Price-currencySymbol">{{ currencySymbol }}</span>{{ formatAmount(savingAmount(offer)) }}
                </bdi>
              </span>
            </div>
          </div>

          <div
            class="cart-bundles-sets__price"
            :aria-label="`Old price ${formatMoney(offer.regular_price)}, new price ${formatMoney(offer.special_price)}`"
          >
            <div
              v-if="offer.regular_price > offer.special_price"
              class="cart-bundles-sets__cup"
              aria-hidden="true"
            >
              <span class="woocommerce-Price-amount amount">
                <bdi>
                  <span class="woocommerce-Price-currencySymbol">{{ currencySymbol }}</span>{{ formatAmount(offer.regular_price) }}
                </bdi>
              </span>
            </div>
            <div class="cart-bundles-sets__pr" aria-hidden="true">
              <span class="woocommerce-Price-amount amount">
                <bdi>
                  <span class="woocommerce-Price-currencySymbol">{{ currencySymbol }}</span>{{ formatAmount(offer.special_price) }}
                </bdi>
              </span>
            </div>
            <div
              v-if="savingAmount(offer) > 0"
              class="cart-bundles-sets__save"
            >
              You save
              <span class="woocommerce-Price-amount amount">
                <bdi>
                  <span class="woocommerce-Price-currencySymbol">{{ currencySymbol }}</span>{{ formatAmount(savingAmount(offer)) }}
                </bdi>
              </span>
            </div>
          </div>

          <div class="cart-bundles-sets__btn">
            <button
              class="button alt btn btn-sky btn-bas-add-to-cart"
              type="button"
              :disabled="addingId === offer.id || isLoading"
              @click="addOffer(offer)"
            >
              <span v-if="addingId === offer.id" class="bas-spinner" aria-hidden="true" />
              <span>{{ addingId === offer.id ? 'Adding…' : 'Add To Cart' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BasOffer } from '~/types/commerce'

const { cart, isLoading, refreshCart } = useCart()

const offers = ref<BasOffer[]>([])
const addingId = ref<string | null>(null)

const cartCurrency = computed(() => cart.value?.currency_code || 'usd')

const currencySymbol = computed(() => {
  try {
    return (0).toLocaleString('en-US', {
      style: 'currency',
      currency: cartCurrency.value.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim()
  } catch {
    return '$'
  }
})

const formatAmount = (amount: number) => {
  return amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: cartCurrency.value.toUpperCase(),
  }).format(amount)
}

const savingAmount = (offer: BasOffer) => Math.max(0, offer.regular_price - offer.special_price)

const formattedTitle = (title: string) =>
  title.startsWith('Particle ')
    ? `<span>Particle</span> ${title.replace('Particle ', '')}`
    : title

const loadOffers = async () => {
  const cartId = cart.value?.id
  if (!cartId) {
    offers.value = []
    return
  }
  try {
    const res = await $fetch<{ offers: BasOffer[] }>('/api/bas/offers', {
      query: { cart_id: cartId },
    })
    offers.value = res.offers || []
  } catch {
    offers.value = []
  }
}

const addOffer = async (offer: BasOffer) => {
  const cartId = cart.value?.id
  if (!cartId || addingId.value) return

  addingId.value = offer.id

  try {
    await $fetch('/api/bas/add', {
      method: 'POST',
      body: {
        cart_id: cartId,
        rule_id: offer.id,
        offer_variant_id: offer.offer_variant_id,
        special_price: offer.special_price,
      },
    })
    await refreshCart()
    await loadOffers()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    // silent – cart refresh will show any issues
  } finally {
    addingId.value = null
  }
}

watch(
  () => cart.value?.id,
  (id) => {
    if (id) void loadOffers()
    else offers.value = []
  },
  { immediate: true }
)

watch(
  () => cart.value?.items?.length,
  () => {
    void loadOffers()
  }
)
</script>

<style scoped lang="scss">
.cart-bundles-sets {
  margin-top: 60px;
}

.cart-bundles-sets__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-bundles-sets__container h2 {
  margin-bottom: 24px;
  font-size: 45px;
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1.137;
}

.cart-bundles-sets__container h2 span {
  color: #0038b1;
}

.cart-bundles-sets__wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  max-width: 1000px;
}

.cart-bundles-sets__item {
  display: grid;
  grid-template-columns: 160px 1fr auto auto;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid rgb(0 19 67 / 8%);
  border-radius: 24px;
  box-shadow: 0 48px 110px -79px rgb(39 74 153 / 44%);
}

.cart-bundles-sets__img {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-bundles-sets__img img {
  width: 100%;
  max-width: 140px;
  max-height: 140px;
  object-fit: contain;
}

.cart-bundles-sets__content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 800;
  color: #050446;
  line-height: 1.15;
  text-transform: capitalize;
}

.cart-bundles-sets__content h3 :deep(span) {
  color: #0038b1;
}

.cart-bundles-sets__content p {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 500;
  color: rgb(5 4 70 / 70%);
  line-height: 1.5;
}

.cart-bundles-sets__save--mobile {
  display: none;
  font-size: 13px;
  color: #4e8b5f;
  font-weight: 600;
}

.cart-bundles-sets__price {
  text-align: center;
  min-width: 100px;
}

.cart-bundles-sets__cup {
  text-decoration: line-through;
  color: rgb(5 4 70 / 45%);
  font-size: 18px;
}

.cart-bundles-sets__pr {
  font-size: 26px;
  font-weight: 700;
  color: #050446;
}

.cart-bundles-sets__save {
  font-size: 13px;
  color: #4e8b5f;
  font-weight: 600;
  white-space: nowrap;
}

.cart-bundles-sets__btn {
  min-width: 140px;
}

.btn-bas-add-to-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 48px;
  padding: 0 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  background: #0b44c9;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-bas-add-to-cart:hover:not(:disabled) {
  background: #0837a5;
}

.btn-bas-add-to-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.bas-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: bas-spin 0.8s linear infinite;
}

@keyframes bas-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .cart-bundles-sets__item {
    grid-template-columns: 100px 1fr auto;
    grid-template-rows: auto auto;
  }

  .cart-bundles-sets__price {
    grid-column: 3;
    grid-row: 1;
  }

  .cart-bundles-sets__btn {
    grid-column: 1 / -1;
  }
}

@media (max-width: 576px) {
  .cart-bundles-sets__container h2 {
    font-size: 30px;
  }

  .cart-bundles-sets__item {
    grid-template-columns: 80px 1fr;
    gap: 12px;
  }

  .cart-bundles-sets__price {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cart-bundles-sets__save--mobile {
    display: block;
  }

  .cart-bundles-sets__save:not(.cart-bundles-sets__save--mobile) {
    display: none;
  }

  .cart-bundles-sets__btn {
    grid-column: 1 / -1;
  }
}
</style>
