<template>
  <div class="checkout-page woocommerce woocommerce-checkout">
    <ul class="card-breadcrumbs" aria-label="Checkout steps">
      <li class="card-breadcrumbs__item card-breadcrumbs__item--checked">
        <span>1</span> Order Details
      </li>
      <li class="card-breadcrumbs__item card-breadcrumbs__item--active" aria-current="step">
        <span>2</span> Delivery &amp; Payment
      </li>
      <li class="card-breadcrumbs__item">
        <span>3</span> Confirmation
      </li>
    </ul>

    <div class="strip-bar">
      <div class="content">
        <div class="info">
          <span class="title">Hurry up! Your cart is reserved for</span>
          <b><span id="time-clock">{{ reservationTime }}</span></b>&nbsp;mins
        </div>
      </div>
    </div>

    <section class="my-cart my-cart--checkout">
      <form
        name="checkout"
        class="checkout woocommerce-checkout"
        novalidate
        @submit.prevent="handleCheckoutSubmit"
      >
        <div class="my-cart__wrapper">
          <div class="form-checkout showPayment">
            <div class="green-block">
              <div>{{ checkoutSection.guarantee_text || fallbackSection.guarantee_text }}</div>
              <div class="border" aria-hidden="true" />
              <div>{{ checkoutSection.free_shipping_text || fallbackSection.free_shipping_text }}</div>
            </div>

            <section id="customer_details" class="checkout-fields">
              <h1 class="title-2accent">
                <span>{{ checkoutSection.billing_title_prefix || fallbackSection.billing_title_prefix }}</span>
                {{ checkoutSection.billing_title_accent || fallbackSection.billing_title_accent }}
              </h1>

              <div class="woocommerce-billing-fields__field-wrapper form-checkout form-checkout__fields">
                <CheckoutField
                  v-model="form.email"
                  id="billing_email"
                  class="form-row-wide"
                  :label="checkoutSection.email_label || fallbackSection.email_label"
                  type="email"
                  autocomplete="email"
                />
                <CheckoutField
                  v-model="form.firstName"
                  id="billing_first_name"
                  class="form-row--50w"
                  :label="checkoutSection.first_name_label || fallbackSection.first_name_label"
                  autocomplete="given-name"
                />
                <CheckoutField
                  v-model="form.lastName"
                  id="billing_last_name"
                  class="form-row--50w"
                  :label="checkoutSection.last_name_label || fallbackSection.last_name_label"
                  autocomplete="family-name"
                />
                <CheckoutField
                  v-model="form.address1"
                  id="billing_address_1"
                  class="form-row-wide"
                  :label="checkoutSection.address_1_label || fallbackSection.address_1_label"
                  autocomplete="address-line1"
                />
                <CheckoutField
                  v-model="form.address2"
                  id="billing_address_2"
                  class="form-row-wide"
                  :label="checkoutSection.address_2_label || fallbackSection.address_2_label"
                  autocomplete="address-line2"
                />
                <CheckoutField
                  v-model="form.city"
                  id="billing_city"
                  class="form-row--50w"
                  :label="checkoutSection.city_label || fallbackSection.city_label"
                  autocomplete="address-level2"
                />
                <CheckoutField
                  v-model="form.state"
                  id="billing_state"
                  class="form-row--50w"
                  :label="checkoutSection.state_label || fallbackSection.state_label"
                  autocomplete="address-level1"
                />
                <CheckoutField
                  v-model="form.postalCode"
                  id="billing_postcode"
                  class="form-row--50w"
                  :label="checkoutSection.postcode_label || fallbackSection.postcode_label"
                  autocomplete="postal-code"
                />
                <CheckoutField
                  v-model="form.phone"
                  id="billing_phone"
                  class="form-row--50w"
                  :label="checkoutSection.phone_label || fallbackSection.phone_label"
                  type="tel"
                  autocomplete="tel"
                />
              </div>
            </section>

            <section class="woocommerce-shipping-fields checkout-fields">
              <p class="form-row form-row--chkbox">
                <label>
                  <input v-model="shipToDifferentAddress" type="checkbox">
                  <span>{{ checkoutSection.ship_different_label || fallbackSection.ship_different_label }}</span>
                </label>
              </p>

              <div
                v-if="shipToDifferentAddress"
                class="woocommerce-shipping-fields__field-wrapper form-checkout form-checkout__fields"
              >
                <CheckoutField
                  v-model="shipping.firstName"
                  id="shipping_first_name"
                  class="form-row--50w"
                  :label="checkoutSection.first_name_label || fallbackSection.first_name_label"
                  autocomplete="shipping given-name"
                />
                <CheckoutField
                  v-model="shipping.lastName"
                  id="shipping_last_name"
                  class="form-row--50w"
                  :label="checkoutSection.last_name_label || fallbackSection.last_name_label"
                  autocomplete="shipping family-name"
                />
                <CheckoutField
                  v-model="shipping.address1"
                  id="shipping_address_1"
                  class="form-row-wide"
                  :label="checkoutSection.address_1_label || fallbackSection.address_1_label"
                  autocomplete="shipping address-line1"
                />
                <CheckoutField
                  v-model="shipping.address2"
                  id="shipping_address_2"
                  class="form-row-wide"
                  :label="checkoutSection.address_2_label || fallbackSection.address_2_label"
                  autocomplete="shipping address-line2"
                />
                <CheckoutField
                  v-model="shipping.city"
                  id="shipping_city"
                  class="form-row--50w"
                  :label="checkoutSection.city_label || fallbackSection.city_label"
                  autocomplete="shipping address-level2"
                />
                <CheckoutField
                  v-model="shipping.state"
                  id="shipping_state"
                  class="form-row--50w"
                  :label="checkoutSection.state_label || fallbackSection.state_label"
                  autocomplete="shipping address-level1"
                />
                <CheckoutField
                  v-model="shipping.postalCode"
                  id="shipping_postcode"
                  class="form-row--50w"
                  :label="checkoutSection.postcode_label || fallbackSection.postcode_label"
                  autocomplete="shipping postal-code"
                />
                <CheckoutField
                  v-model="shipping.phone"
                  id="shipping_phone"
                  class="form-row--50w"
                  :label="checkoutSection.phone_label || fallbackSection.phone_label"
                  type="tel"
                  autocomplete="shipping tel"
                />
              </div>
            </section>

            <section class="checkout-fields checkout-fields--payment">
              <h2 class="title-2accent">
                <span>{{ checkoutSection.payment_title_prefix || fallbackSection.payment_title_prefix }}</span>
                {{ checkoutSection.payment_title_accent || fallbackSection.payment_title_accent }}
              </h2>

              <div class="payment-placeholder">
                <p class="form-row form-row-wide hosted-field-row">
                  <span class="woocommerce-input-wrapper has-value">
                    <label class="field-label" for="card_number">
                      {{ checkoutSection.card_number_label || fallbackSection.card_number_label }}
                    </label>
                    <span id="card_number" class="input-text input-custom hosted-field" />
                  </span>
                </p>
                <p class="form-row form-row--50w hosted-field-row">
                  <span class="woocommerce-input-wrapper has-value">
                    <label class="field-label" for="card_expiry">
                      {{ checkoutSection.card_expiry_label || fallbackSection.card_expiry_label }}
                    </label>
                    <span id="card_expiry" class="input-text input-custom hosted-field" />
                  </span>
                </p>
                <p class="form-row form-row--50w hosted-field-row">
                  <span class="woocommerce-input-wrapper has-value">
                    <label class="field-label" for="card_cvv">
                      {{ checkoutSection.card_cvv_label || fallbackSection.card_cvv_label }}
                    </label>
                    <span id="card_cvv" class="input-text input-custom hosted-field" />
                  </span>
                </p>
              </div>

              <p class="payment-note">
                {{ checkoutSection.payment_note || fallbackSection.payment_note }}
              </p>

              <p v-if="checkoutError" class="checkout-error">
                {{ checkoutError }}
              </p>

              <p v-if="checkoutSuccess" class="checkout-success">
                {{ checkoutSuccess }}
              </p>

              <div class="place-order">
                <button
                  class="button alt btn btn-sky"
                  type="submit"
                  :disabled="isCheckoutSubmitting || !isBraintreeReady"
                >
                  {{ isCheckoutSubmitting ? 'Processing...' : 'Place Secure Order' }}
                </button>
              </div>
            </section>
          </div>

          <aside class="order-summary order-summary--first cart_totals">
            <h2><span>Order</span> <b>Summary</b></h2>

            <button
              class="order-summary__items-toggle btn-reset drd-head"
              type="button"
              :aria-expanded="isSummaryOpen"
              @click="isSummaryOpen = !isSummaryOpen"
            >
              <span class="drd-title">{{ itemCount }} {{ itemCount === 1 ? 'Item' : 'Items' }}</span>
              <div>{{ formatMoney(cartState.cart.value?.item_total || cartState.cart.value?.subtotal || 0, cartCurrency) }}</div>
              <svg class="order-summary__chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#050446" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <ul v-if="isSummaryOpen" class="order-summary__items drd-body">
              <li v-for="item in cartItems" :key="item.id">
                <img v-if="item.thumbnail" :src="item.thumbnail" :alt="lineItemTitle(item)">
                <div class="drd-body__content">
                  <h4>{{ lineItemTitle(item) }}</h4>
                  <div class="drd-body__qty">Qty:<strong>{{ item.quantity }}</strong></div>
                </div>
                <span class="drd-body__price">{{ formatMoney(item.total || 0, cartCurrency) }}</span>
              </li>
            </ul>

            <table class="shop_table shop_table_responsive order-table-sum">
              <tbody>
                <tr class="cart-subtotal order-table-sum__subtotal">
                  <td>Subtotal</td>
                  <td data-title="Subtotal">
                    <span>{{ formatMoney(cartState.cart.value?.subtotal || 0, cartCurrency) }}</span>
                  </td>
                </tr>

                <tr v-if="cartState.cart.value?.discount_total" class="order-table-sum__tr">
                  <td>Discount</td>
                  <td data-title="Discount">
                    <span>-{{ formatMoney(cartState.cart.value.discount_total, cartCurrency) }}</span>
                  </td>
                </tr>

                <tr class="woocommerce-shipping-totals shipping order-table-sum__tr">
                  <td>Shipping</td>
                  <td data-title="Shipping">
                    <span v-if="cartState.cart.value?.shipping_total">
                      {{ formatMoney(cartState.cart.value.shipping_total, cartCurrency) }}
                    </span>
                    <span v-else class="red">Free</span>
                  </td>
                </tr>

                <tr class="fee order-table-sum__tr">
                  <td>Package Protection</td>
                  <td data-title="Package Protection">
                    <span>$1.99</span>
                  </td>
                </tr>

                <tr class="tax-total order-table-sum__tr">
                  <td>Tax</td>
                  <td data-title="Tax">
                    <span>{{ formatMoney(cartState.cart.value?.tax_total || 0, cartCurrency) }}</span>
                  </td>
                </tr>

                <tr class="order-table-sum__cupone">
                  <td colspan="2">
                    <button
                      v-if="!isCouponOpen"
                      class="btn-reset"
                      type="button"
                      aria-controls="checkout-coupon-field"
                      :aria-expanded="isCouponOpen"
                      @click="isCouponOpen = true"
                    >
                      Have a coupon code?
                    </button>
                    <div
                      v-else
                      id="checkout-coupon-field"
                      class="order-table-sum__coupon-form"
                    >
                      <input
                        v-model="couponCode"
                        type="text"
                        placeholder="code"
                        autocomplete="off"
                        aria-label="Coupon code"
                        :disabled="isCouponApplying"
                        @keyup.enter="handleApplyCoupon"
                      >
                      <button
                        class="btn-reset"
                        type="button"
                        :disabled="isCouponApplying || !couponCode.trim()"
                        @click="handleApplyCoupon"
                      >
                        {{ isCouponApplying ? 'Applying' : 'Apply' }}
                      </button>
                    </div>
                    <p
                      v-if="couponMessage"
                      class="order-table-sum__coupon-message"
                      :class="{ error: couponMessageType === 'error' }"
                    >
                      {{ couponMessage }}
                    </p>
                  </td>
                </tr>
              </tbody>

              <tfoot>
                <tr class="order-total order-table-sum__total">
                  <td>Total</td>
                  <td data-title="Total">
                    <span>{{ formatMoney((cartState.cart.value?.total || 0) + packageProtectionAmount, cartCurrency) }}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </aside>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, nextTick, watch } from 'vue'
