<template>
  <Teleport to="body">
    <div class="cart-sidebar" :class="{ open: isOpen }">
      <button
        class="bg btn-reset"
        type="button"
        aria-label="Close cart"
        @click="closeCart"
      />
      <aside
        class="sidebar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div class="sidebar-innner">
          <div class="part-main">
            <h2 id="cart-title" class="title" role="status">
              Added to cart!
            </h2>
            <p class="subtitle">Holding your item for:</p>

            <div class="counter" aria-label="Cart reservation timer">
              <div class="digit">
                <p class="num">{{ timerMinutes }}</p>
                <p class="label">Minutes</p>
              </div>
              <div class="sep">:</div>
              <div class="digit">
                <p class="num">{{ timerSeconds }}</p>
                <p class="label">Seconds</p>
              </div>
            </div>

            <div v-if="displayItem" class="box-product main-product">
              <div v-if="displayItem.thumbnail" class="image">
                <img
                  :src="displayItem.thumbnail"
                  :alt="lineItemTitle(displayItem)"
                >
              </div>
              <p class="title">{{ lineItemTitle(displayItem) }}</p>
              <p class="cart-sidebar__quantity">Qty: {{ displayItem.quantity }}</p>
            </div>

            <p v-else class="cart-sidebar__empty">Your cart is empty.</p>
          </div>

          <div v-if="recommendations.length" class="part-bottom">
            <h3 class="title">Other Products You'll Love:</h3>

            <div class="slider-wrapper">
              <div class="slider-products-sidebar">
                <div class="swiper-wrapper">
                  <AppLink
                    v-for="product in recommendations"
                    :key="product.id"
                    class="box-product"
                    :to="product.handle ? `/product/${product.handle}` : '#'"
                    @click="closeCart"
                  >
                    <div class="image">
                      <img
                        v-if="product.thumbnail"
                        :src="product.thumbnail"
                        :alt="product.title || ''"
                      >
                    </div>
                    <p class="title">
                      {{ product.title }}
                    </p>
                  </AppLink>
                </div>
              </div>
            </div>
          </div>

          <div class="part-main centered">
            <div v-if="cart?.total !== undefined" class="cart-sidebar__total">
              Total: {{ formatMoney(cart.total, cart.currency_code) }}
            </div>
            <AppLink class="button-cart" to="/cart" @click="closeCart">
              <span>My Cart</span>
              <img src="/icons/basket.svg" alt="">
            </AppLink>
            <button class="button-shopping btn-reset" type="button" @click="closeCart">
              Continue Shopping
            </button>
          </div>

          <button
            class="close-button btn-reset"
            type="button"
            aria-label="Close sidebar"
            @click="closeCart"
          >
            <svg aria-hidden="true" focusable="false" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M443.6 387.1 312.4 255.4l131.5-130c5.4-5.4 5.4-14.2 0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4s-7.2 1.5-9.8 4L256 197.8 124.9 68.3c-2.6-2.6-6.1-4-9.8-4s-7.2 1.5-9.8 4L68 105.9c-5.4 5.4-5.4 14.2 0 19.6l131.5 130L68.4 387.1c-2.6 2.6-4.1 6.1-4.1 9.8s1.4 7.2 4.1 9.8l37.4 37.6c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1L256 313.1l130.7 131.1c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1l37.4-37.6c2.6-2.6 4.1-6.1 4.1-9.8 0-3.6-1.5-7.1-4.2-9.8z" />
            </svg>
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CartLineItem } from '~/types/commerce'

const {
  cart,
  isOpen,
  lastAddedItem,
  recommendations,
  closeCart,
  refreshCart,
} = useCart()

const remainingSeconds = ref(12 * 60)
let timerId: number | undefined

const displayItem = computed(() => {
  return lastAddedItem.value || cart.value?.items?.[cart.value.items.length - 1] || null
})
const timerMinutes = computed(() => String(Math.floor(remainingSeconds.value / 60)).padStart(2, '0'))
const timerSeconds = computed(() => String(remainingSeconds.value % 60).padStart(2, '0'))

const lineItemTitle = (item: CartLineItem) => {
  return item.product_title || item.title || item.subtitle || 'Particle product'
}

