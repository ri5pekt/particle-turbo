<template>
  <section
    v-if="section.enabled !== false"
    class="my-cart"
  >
    <h1 class="title-2accent">
      <span>{{ section.title_prefix || 'My' }}</span> {{ section.title_accent || 'Cart' }}
    </h1>

    <div v-if="hasItems" class="my-cart__wrapper">
      <form class="woocommerce-cart-form" @submit.prevent>
        <table class="shop_table shop-table-cart shop_table_responsive cart woocommerce-cart-form__contents">
          <tbody>
            <tr
              v-for="item in cartItems"
              :key="item.id"
              class="woocommerce-cart-form__cart-item pfm_render_cart_item_row cart_item"
            >
              <td class="shop-table-cart__img product-thumbnail">
                <AppLink :to="productUrl(item)">
                  <img
                    v-if="item.thumbnail"
                    :src="item.thumbnail"
                    :alt="lineItemTitle(item)"
                  >
                </AppLink>
              </td>

              <td class="product-name" data-title="Product">
                <h2>
                  <AppLink :to="productUrl(item)" v-html="formattedTitle(item)" />
                </h2>

                <div class="custom-select-wrapper">
                  <div class="quantity">
                    <div
                      class="custom-select"
                      :class="{ opened: openQuantityItemId === item.id }"
                    >
                      <button
                        class="custom-select-trigger btn-reset"
                        type="button"
                        :disabled="isLoading"
                        aria-haspopup="listbox"
                        :aria-expanded="openQuantityItemId === item.id"
                        :aria-label="`Select quantity: ${item.quantity}`"
                        @click="toggleQuantityMenu(item.id)"
                      >
                        {{ item.quantity }}
                      </button>

                      <div
                        class="custom-options"
                        role="listbox"
                        aria-label="Quantity"
                      >
                        <button
                          v-for="quantity in quantityOptions"
                          :key="quantity"
                          class="custom-option btn-reset"
                          type="button"
                          role="option"
                          :aria-selected="quantity === item.quantity"
                          :disabled="isLoading"
                          :aria-label="`${quantity} ${quantity === 1 ? 'unit' : 'units'}`"
                          @click="handleQuantityChange(item.id, quantity)"
                        >
                          {{ quantity }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td class="shop-table-cart__price product-price" data-title="Price">
                <div class="awdr_cart_strikeout_line">
                  <ins>
                    <span class="woocommerce-Price-amount amount">
                      <bdi>{{ formatMoney(item.unit_price || 0, cartCurrency) }} <small>Per unit</small></bdi>
                    </span>
                  </ins>
                </div>
              </td>

              <td class="product-remove">
                <button
                  class="shop-table-cart__delete remove btn-reset"
                  type="button"
                  :disabled="isLoading"
                  :aria-label="`Remove ${lineItemTitle(item)} from cart`"
                  @click="removeItem(item.id)"
                >
                  <img src="/icons/delete.svg" alt="" aria-hidden="true">
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <div class="cart-collaterals">
        <div class="order-summary order-summary--first cart_totals">
          <h2><span>Order</span> <b>Summary</b></h2>

          <table class="shop_table shop_table_responsive order-table-sum">
            <tbody>
              <tr class="cart-subtotal order-table-sum__subtotal">
                <td>Subtotal</td>
                <td data-title="Subtotal">{{ formatMoney(cart?.subtotal || 0, cartCurrency) }}</td>
              </tr>

              <tr v-if="cart?.discount_total" class="order-table-sum__tr">
                <td>Discount</td>
                <td data-title="Discount">-{{ formatMoney(cart.discount_total, cartCurrency) }}</td>
              </tr>

              <tr class="woocommerce-shipping-totals shipping order-table-sum__tr">
                <td>Shipping</td>
                <td data-title="Shipping">
                  <span v-if="cart?.shipping_total">{{ formatMoney(cart.shipping_total, cartCurrency) }}</span>
                  <span v-else><span class="red">Free</span></span>
                </td>
              </tr>

              <tr v-if="cart?.tax_total" class="tax-total order-table-sum__tr">
                <td>Tax</td>
                <td data-title="Tax">{{ formatMoney(cart.tax_total, cartCurrency) }}</td>
              </tr>
            </tbody>

            <tfoot>
              <tr class="order-total order-table-sum__total">
                <td>Total</td>
                <td data-title="Total">
                  <strong>{{ formatMoney(cart?.total || 0, cartCurrency) }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <div class="wc-proceed-to-checkout btn-wrapper">
            <button
              class="checkout-button button alt wc-forward btn btn-sky btn-reset"
              type="button"
              :class="{ loading: isCheckoutLoading }"
              :disabled="isCheckoutLoading"
              :aria-busy="isCheckoutLoading"
              @click="handleCheckoutClick"
            >
              <span>{{ section.checkout_label || 'Proceed to secure checkout' }}</span>
              <span v-if="isCheckoutLoading" class="checkout-button__spinner" aria-hidden="true" />
            </button>
            <p v-if="section.monthly_orders_text" class="after-checkout-button">
              {{ section.monthly_orders_text }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="my-cart__empty">
      <p>{{ section.empty_title || 'Your cart is empty.' }}</p>
      <AppLink class="btn btn-sky" :to="section.empty_button_url || '/'">
        {{ section.empty_button_label || 'Continue Shopping' }}
      </AppLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CartLineItem } from '~/types/commerce'
import type { CartMainSectionData } from '~/types/content'

defineProps<{
  section: CartMainSectionData
}>()

const { cart, isLoading, refreshCart, updateItem, removeItem } = useCart()
const router = useRouter()
const quantityOptions = [1, 2, 3, 4, 5]
const openQuantityItemId = ref<string | null>(null)
const isCheckoutLoading = ref(false)

const cartItems = computed(() => cart.value?.items || [])
const hasItems = computed(() => cartItems.value.length > 0)
const cartCurrency = computed(() => cart.value?.currency_code || 'usd')

const formatMoney = (amount: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

const lineItemTitle = (item: CartLineItem) => {
  return item.product_title || item.title || 'Particle product'
}

const formattedTitle = (item: CartLineItem) => {
  const title = lineItemTitle(item)

  return title.startsWith('Particle ')
    ? `<span>Particle</span> ${title.replace('Particle ', '')}`
    : title
}

const productUrl = (item: CartLineItem) => {
  return item.product_handle ? `/product/${item.product_handle}` : '/'
}

const toggleQuantityMenu = (lineId: string) => {
  openQuantityItemId.value = openQuantityItemId.value === lineId ? null : lineId
}

const handleQuantityChange = async (lineId: string, quantity: number) => {
  openQuantityItemId.value = null
  await updateItem(lineId, quantity)
}

const handleCheckoutClick = async () => {
  if (isCheckoutLoading.value) {
    return
  }

  isCheckoutLoading.value = true

  try {
    await router.push('/checkout')
  } finally {
    isCheckoutLoading.value = false
  }
}

onMounted(() => {
  refreshCart()
})
</script>

<style scoped lang="scss">
.my-cart {
  position: relative;
  margin-top: 20px;
  margin-bottom: 20px;
}

.my-cart h1,
.my-cart h2 {
  max-width: 1440px;
  margin: 0 auto;
  font-size: 45px;
  line-height: 1.137;
  text-transform: uppercase;
}

.my-cart__wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 100px;
  max-width: 1840px;
  margin: 0 auto;
}

.woocommerce-cart-form {
  flex: 1 1 800px;
  max-width: 800px;
  margin-top: 20px;
}

.shop-table-cart {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin-top: -20px;
  border: none;
  border-spacing: 0 20px;
  border-collapse: separate;
}

.shop-table-cart tbody tr {
  position: relative;
  background: $color-white;
  border-radius: 24px;
  box-shadow: 0 48px 110px -79px rgb(39 74 153 / 43.9%);
}

.shop-table-cart tbody tr td {
  padding: 14px 0;
  vertical-align: middle;
  border: 1px solid rgb(0 19 67 / 8%);
  border-style: solid none;
}

.shop-table-cart tbody tr td:first-child {
  border-radius: 24px 0 0 24px;
  border-style: solid none solid solid;
}

.shop-table-cart tbody tr td:last-child {
  border-radius: 0 24px 24px 0;
  border-style: solid solid solid none;
}

.shop-table-cart tbody tr td:nth-child(1) {
  width: 213px;
}

.shop-table-cart tbody tr td:nth-child(2) {
  max-width: 266px;
}

.shop-table-cart tbody tr td:nth-child(4) {
  width: 80px;
}

.shop-table-cart tbody tr td h2 {
  max-width: 253px;
  margin: 0 15px 10px 0;
  font-size: 25px;
  font-weight: 800;
  line-height: 113.7%;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.shop-table-cart tbody tr td h2 a {
  color: #050446;
}

.shop-table-cart tbody tr td h2 :deep(span) {
  color: #0038b1;
}

.shop-table-cart__img {
  vertical-align: middle;
}

.shop-table-cart__img a {
  display: inline-block;
}

.shop-table-cart__img img {
  width: auto;
  max-width: 100%;
  max-height: 130px;
  margin-right: auto;
  margin-left: auto;
  object-fit: contain;
}

.custom-select-wrapper {
  position: relative;
  display: inline-block;
}

.custom-select {
  position: relative;
  display: inline-block;
}

.custom-select.opened {
  z-index: 99;
}

.custom-select-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 50px;
  height: 36px;
  color: #222a58;
  font-size: 22px;
  border: 1px solid rgb(34 42 88 / 8%);
  border-radius: 10px;
  cursor: pointer;
}

.custom-select-trigger::after {
  display: block;
  width: 8px;
  height: 8px;
  margin-top: 2px;
  margin-left: 4px;
  border-right: 1px solid #222a58;
  border-bottom: 1px solid #222a58;
  transform: rotate(45deg) translateY(-50%);
  transform-origin: 50% 0;
  transition: all 0.3s ease-in-out;
  content: '';
}

.custom-select.opened .custom-select-trigger::after {
  margin-top: 8px;
  transform: rotate(-135deg) translateY(-50%);
}

.custom-options {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  display: block;
  min-width: 100%;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgb(34 42 88 / 8%);
  border-radius: 5px;
  box-shadow: 0 2px 1px rgb(0 0 0 / 20%);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-15px);
  transition: all 0.3s ease-in-out;
  pointer-events: none;
}

.custom-select.opened .custom-options {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: all;
}

.custom-option {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.custom-option:hover,
.custom-option[aria-selected='true'] {
  background: #efefef;
}

.product-price {
  color: #050446;
  font-family: $font-ui;
  font-size: 25px;
  font-weight: 500;
  line-height: 113.7%;
  text-transform: capitalize;
}

.product-remove {
  width: 80px;
}

.shop-table-cart__price ins {
  text-decoration: none;
}

.shop-table-cart__price ins bdi {
  display: flex;
  align-items: end;
}

.shop-table-cart__price small {
  margin-bottom: 5px;
  margin-left: 5px;
  color: #050446;
  font-family: $font-body;
  font-size: 14px;
  font-weight: 500;
  line-height: 113.7%;
  opacity: 0.7;
}

.shop-table-cart__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
}

.shop-table-cart__delete img {
  width: 24px;
  height: 24px;
}

.shop-table-cart__delete:disabled,
.custom-select-trigger:disabled,
.custom-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cart-collaterals {
  flex: 0 0 auto;
}

.order-summary {
  background: $color-white;
  border: 1px solid rgb(0 19 67 / 8%);
  border-radius: 42px;
  box-shadow: 0 84px 110px -79px rgb(39 74 153 / 44%);
  box-sizing: border-box;
  min-width: 615px;
  max-width: 615px;
  margin-top: 20px;
  padding: 25px 55px 20px;
  overflow: hidden;
}

.order-summary h2 {
  margin-bottom: 21px;
  font-size: 32px;
  font-weight: 800;
  line-height: 113.7%;
  letter-spacing: 0.02em;
}

.order-summary h2 span {
  color: #0038b1;
}

.order-table-sum {
  position: relative;
  flex: 1;
  width: 100%;
  border: none;
  border-spacing: 0;
  border-collapse: separate;
}

.order-table-sum td {
  padding: 0;
  color: rgb(34 42 88 / 70%);
  font-size: 20px;
  font-weight: 400;
  line-height: 2;
  text-transform: capitalize;
}

.order-table-sum td:last-child {
  text-align: right;
}

.order-table-sum td:last-child,
.order-table-sum td:last-child strong {
  color: #050446;
  font-family: $font-ui;
  font-size: 25px;
  font-weight: 500;
  line-height: 113.7%;
}

.order-table-sum__total td {
  padding: 24px 0;
  color: #222a58;
  font-size: 25px;
  font-weight: 700;
  line-height: 133.7%;
  border-top: 1px solid rgb(214 221 235 / 70%);
}

.red {
  color: #050446;
  font-size: 25px;
  font-weight: 400;
  text-transform: uppercase;
}

.wc-proceed-to-checkout {
  margin-top: 0;
  text-align: center;
}

.checkout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 15px;
  border: 0;
  color: $color-white;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  background: #4e8b5f;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.25s;
}