import type { CheckoutMainSectionData, PageData } from '~/types/content'

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  phone: string
}

interface CheckoutCartItem {
  id: string
  title?: string
  quantity: number
  thumbnail?: string | null
  total?: number
  product_title?: string
}

interface GoogleAddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface GooglePlaceResult {
  address_components?: GoogleAddressComponent[]
}

interface GoogleAutocomplete {
  getPlace: () => GooglePlaceResult
}

interface GoogleMapsWindow extends Window {
  google?: {
    maps: {
      event: {
        addListener: (instance: GoogleAutocomplete, eventName: string, handler: () => void) => unknown
      }
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          options: {
            fields: string[]
            types: string[]
          }
        ) => GoogleAutocomplete
      }
    }
  }
  __particleGoogleMapsPromise?: Promise<void>
}

interface BraintreeClientTokenResponse {
  client_token: string
  provider_id: string
  environment: 'sandbox' | 'production'
}

interface BraintreeClientInstance {}

interface BraintreeHostedFieldsInstance {
  tokenize: () => Promise<{ nonce: string }>
  teardown?: () => Promise<void>
}

interface CompleteCheckoutResponse {
  type?: 'cart' | 'order'
  order?: {
    id?: string
    display_id?: number
  }
  ppu?: {
    eligible?: boolean
  }
}

