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
                    <select
                      class="custom-select"
                      :value="item.quantity"
                      :disabled="isLoading"
                      :aria-label="`Select quantity for ${lineItemTitle(item)}`"
                      @change="handleQuantityChange(item.id, $event)"
                    >
                      <option
                        v-for="quantity in quantityOptions"
                        :key="quantity"
                        :value="quantity"
                      >
                        {{ quantity }}
                      </option>
                    </select>
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
                  <span aria-hidden="true">×</span>
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
              <tr class="order-total order-table-sum__subtotal">
                <td>Total</td>
                <td data-title="Total">
                  <strong>{{ formatMoney(cart?.total || 0, cartCurrency) }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <div class="wc-proceed-to-checkout btn-wrapper">
            <AppLink class="checkout-button button alt wc-forward btn btn-sky" to="/checkout">
              {{ section.checkout_label || 'Proceed to secure checkout' }}
            </AppLink>
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
const quantityOptions = [1, 2, 3, 4, 5]

const cartItems = computed(() => cart.value?.items || [])
const hasItems = computed(() => cartItems.value.length > 0)
const cartCurrency = computed(() => cart.value?.currency_code || 'usd')

const amountToMajor = (amount: number, currencyCode = 'usd') => {
  const zeroDecimalCurrencies = new Set(['jpy'])

  return zeroDecimalCurrencies.has(currencyCode.toLowerCase()) ? amount : amount / 100
}

const formatMoney = (amount: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amountToMajor(amount, currencyCode))
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

const handleQuantityChange = async (lineId: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  await updateItem(lineId, Number(target.value))
}

onMounted(() => {
  refreshCart()
})
</script>

<style scoped lang="scss">
.my-cart {
  position: relative;
  margin-top: 120px;
  margin-bottom: 40px;
}

.my-cart h1 {
  max-width: 1440px;
  margin: 0 auto;
  font-size: 45px;
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
  flex: 1 1 930px;
  max-width: 980px;
}

.shop-table-cart {
  width: 100%;
  border-spacing: 0 18px;
  border-collapse: separate;
}

.shop-table-cart tr {
  position: relative;
  background: $color-white;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgb(0 0 0 / 6%);
}

.shop-table-cart td {
  padding: 18px 16px;
  vertical-align: middle;
}

.shop-table-cart__img {
  width: 142px;
}

.shop-table-cart__img a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 118px;
  height: 118px;
  overflow: hidden;
  background: #f3f5fb;
  border-radius: 20px;
}

.shop-table-cart__img img {
  width: auto;
  max-width: 100%;
  max-height: 100%;
  mix-blend-mode: multiply;
}

.product-name h2 {
  margin: 0 0 18px;
  font-size: 27px;
  line-height: 1;
  text-transform: uppercase;
}

.product-name h2 a {
  color: #050446;
}

.product-name h2 :deep(span) {
  color: #0038b1;
}

.custom-select-wrapper {
  display: inline-flex;
}

.quantity select {
  min-width: 74px;
  height: 42px;
  padding: 0 34px 0 16px;
  color: #050446;
  font-family: $font-body;
  font-size: 18px;
  font-weight: 800;
  background: $color-white;
  border: 1px solid rgb(5 4 70 / 18%);
  border-radius: 999px;
  cursor: pointer;
}

.product-price {
  min-width: 190px;
  color: #0038b1;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
}

.product-price ins {
  text-decoration: none;
}

.product-price small {
  color: rgb(5 4 70 / 70%);
  font-size: 13px;
  font-weight: 700;
}

.product-remove {
  width: 58px;
  text-align: center;
}

.shop-table-cart__delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #0038b1;
  font-size: 34px;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
}

.shop-table-cart__delete:disabled,
.quantity select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cart-collaterals {
  flex: 0 0 420px;
}

.order-summary {
  padding: 32px 34px;
  background: $color-white;
  border-radius: 28px;
  box-shadow: 0 12px 40px rgb(0 0 0 / 8%);
}

.order-summary h2 {
  margin: 0 0 28px;
  color: #050446;
  font-size: 38px;
  line-height: 1;
  text-transform: uppercase;
}

.order-summary h2 span {
  color: #0038b1;
}

.order-table-sum {
  width: 100%;
  border-collapse: collapse;
}

.order-table-sum td {
  padding: 12px 0;
  color: #050446;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  border-bottom: 1px solid rgb(5 4 70 / 10%);
}

.order-table-sum td:last-child {
  color: #0038b1;
  text-align: right;
}

.order-table-sum tfoot td {
  padding-top: 22px;
  border-bottom: 0;
  font-size: 24px;
  font-weight: 900;
}

.red {
  color: #2a8f45;
}

.wc-proceed-to-checkout {
  margin-top: 26px;
  text-align: center;
}

.checkout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 58px;
  color: $color-white;
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
  background: #0b44c9;
  border-radius: 999px;
}

.after-checkout-button {
  margin-top: 13px;
  color: #0038b1;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
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
}

@media (max-width: 992px) {
  .my-cart {
    margin-top: 105px;
  }

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
}

@media (max-width: 700px) {
  .shop-table-cart,
  .shop-table-cart tbody,
  .shop-table-cart tr,
  .shop-table-cart td {
    display: block;
    width: 100%;
  }

  .shop-table-cart tr {
    padding: 18px;
  }

  .shop-table-cart td {
    padding: 8px 0;
  }

  .shop-table-cart__img a {
    width: 100%;
    height: 170px;
  }

  .product-name h2 {
    font-size: 22px;
    text-align: center;
  }

  .custom-select-wrapper {
    display: flex;
    justify-content: center;
  }

  .product-price {
    text-align: center;
  }

  .product-remove {
    position: absolute;
    top: 10px;
    right: 12px;
    width: auto;
  }

  .order-summary {
    padding: 26px 20px;
  }

  .order-summary h2 {
    font-size: 30px;
  }
}
</style>