.checkout-button::before {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-top: -2px;
  margin-right: 5px;
  background: currentcolor;
  content: '';
  mask: url('/icons/lock-icon.svg') center / contain no-repeat;
}

.checkout-button.loading::before {
  display: none;
}

.checkout-button:disabled {
  cursor: wait;
  opacity: 0.85;
}

.checkout-button:disabled:hover {
  background: #4e8b5f;
}

.checkout-button__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid $color-white;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: checkout-button-spin 0.8s linear infinite;
}

.checkout-button:hover {
  background: #28a84d;
}

@keyframes checkout-button-spin {
  to {
    transform: rotate(360deg);
  }
}

.after-checkout-button {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
}

.my-cart__empty {
  max-width: 720px;
  margin: 40px auto 0;
  padding: 44px 24px;
  text-align: center;
  background: $color-white;
  border-radius: 28px;
  box-shadow: 0 12px 40px rgb(0 0 0 / 6%);
}

.my-cart__empty p {
  margin-bottom: 22px;
  color: #050446;
  font-size: 28px;
  font-weight: 800;
}

.my-cart__empty .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 12px 26px;
  color: $color-white;
  font-weight: 800;
  text-transform: uppercase;
  background: #0b44c9;
  border-radius: 999px;
}

@media (max-width: 1440px) {
  .my-cart {
    padding: 0 20px;
  }

  .my-cart__wrapper {
    gap: 60px;
  }

  .shop-table-cart tbody tr td h2 {
    font-size: 20px;
  }

  .shop-table-cart tbody tr td:nth-child(1) {
    width: 145px;
  }

  .shop-table-cart tbody tr td:nth-child(4) {
    width: 75px;
  }

  .shop-table-cart__img img {
    width: 60px;
  }

  .order-summary {
    min-width: 461px;
    padding: 33px 25px 27px;
  }

  .order-summary h2 {
    font-size: 26px;
  }

  .order-table-sum td:last-child,
  .order-table-sum td:last-child strong,
  .red {
    font-size: 22px;
  }
}