interface BraintreeWindow extends Window {
  braintree?: {
    client: {
      create: (options: { authorization: string }) => Promise<BraintreeClientInstance>
    }
    hostedFields: {
      create: (options: {
        client: BraintreeClientInstance
        styles: Record<string, Record<string, string>>
        fields: Record<string, { selector: string, placeholder?: string }>
      }) => Promise<BraintreeHostedFieldsInstance>
    }
  }
  __particleBraintreePromise?: Promise<void>
}

const fallbackSection: CheckoutMainSectionData = {
  __component: 'sections.checkout-main',
  enabled: true,
  billing_title_prefix: 'Billing',
  billing_title_accent: 'details',
  payment_title_prefix: 'Payment',
  payment_title_accent: 'Information',
  free_shipping_text: 'Free Shipping',
  guarantee_text: '30 Day Money Back Guarantee',
  ship_different_label: 'Ship to a different address?',
  payment_note: 'Your payment details are securely encrypted by Braintree.',
  email_label: 'Email address',
  first_name_label: 'First name',
  last_name_label: 'Last name',
  address_1_label: 'Street address',
  address_2_label: 'Apartment, suite, unit, etc.',
  city_label: 'Town / City',
  state_label: 'State',
  postcode_label: 'Postcode / ZIP',
  phone_label: 'Phone',
  card_number_label: 'Card number',
  card_expiry_label: 'Expiration date',
  card_cvv_label: 'CVV',
}

const CheckoutField = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    autocomplete: {
      type: String,
      default: undefined,
    },
    inputmode: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    return () => h('p', {
      class: ['form-row', attrs.class],
    }, [
      h('span', {
        class: [
          'woocommerce-input-wrapper',
          props.modelValue ? 'has-value' : 'no-value',
        ],
      }, [
        h('label', {
          class: 'field-label',
          for: props.id,
        }, props.label),
        h('input', {
          id: props.id,
          class: 'input-text input-custom',
          name: props.id,
          type: props.type,
          value: props.modelValue,
          placeholder: props.placeholder || props.label,
          autocomplete: props.autocomplete,
          inputmode: props.inputmode,
          onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
        }),
      ]),
    ])
  },
})

const createAddressForm = (): CheckoutForm => ({
  email: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
})

const form = reactive<CheckoutForm>(createAddressForm())
const shipping = reactive<CheckoutForm>(createAddressForm())
const shipToDifferentAddress = ref(false)
const isSummaryOpen = ref(false)
const isCouponOpen = ref(false)
const couponCode = ref('')
const isCouponApplying = ref(false)
const couponMessage = ref('')
const couponMessageType = ref<'success' | 'error'>('success')
const packageProtectionAmount = 1.99
const cartState = useCart()
const config = useRuntimeConfig()
const autocompleteInstances = new Map<string, GoogleAutocomplete>()
const braintreeHostedFields = shallowRef<BraintreeHostedFieldsInstance | null>(null)
const braintreeProviderId = ref('')
const isBraintreeReady = ref(false)
const isCheckoutSubmitting = ref(false)
const checkoutError = ref('')
const checkoutSuccess = ref('')

const { data: page } = await useAsyncData<PageData | null>('checkout-page', async () => {
  try {
    return await $fetch<PageData>('/api/pages/checkout')
  } catch {
    return null
  }
})

const checkoutSection = computed<CheckoutMainSectionData>(() => {
  return page.value?.sections?.find((section): section is CheckoutMainSectionData => {
    return section.__component === 'sections.checkout-main' && section.enabled !== false
  }) || fallbackSection
})

const cartItems = computed<CheckoutCartItem[]>(() => cartState.cart.value?.items || [])
const itemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + Number(item.quantity || 0), 0)
})
const cartCurrency = computed(() => cartState.cart.value?.currency_code || 'usd')

const formatMoney = (amount: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

const lineItemTitle = (item: { product_title?: string, title?: string }) => {
  return item.product_title || item.title || 'Particle product'
}

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  const errorLike = error as {
    data?: { message?: string }
    response?: { _data?: { message?: string, statusMessage?: string } }
    statusMessage?: string
    message?: string
  }

  return errorLike.data?.message
    || errorLike.response?._data?.message
    || errorLike.response?._data?.statusMessage
    || errorLike.statusMessage
    || errorLike.message
    || fallback
}