const formatMoney = (amount: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

watch(isOpen, (open) => {
  if (open) {
    remainingSeconds.value = 12 * 60
  }
})

onMounted(() => {
  refreshCart()
  timerId = window.setInterval(() => {
    if (isOpen.value && remainingSeconds.value > 0) {
      remainingSeconds.value -= 1
    }
  }, 1000)

  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (timerId) {
    window.clearInterval(timerId)
  }

  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeCart()
  }
}
</script>

<style scoped lang="scss">
.cart-sidebar.open .bg {
  opacity: 1;
  visibility: visible;
}

.cart-sidebar.open .sidebar {
  right: 0;
  opacity: 1;
  visibility: visible;
}

.cart-sidebar .bg {
  position: fixed;
  inset: 0;
  z-index: 900;
  background-color: rgb(0 0 0 / 70%);
  opacity: 0;
  visibility: hidden;
  transition: 0.5s;
}

.cart-sidebar .sidebar {
  position: fixed;
  top: 0;
  right: -360px;
  bottom: 0;
  z-index: 999;
  width: 360px;
  overflow-x: hidden;
  overflow-y: auto;
  background: #ebf0f4;
  box-shadow: 0 5px 15px rgb(0 0 0 / 25%);
  opacity: 0;
  visibility: hidden;
  transition: 0.5s;
}

.sidebar-innner {
  min-height: 100%;
}

.part-main {
  padding: 25px 10px;
  background: $color-white;
}

.part-main.centered {
  text-align: center;
}

.part-main > .title {
  color: #0038b1;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
}

.part-main > .subtitle {
  margin-top: 10px;
  color: #0038b1;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}

.counter {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  direction: ltr;
}

.digit {
  text-align: center;
}

.digit .num {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.digit .label {
  font-size: 15px;
  font-weight: 400;
}

.sep {
  margin: 10px 15px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.box-product {
  color: #0038b1;
  text-align: center;
}

.main-product {
  margin-top: 25px;
}

.box-product .image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-product .image {
  height: 160px;
}

.box-product img {
  width: auto;
  max-width: 100%;
  max-height: 100%;
}

.main-product .title {
  margin-top: 15px;
  font-size: 25px;
  font-weight: 700;
  line-height: 1;
}

.cart-sidebar__quantity,
.cart-sidebar__empty {
  margin-top: 8px;
  color: #050446;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.part-bottom {
  padding: 20px 10px;
  background: #ebf0f4;
}

.part-bottom > .title {
  color: #0038b1;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
}

.slider-wrapper {
  position: relative;
  padding: 0 30px;
}

.slider-products-sidebar {
  margin-top: 20px;
  overflow: hidden;
}

.swiper-wrapper {
  display: grid;
  grid-auto-columns: 122px;
  grid-auto-flow: column;
  gap: 35px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.swiper-wrapper::-webkit-scrollbar {
  display: none;
}

.slider-products-sidebar .box-product {
  display: block;
}

.slider-products-sidebar .image {
  height: 120px;
  padding: 4px;
  overflow: hidden;
  background: $color-white;
  border-radius: 15px;
}

.slider-products-sidebar .title {
  margin-top: 10px;
  color: #0038b1;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  transition: 0.25s;
}

.cart-sidebar__total {
  margin-bottom: 10px;
  color: #050446;
  font-size: 18px;
  font-weight: 800;
}

.button-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  padding: 15px 0;
  color: $color-white;
  font-size: 25px;
  font-weight: 700;
  line-height: 1;
  background-color: #0038b1;
  border-radius: 200px;
  transition: background-color 0.25s;
}

.button-cart img {
  position: relative;
  width: 25px;
  margin-left: 7px;
  filter: brightness(0) invert(1);
  animation: bag-shake 4s ease-in-out infinite;
}

.button-cart:hover {
  background-color: #3269e0;
}

.button-shopping {
  display: block;
  margin: 10px auto 0;
  color: #050446;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  text-decoration: underline;
  transition: color 0.25s;
}

.button-shopping:hover {
  color: #0038b1;
}

.close-button {
  position: absolute;
  top: 3px;
  left: 8px;
  color: #0038b1;
  cursor: pointer;
}

.close-button svg {
  width: 15px;
  height: 15px;
}

@keyframes bag-shake {
  0%,
  12%,
  100% {
    transform: rotate(0);
  }

  2%,
  6%,
  10% {
    transform: rotate(-10deg);
  }

  4%,
  8% {
    transform: rotate(10deg);
  }
}

@media only screen and (max-width: 1360px) {
  .part-main {
    padding-top: 10px;
    padding-bottom: 20px;
  }

  .part-main > .title {
    font-size: 26px;
  }

  .digit .num {
    font-size: 32px;
  }

  .digit .label {
    font-size: 13px;
  }

  .main-product {
    margin-top: 15px;
  }

  .main-product .image {
    height: 110px;
  }

  .main-product .title {
    margin-top: 10px;
    font-size: 20px;
  }

  .part-bottom {
    padding: 15px 10px;
  }

  .part-bottom > .title {
    font-size: 18px;
  }

  .slider-wrapper {
    padding: 0 20px;
  }

  .slider-products-sidebar .image {
    height: 90px;
  }

  .slider-products-sidebar .title {
    margin-top: 8px;
    font-size: 15px;
  }

  .button-cart {
    margin-top: 5px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .cart-sidebar .sidebar {
    right: -100%;
    width: 100%;
  }
}
</style>