@media (max-width: 992px) {
  .my-cart h1 {
    font-size: 30px;
  }

  .my-cart__wrapper {
    flex-wrap: wrap;
    gap: 15px;
  }

  .woocommerce-cart-form,
  .cart-collaterals {
    flex-basis: 100%;
    max-width: 100%;
  }

  .woocommerce-cart-form {
    width: 100%;
  }

  .shop-table-cart {
    margin-right: auto;
    margin-left: auto;
  }

  .order-summary {
    width: 100%;
    max-width: none;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .shop-table-cart tbody tr td:nth-child(2) {
    max-width: 127px;
  }
}

@media (max-width: 576px) {
  .my-cart {
    margin-bottom: 0;
  }

  .my-cart h1,
  .my-cart h2 {
    font-size: 25px;
  }

  .shop-table-cart tbody tr td {
    padding: 14px 0;
  }

  .shop-table-cart tbody tr td h2 {
    margin-bottom: 10px;
    font-size: 13px;
  }

  .shop-table-cart tbody tr td:nth-child(1) {
    width: 70px;
  }

  .shop-table-cart tbody tr td:nth-child(4) {
    width: 47px;
  }

  .shop-table-cart__img img {
    width: 80px;
    height: auto;
    margin-left: 0;
  }

  .shop-table-cart__price {
    font-size: 11px;
  }

  .shop-table-cart__price .woocommerce-Price-amount {
    font-size: 15px;
  }

  .shop-table-cart__price ins bdi {
    display: block;
  }

  .shop-table-cart__price small {
    display: block;
    margin-left: 0;
  }

  .shop-table-cart__delete {
    justify-content: flex-end;
    margin-right: 7px;
    margin-bottom: 5px;
  }

  .order-summary h2 {
    font-size: 15px;
  }

  .order-table-sum {
    border-spacing: 0 7px;
  }

  .order-table-sum td {
    font-size: 15px;
  }

  .order-table-sum td:last-child,
  .order-table-sum td:last-child strong,
  .red {
    font-size: 15px;
  }

  .order-table-sum__total td,
  .order-table-sum__total td:last-child,
  .order-table-sum__total td:last-child strong {
    padding: 12px 0;
    font-size: 18px;
  }

  .btn-wrapper .btn-sky {
    height: 48px;
    margin-top: 0;
    font-size: 13px;
  }
}

@media (max-width: 481px) {
  .order-summary--first {
    min-width: 100%;
    padding: 15px 20px 33px;
    border-radius: 24px;
  }
}
</style>