const handleApplyCoupon = async () => {
  const code = couponCode.value.trim()

  couponMessage.value = ''

  if (!code) {
    couponMessageType.value = 'error'
    couponMessage.value = 'Please enter a coupon code.'
    return
  }

  isCouponApplying.value = true

  try {
    const previousDiscountTotal = cartState.cart.value?.discount_total || 0
    const previousTotal = cartState.cart.value?.total || 0
    const updatedCart = await cartState.applyPromotion(code)
    const nextDiscountTotal = updatedCart?.discount_total || 0
    const nextTotal = updatedCart?.total || 0

    if (nextDiscountTotal > 0 || nextTotal < previousTotal || nextDiscountTotal > previousDiscountTotal) {
      couponMessageType.value = 'success'
      couponMessage.value = 'Coupon applied.'
      return
    }

    couponMessageType.value = 'error'
    couponMessage.value = 'Coupon was accepted, but it did not add a discount to this cart.'
  } catch (error) {
    couponMessageType.value = 'error'
    couponMessage.value = getRequestErrorMessage(error, 'Coupon could not be applied.')
  } finally {
    isCouponApplying.value = false
  }
}

const getGoogleMapsWindow = () => window as GoogleMapsWindow

const loadGoogleMapsScript = async () => {
  const publicConfig = config.public as { googleMapsApiKey?: string }
  const apiKey = publicConfig.googleMapsApiKey

  if (!apiKey) {
    return
  }

  const googleWindow = getGoogleMapsWindow()

  if (googleWindow.google?.maps?.places) {
    return
  }

  if (!googleWindow.__particleGoogleMapsPromise) {
    googleWindow.__particleGoogleMapsPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-particle-google-maps]')

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load')), { once: true })
        return
      }

      const script = document.createElement('script')
      script.dataset.particleGoogleMaps = 'true'
      script.async = true
      script.defer = true
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Google Maps script failed to load'))
      document.head.appendChild(script)
    })
  }

  await googleWindow.__particleGoogleMapsPromise
}

const getPlaceComponent = (
  components: GoogleAddressComponent[],
  type: string,
  name: 'long_name' | 'short_name' = 'long_name',
) => {
  return components.find(component => component.types.includes(type))?.[name] || ''
}

const buildAddressFromPlace = (place: GooglePlaceResult) => {
  const components = place.address_components || []
  const streetNumber = getPlaceComponent(components, 'street_number', 'short_name')
  const route = getPlaceComponent(components, 'route')
  const country = getPlaceComponent(components, 'country', 'short_name')
  const locality = getPlaceComponent(components, 'locality')
    || getPlaceComponent(components, 'postal_town')
    || getPlaceComponent(components, 'sublocality_level_1')
    || getPlaceComponent(components, 'neighborhood')
    || getPlaceComponent(components, 'administrative_area_level_2')
  const state = getPlaceComponent(components, 'administrative_area_level_1', 'short_name')
  const postalCode = getPlaceComponent(components, 'postal_code', 'short_name')
  const neighborhood = getPlaceComponent(components, 'neighborhood')
  const streetNumberFirstCountries = new Set([
    'AU',
    'FR',
    'ZA',
    'IN',
    'IE',
    'MY',
    'NZ',
    'PK',
    'SG',
    'LK',
    'TW',
    'TH',
    'GB',
    'US',
    'PH',
    'CA',
  ])
  const streetAddress = streetNumberFirstCountries.has(country)
    ? `${streetNumber} ${route}`.trim()
    : `${route} ${streetNumber}`.trim()

  return {
    address1: streetAddress,
    address2: country !== 'US' && country !== 'BR' ? neighborhood : '',
    city: locality,
    state,
    postalCode,
  }
}

const applyPlaceToForm = (targetForm: CheckoutForm, place: GooglePlaceResult) => {
  const address = buildAddressFromPlace(place)

  if (address.address1) {
    targetForm.address1 = address.address1
  }

  if (address.address2 && !targetForm.address2) {
    targetForm.address2 = address.address2
  }

  if (address.city) {
    targetForm.city = address.city
  }

  if (address.state) {
    targetForm.state = address.state
  }

  if (address.postalCode) {
    targetForm.postalCode = address.postalCode
  }
}

const initAddressAutocomplete = async (
  inputId: string,
  targetForm: CheckoutForm,
) => {
  if (autocompleteInstances.has(inputId)) {
    return
  }

  await loadGoogleMapsScript()

  const googleWindow = getGoogleMapsWindow()
  const input = document.getElementById(inputId)

  if (!googleWindow.google?.maps?.places || !(input instanceof HTMLInputElement)) {
    return
  }

  input.addEventListener('focus', () => {
    input.setAttribute('autocomplete', 'cc-additional-name')
  })
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  })

  const autocomplete = new googleWindow.google.maps.places.Autocomplete(input, {
    fields: ['address_components'],
    types: ['geocode'],
  })

  googleWindow.google.maps.event.addListener(autocomplete, 'place_changed', () => {
    applyPlaceToForm(targetForm, autocomplete.getPlace())
  })
  autocompleteInstances.set(inputId, autocomplete)
}

const initCheckoutAutocomplete = async () => {
  await initAddressAutocomplete('billing_address_1', form)

  if (shipToDifferentAddress.value) {
    await nextTick()
    await initAddressAutocomplete('shipping_address_1', shipping)
  }
}

const getBraintreeWindow = () => window as BraintreeWindow

const loadBraintreeScript = async () => {
  const braintreeWindow = getBraintreeWindow()

  if (braintreeWindow.braintree?.client && braintreeWindow.braintree.hostedFields) {
    return
  }

  if (!braintreeWindow.__particleBraintreePromise) {
    braintreeWindow.__particleBraintreePromise = new Promise<void>((resolve, reject) => {
      const scripts = [
        'https://js.braintreegateway.com/web/3.139.0/js/client.min.js',
        'https://js.braintreegateway.com/web/3.139.0/js/hosted-fields.min.js',
      ]

      const loadScript = (src: string) => new Promise<void>((scriptResolve, scriptReject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)

        if (existingScript) {
          existingScript.addEventListener('load', () => scriptResolve(), { once: true })
          existingScript.addEventListener('error', () => scriptReject(new Error(`Could not load ${src}`)), { once: true })
          return
        }

        const script = document.createElement('script')
        script.async = true
        script.src = src
        script.onload = () => scriptResolve()
        script.onerror = () => scriptReject(new Error(`Could not load ${src}`))
        document.head.appendChild(script)
      })

      loadScript(scripts[0])
        .then(() => loadScript(scripts[1]))
        .then(() => resolve())
        .catch(reject)
    })
  }

  await braintreeWindow.__particleBraintreePromise
}

const initBraintreeHostedFields = async () => {
  checkoutError.value = ''

  try {
    await loadBraintreeScript()

    const braintreeWindow = getBraintreeWindow()
    const tokenResponse = await $fetch<BraintreeClientTokenResponse>('/api/checkout/braintree-client-token')

    braintreeProviderId.value = tokenResponse.provider_id

    const client = await braintreeWindow.braintree!.client.create({
      authorization: tokenResponse.client_token,
    })

    braintreeHostedFields.value = await braintreeWindow.braintree!.hostedFields.create({
      client,
      styles: {
        input: {
          color: '#222a58',
          'font-size': '16px',
          'font-family': 'Raleway, Helvetica Neue, Helvetica, Arial, sans-serif',
        },
        'input.invalid': {
          color: '#e2401c',
        },
        'input.valid': {
          color: '#222a58',
        },
      },
      fields: {
        number: {
          selector: '#card_number',
          placeholder: 'Card number',
        },
        expirationDate: {
          selector: '#card_expiry',
          placeholder: 'MM / YY',
        },
        cvv: {
          selector: '#card_cvv',
          placeholder: 'CVV',
        },
      },
    })
    isBraintreeReady.value = true
  } catch (error) {
    isBraintreeReady.value = false
    checkoutError.value = error instanceof Error
      ? error.message
      : 'Could not initialize secure payment fields.'
  }
}

const toCheckoutAddress = (address: CheckoutForm) => ({
  first_name: address.firstName,
  last_name: address.lastName,
  address_1: address.address1,
  address_2: address.address2,
  city: address.city,
  province: address.state,
  postal_code: address.postalCode,
  phone: address.phone,
  country_code: 'us',
})

const getCheckoutErrorMessage = (error: unknown) => {
  const errorLike = error as {
    data?: { message?: string, statusMessage?: string }
    response?: { _data?: { message?: string, statusMessage?: string } }
    statusMessage?: string
    message?: string
  }

  return errorLike.data?.message
    || errorLike.data?.statusMessage
    || errorLike.response?._data?.message
    || errorLike.response?._data?.statusMessage
    || errorLike.statusMessage
    || errorLike.message
    || 'Order could not be completed. Please try again.'
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

const handleCheckoutSubmit = async () => {
  checkoutError.value = ''
  checkoutSuccess.value = ''

  if (!cartState.cart.value?.id) {
    checkoutError.value = 'Your cart is empty.'
    return
  }

  if (!isValidEmail(form.email)) {
    checkoutError.value = 'Please enter a valid email address.'
    return
  }

  if (!braintreeHostedFields.value || !braintreeProviderId.value) {
    checkoutError.value = 'Secure payment fields are not ready yet.'
    return
  }

  isCheckoutSubmitting.value = true

  try {
    const payload = await braintreeHostedFields.value.tokenize()
    const result = await $fetch<CompleteCheckoutResponse>('/api/checkout/complete', {
      method: 'POST',
      body: {
        cart_id: cartState.cart.value.id,
        email: form.email,
        billing_address: toCheckoutAddress(form),
        shipping_address: shipToDifferentAddress.value
          ? toCheckoutAddress(shipping)
          : toCheckoutAddress(form),
        provider_id: braintreeProviderId.value,
        payment_method_nonce: payload.nonce,
      },
    })

    if (result.type === 'cart') {
      checkoutError.value = 'Order could not be completed. Please review your payment details.'
      await cartState.refreshCart()
      return
    }

    cartState.cartId.value = null
    cartState.cart.value = null
    window.localStorage.removeItem('particleCartReservationDeadline')

    if (result.ppu?.eligible && result.order?.id) {
      await navigateTo({
        path: '/post-purchase-upsell',
        query: {
          order_id: result.order.id,
          order: result.order.display_id || result.order.id,
        },
      })
      return
    }

    await navigateTo({
      path: '/thank-you-order',
      query: {
        order: result.order?.display_id || result.order?.id || 'confirmed',
      },
    })
  } catch (error) {
    checkoutError.value = getCheckoutErrorMessage(error)
  } finally {
    isCheckoutSubmitting.value = false
  }
}

const reservationTime = ref('10:00')
let reservationDeadline: Date | undefined
let reservationTimer: number | undefined

const getReservationDeadline = () => {
  const stored = window.localStorage.getItem('particleCartReservationDeadline')
  const storedDate = stored ? new Date(stored) : null

  if (storedDate && storedDate.getTime() > Date.now()) {
    return storedDate
  }

  const deadline = new Date()
  deadline.setMinutes(deadline.getMinutes() + 10)
  window.localStorage.setItem('particleCartReservationDeadline', deadline.toISOString())

  return deadline
}

const updateReservationTime = (deadline: Date) => {
  const distance = deadline.getTime() - Date.now()

  if (distance <= 0) {
    reservationDeadline = getReservationDeadline()
    updateReservationTime(reservationDeadline)
    return
  }

  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)
  reservationTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

onMounted(async () => {
  reservationDeadline = getReservationDeadline()
  updateReservationTime(reservationDeadline)
  reservationTimer = window.setInterval(() => {
    if (reservationDeadline) {
      updateReservationTime(reservationDeadline)
    }
  }, 1000)

  await cartState.refreshCart()
  await initCheckoutAutocomplete()
  await nextTick()
  await initBraintreeHostedFields()
})

watch(shipToDifferentAddress, async (enabled) => {
  if (enabled) {
    await nextTick()
    await initAddressAutocomplete('shipping_address_1', shipping)
  }
})

onBeforeUnmount(() => {
  if (reservationTimer) {
    window.clearInterval(reservationTimer)
  }

  if (braintreeHostedFields.value?.teardown) {
    void braintreeHostedFields.value.teardown()
  }
})

useSeoMeta({
  title: () => page.value?.seo?.metaTitle || page.value?.title || 'Checkout - Particle',
  description: () => page.value?.seo?.metaDescription || 'Complete your Particle order.',
  robots: () => page.value?.seo?.noIndex ? 'noindex,nofollow' : 'noindex,follow',
})
</script>

<style scoped lang="scss">
:global(.pac-container) {
  z-index: 10000;
  color: #222a58;
  border: 1px solid rgb(34 42 88 / 18%);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 14px 32px rgb(5 4 70 / 14%);
}

:global(.pac-item) {
  padding: 8px 10px;
  color: rgb(34 42 88 / 70%);
  font-family: $font-body;
  font-size: 13px;
  line-height: 1.35;
  cursor: pointer;
}

:global(.pac-item:hover),
:global(.pac-item-selected) {
  background-color: #f6f8fc;
}

:global(.pac-item-query) {
  color: #050446;
  font-size: 14px;
  font-weight: 700;
}

.card-breadcrumbs {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: min(100% - 32px, 558px);
  margin: 18px auto 0;
  padding: 0;
  overflow: visible;
  list-style: none;
}

.card-breadcrumbs::before {
  position: absolute;
  top: 32px;
  right: 89px;
  left: 89px;
  z-index: 1;
  height: 1px;
  background-color: rgb(39 74 153 / 25%);
  content: '';
}

.card-breadcrumbs__item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 112px;
  color: #050446;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.15;
  text-align: center;
  letter-spacing: 0;
}

.card-breadcrumbs__item span {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  color: rgb(5 4 70 / 70%);
  font-family: $font-ui;
  font-size: 28px;
  font-weight: 300;
  background: #fff;
  border: 1px solid rgb(0 19 67 / 8%);
  border-radius: 20px;
}

.card-breadcrumbs__item--active {
  color: #0038b1;
  font-weight: 800;
}

.card-breadcrumbs__item--active span {
  font-weight: 700;
  background: #eaedf5;
}

.card-breadcrumbs__item--checked {
  color: #0038b1;
}

.strip-bar {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 26px;
  padding: 0 15px;
  background: #fff;
}

.strip-bar .content {
  box-sizing: border-box;
  width: 388px;
  max-width: 100%;
  padding: 12px 15px;
  border: 1px solid #0038b1;
  border-radius: 10px;
}

.strip-bar .content .info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0038b1;
  font-size: 16px;
  line-height: 1.25;
  white-space: nowrap;
}

.strip-bar .title {
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.strip-bar .title::before {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 9px;
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='8.15' stroke='%230038B1' stroke-width='1.7'/%3E%3Cpath d='M9 4.7V9L11.9 10.8' stroke='%230038B1' stroke-width='1.45' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  content: '';
}

.my-cart {
  position: relative;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.my-cart--checkout {
  margin-top: 49px;
}

.my-cart__wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 100px;
  max-width: 1840px;
  margin: 0 auto;
}

.form-checkout {
  display: flex;
  flex-wrap: wrap;
  max-width: 700px;
  gap: 24px 24px;
}

.form-checkout__fields,
.payment-placeholder {
  width: 100%;
}

.checkout-fields {
  display: contents;
}

.title-2accent {
  width: 100%;
  margin: 0 0 10px;
  color: #050446;
  font-size: 35px;
  font-weight: 800;
  line-height: 113.7%;
  text-transform: uppercase;
}

.title-2accent span {
  color: #0038b1;
}

.green-block {
  display: flex;
  justify-content: flex-start;
  gap: 30px;
  width: 100%;
  margin: 24px 0;
  padding: 5px 0;
  color: #4e8b5f;
  font-size: 17px;
  font-weight: 800;
  background: none;
  border-radius: 10px;
}

.green-block > div {
  display: flex;
  align-items: center;
}

.green-block > div:not(.border)::before {
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 7px;
  background-color: #000;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  content: '';
  mask-image: url("data:image/svg+xml,%3Csvg width='42' height='38' viewBox='0 0 42 38' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30.8 1.8C26.6 1.8 23.2 4 21 7.2C18.8 4 15.4 1.8 11.2 1.8C5.2 1.8 1 6.4 1 12.3C1 23.2 21 36.2 21 36.2C21 36.2 41 23.2 41 12.3C41 6.4 36.8 1.8 30.8 1.8Z' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.green-block > div:last-child::before {
  mask-image: url("data:image/svg+xml,%3Csvg width='44' height='31' viewBox='0 0 44 31' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 8H35.5L42 16.5V24H38M28 8V24M28 8V3H2V24H6M16 24H28M12 29C14.7614 29 17 26.7614 17 24C17 21.2386 14.7614 19 12 19C9.23858 19 7 21.2386 7 24C7 26.7614 9.23858 29 12 29ZM33 29C35.7614 29 38 26.7614 38 24C38 21.2386 35.7614 19 33 19C30.2386 19 28 21.2386 28 24C28 26.7614 30.2386 29 33 29ZM2 10H16M2 16H12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.green-block > div.border {
  width: 2px;
  height: 27px;
  margin-top: 4px;
  background: #000;
}

.form-row {
  position: relative;
  width: 100%;
  margin: 0;
}

.form-row--50w {
  width: calc(50% - 12px);
}

.form-row--chkbox {
  margin: 0 0 78px;
}

.form-row--chkbox label {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgb(34 42 88 / 70%);
  font-size: 20px;
  opacity: 0.7;
  cursor: pointer;
}

.form-row--chkbox input {
  width: 18px;
  height: 18px;
  margin-top: -3px;
  transform: scale(1.5);
  accent-color: #0038b1;
}

:deep(.woocommerce-input-wrapper) {
  position: relative;
  display: block;
  width: 100%;
}

:deep(.input-custom) {
  width: 100%;
  min-height: 51px;
  padding: 19px 11px 3px;
  color: #222a58;
  font: inherit;
  appearance: none;
  background: #fff;
  border: 1px solid rgb(34 42 88 / 30%);
  border-radius: 8px;
  outline: none;
  transition: border 0.15s ease-in;
}

:deep(.input-custom:focus) {
  border-color: #222a58;
}

:deep(.input-custom::placeholder) {
  color: transparent;
}

:deep(.field-label) {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  color: rgb(34 42 88 / 70%);
  font-size: 20px;
  line-height: 133.7%;
  text-transform: capitalize;
  pointer-events: none;
  user-select: none;
  opacity: 1;
  transform-origin: top left;
  transition: 0.25s;
}

:deep(.woocommerce-input-wrapper:focus-within .field-label),
:deep(.woocommerce-input-wrapper.has-value .field-label) {
  top: 4px;
  opacity: 0.7;
  transform: scale(0.7);
}

.payment-placeholder {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.payment-note {
  width: 100%;
  margin: -8px 0 0;
  color: rgb(34 42 88 / 65%);
  font-size: 14px;
  line-height: 1.45;
}

.hosted-field {
  display: block;
  height: 51px;
  min-height: 51px;
  max-height: 51px;
  padding: 22px 11px 7px;
  overflow: hidden;
  line-height: 1;
}

:deep(.hosted-field iframe) {
  height: 22px !important;
  max-height: 22px !important;
}

.hosted-field-row :deep(.field-label) {
  top: 5px;
  font-size: 14px;
  opacity: 0.7;
  transform: none;
}

.hosted-field-row :deep(.woocommerce-input-wrapper:focus-within .field-label),
.hosted-field-row :deep(.woocommerce-input-wrapper.has-value .field-label) {
  top: 5px;
  transform: none;
}

.checkout-error {
  width: 100%;
  margin: 0;
  padding: 12px 14px;
  color: #a7280c;
  font-size: 14px;
  line-height: 1.4;
  background: #fff6f3;
  border: 1px solid rgb(226 64 28 / 28%);
  border-radius: 8px;
}

.checkout-success {
  width: 100%;
  margin: 0;
  padding: 12px 14px;
  color: #1f6f3a;
  font-size: 14px;
  line-height: 1.4;
  background: #f1fbf5;
  border: 1px solid rgb(78 139 95 / 28%);
  border-radius: 8px;
}

.place-order {
  width: 100%;
}

.place-order .btn {
  width: 299px;
  height: 60px;
  margin-top: 6px;
  color: #fff;
  font-size: 20px;
  background: #4e8b5f;
  border: none;
  cursor: pointer;
}

.place-order .btn:hover {
  background: #28a84d;
}

.place-order .btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.place-order .btn::before {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-top: -2px;
  margin-right: 5px;
  background-image: url('/icons/lock-icon.svg');
  background-repeat: no-repeat;
  background-size: contain;
  content: '';
}

.order-summary {
  box-sizing: border-box;
  flex: 0 0 615px;
  max-width: 615px;
  min-width: 615px;
  margin-top: 20px;
  padding: 25px 55px 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgb(0 19 67 / 8%);
  border-radius: 42px;
  box-shadow: 0 84px 110px -79px rgb(39 74 153 / 44%);
}

.order-summary h2 {
  margin: 0 0 21px;
  color: #050446;
  font-size: 32px;
  font-weight: 800;
  line-height: 113.7%;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.order-summary h2 span {
  color: #0038b1;
}

.order-summary__items-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 30px 0;
  border-top: 1px solid rgb(214 221 235 / 70%);
  border-bottom: 1px solid rgb(214 221 235 / 70%);
  cursor: pointer;
}

.order-summary__items-toggle > div {
  color: #050446;
  font-family: $font-ui;
  font-size: 25px;
  font-weight: 500;
  line-height: 113.7%;
  text-transform: capitalize;
}

.order-summary__items-toggle .drd-title {
  color: rgb(34 42 88 / 70%);
  font-size: 20px;
  font-weight: 700;
  line-height: 133.7%;
  text-transform: capitalize;
}

.order-summary__chevron {
  margin-left: 38px;
  transition: transform 0.3s ease-in;
}

.order-summary__items {
  width: 100%;
  margin: 0;
}

.order-summary__items li {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 0;
  color: rgb(34 42 88 / 70%);
  font-size: 20px;
  line-height: 133.7%;
  text-transform: capitalize;
  border-bottom: 1px solid rgb(214 221 235 / 70%);
}

.order-summary__items img {
  max-width: 70px;
  height: auto;
  object-fit: contain;
}

.drd-body__content {
  display: flex;
  flex-direction: column;
  margin-right: auto;
  margin-left: 18px;
}

.drd-body__content h4 {
  margin: 0;
  color: #050446;
  font-size: 17px;
  font-weight: 800;
  line-height: 113.7%;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.drd-body__qty {
  margin-top: 10px;
  color: rgb(5 4 70 / 50%);
  font-size: 12px;
  font-weight: 500;
  line-height: 113.7%;
}

.drd-body__qty strong {
  margin-left: 6px;
  color: #050446;
  font-size: 12px;
  font-weight: 500;
}

.drd-body__price {
  margin-left: 64px;
  color: #050446;
  font-family: $font-ui;
  font-size: 17px;
  font-weight: 400;
  line-height: 113.7%;
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

.order-table-sum td:last-of-type {
  text-align: right;
}

.order-table-sum__subtotal td span,
.order-table-sum__tr td span {
  color: #050446;
  font-family: $font-ui;
  font-size: 25px;
  font-weight: 500;
  line-height: 113.7%;
}

.order-table-sum .red {
  color: #050446;
  font-size: 25px;
  font-weight: 400;
  text-transform: uppercase;
}

.order-table-sum__cupone td {
  width: 100%;
  padding: 30px 0;
  border-top: 1px solid rgb(214 221 235 / 70%);
  border-bottom: 1px solid rgb(214 221 235 / 70%);
}

.order-table-sum__cupone button {
  color: rgb(34 42 88 / 70%);
  font-size: 20px;
  line-height: 133.7%;
  text-decoration: underline;
  cursor: pointer;
}

.order-table-sum__coupon-form {
  display: flex;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgb(214 221 235 / 100%);
  border-radius: 6px;
}

.order-table-sum__coupon-form input {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 18px;
  border: 0;
  background: #fff;
  color: #050446;
  font-family: $font-body;
  font-size: 15px;
  line-height: 1;
  outline: none;
}

.order-table-sum__coupon-form input::placeholder {
  color: #050446;
  opacity: 1;
}

.order-table-sum__coupon-form button {
  flex: 0 0 78px;
  min-width: 78px;
  border-radius: 6px;
  background: #59a66a;
  color: #fff;
  font-family: $font-heading;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  text-decoration: underline;
  text-transform: uppercase;
}

.order-table-sum__coupon-form button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.order-table-sum__coupon-message {
  margin: 8px 0 0;
  color: #2f8f46;
  font-family: $font-body;
  font-size: 13px;
  line-height: 1.25;
  text-align: left;
  text-transform: none;
}

.order-table-sum__coupon-message.error {
  color: #b42318;
}

.order-table-sum__total td {
  padding: 24px 0;
  color: #222a58;
  font-size: 25px;
  font-weight: 700;
  line-height: 133.7%;
  border-top: 1px solid rgb(214 221 235 / 70%);
}

.order-table-sum__total td:last-of-type span {
  color: #050446;
  font-family: $font-ui;
  font-size: 25px;
  font-weight: 500;
}

@media (max-width: 1440px) {
  .my-cart__wrapper {
    gap: 60px;
  }

  .order-summary {
    flex-basis: 461px;
    min-width: 461px;
    padding: 33px 25px 27px;
  }

  .order-summary h2 {
    font-size: 26px;
  }

  .green-block {
    gap: 20px;
    font-size: 15px;
  }

  .order-table-sum td {
    font-size: 17px;
  }

  .order-table-sum__subtotal td span,
  .order-table-sum__tr td span,
  .order-table-sum .red,
  .order-table-sum__total td,
  .order-table-sum__total td:last-of-type span,
  .order-summary__items-toggle > div {
    font-size: 22px;
  }

  .order-table-sum__cupone button {
    font-size: 17px;
  }
}

@media (max-width: 992px) {
  .my-cart--checkout {
    margin-top: 0;
  }

  .my-cart__wrapper {
    flex-wrap: wrap;
    gap: 15px;
  }

  .form-checkout,
  .order-summary {
    flex-basis: 100%;
    max-width: 700px;
    min-width: 0;
  }

  .title-2accent {
    margin-top: 40px;
    margin-bottom: 0;
    font-size: 25px;
  }

  .green-block {
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 15px;
    margin-bottom: -45px;
    font-size: 13px;
    text-align: center;
  }

  .green-block > div {
    justify-content: center;
    width: 100%;
  }

  .green-block > div.border {
    display: none;
  }

  .green-block > div::before {
    content: none;
  }

  .order-summary {
    order: -1;
  }
}

@media (max-width: 768px) {
  .card-breadcrumbs {
    width: min(100% - 28px, 350px);
    margin-bottom: 0;
  }

  .card-breadcrumbs::before {
    top: 17px;
    right: 58px;
    left: 58px;
  }

  .card-breadcrumbs__item {
    min-width: 82px;
    font-size: 12px;
  }

  .card-breadcrumbs__item span {
    width: 35px;
    height: 35px;
    border-radius: 10px;
    font-size: 15px;
  }
}

@media (max-width: 576px) {
  .form-checkout,
  .payment-placeholder {
    gap: 24px 10px;
  }

  .form-row--50w {
    width: calc(50% - 5px);
  }

  .form-row--chkbox label {
    gap: 7px;
    font-size: 15px;
  }

  .form-row--chkbox {
    margin-bottom: 0;
  }

  .form-row--chkbox input {
    margin-top: 0;
    transform: scale(1);
  }

  :deep(.input-custom) {
    font-size: 16px;
  }

  :deep(.field-label) {
    top: 14px;
    font-size: 17px;
  }

  :deep(.woocommerce-input-wrapper:focus-within .field-label),
  :deep(.woocommerce-input-wrapper.has-value .field-label) {
    top: 4px;
  }

  .order-summary {
    flex-basis: 100%;
    min-width: 100%;
    padding: 15px 20px 33px;
    border-radius: 24px;
  }

  .order-summary h2 {
    font-size: 15px;
  }

  .order-summary__items-toggle {
    padding: 12px 0;
  }

  .order-summary__items-toggle .drd-title,
  .order-table-sum td,
  .order-table-sum__cupone button {
    font-size: 15px;
  }

  .order-summary__items-toggle > div,
  .order-table-sum__subtotal td span,
  .order-table-sum__tr td span,
  .order-table-sum .red {
    font-size: 15px;
  }

  .order-table-sum__cupone td {
    padding: 14px;
    border-bottom: none;
  }

  .order-table-sum__total td {
    padding: 12px 0;
    font-size: 18px;
  }

  .order-table-sum__total td:last-of-type span {
    font-size: 18px;
  }
}

@media (max-width: 450px) {
  .strip-bar {
    margin-top: 18px;
  }

  .strip-bar .content {
    min-width: 0;
    width: auto;
    max-width: 388px;
    padding: 10px;
  }

  .strip-bar .content .info {
    font-size: 12px;
  }
}

@media (max-width: 350px) {
  .form-row--50w {
    width: 100%;
  }
}
</style>
