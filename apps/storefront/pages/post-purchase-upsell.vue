<template>
  <main class="ppu-page">
    <section v-if="pending" class="ppu-card">
      <p class="eyebrow">One moment</p>
      <h1>Preparing your special offer...</h1>
    </section>

    <section v-else-if="offer" class="ppu-card ppu-offer">
      <div class="media">
        <img v-if="offer.thumbnail" :src="offer.thumbnail" :alt="offer.product_title">
      </div>

      <div class="content">
        <p class="eyebrow">{{ text.eyebrow || 'Wait, your order qualifies' }}</p>
        <h1>{{ text.title || `Add ${offer.product_title} to your order` }}</h1>
        <p class="description">
          {{ text.description || 'Grab this one-time post-purchase offer and we will add it to the same order.' }}
        </p>

        <div class="price-box">
          <span class="price-label">{{ text.price_label || 'Today only' }}</span>
          <strong>{{ formattedPrice }}</strong>
        </div>

        <button class="primary-button" :disabled="submitting" @click="acceptOffer">
          {{ submitting ? 'Adding...' : text.accept_button || 'Yes, add this to my order' }}
        </button>
        <button class="skip-button" :disabled="submitting" @click="skipOffer">
          {{ text.skip_button || 'No thanks, complete my order' }}
        </button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </section>

    <section v-else class="ppu-card">
      <p class="eyebrow">Order complete</p>
      <h1>No offer is available right now.</h1>
      <NuxtLink class="primary-button" :to="thankYouPath">Continue</NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

type PpuOffer = {
  id: string
  order_id: string
  product_title: string
  thumbnail?: string | null
  special_price: string
  currency_code: string
  text_fields?: Record<string, string>
}

type OfferResponse = {
  offer?: PpuOffer | null
}

const route = useRoute()
const orderId = computed(() => {
  const value = route.query.order_id
  return Array.isArray(value) ? value[0] : value
})
const orderNumber = computed(() => {
  const value = route.query.order
  return Array.isArray(value) ? value[0] : value
})

const pending = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const offer = ref<PpuOffer | null>(null)

const text = computed(() => offer.value?.text_fields || {})
const thankYouPath = computed(() => ({
  path: '/thank-you-order',
  query: {
    order: orderNumber.value || orderId.value || 'confirmed',
  },
}))
const formattedPrice = computed(() => {
  if (!offer.value) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: offer.value.currency_code || 'USD',
  }).format(Number(offer.value.special_price || 0))
})

const loadOffer = async () => {
  if (!orderId.value) {
    pending.value = false
    return
  }

  try {
    const response = await $fetch<OfferResponse>(`/api/ppu/${orderId.value}/offer`)
    offer.value = response.offer || null
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load your offer.'
  } finally {
    pending.value = false
  }
}

const acceptOffer = async () => {
  if (!orderId.value || !offer.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/ppu/${orderId.value}/accept`, {
      method: 'POST',
      body: {
        rule_id: offer.value.id,
      },
    })
    await navigateTo({
      path: '/thank-you-order',
      query: {
        order: orderNumber.value || orderId.value,
        ppu: 'added',
      },
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not add this offer.'
  } finally {
    submitting.value = false
  }
}

const skipOffer = async () => {
  if (!orderId.value) {
    await navigateTo(thankYouPath.value)
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/ppu/${orderId.value}/skip`, {
      method: 'POST',
      body: {
        rule_id: offer.value?.id,
      },
    })
    await navigateTo({
      path: '/thank-you-order',
      query: {
        order: orderNumber.value || orderId.value,
        ppu: 'skipped',
      },
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not complete your order.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadOffer)

useSeoMeta({
  title: 'Special Offer - Particle',
  robots: 'noindex,nofollow',
})
</script>

<style scoped lang="scss">
.ppu-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: #eef1f8;
  color: #11182c;
}

.ppu-card {
  width: min(100%, 920px);
  padding: 28px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(17, 24, 44, 0.14);
}

.ppu-offer {
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(300px, 1.1fr);
  gap: 34px;
}

.media {
  display: grid;
  min-height: 360px;
  place-items: center;
  overflow: hidden;
  border-radius: 16px;
  background: #f4f6fb;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0 0 10px;
  color: #2e43b8;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.description {
  margin: 0 0 24px;
  color: #485164;
  font-size: 18px;
  line-height: 1.5;
}

.price-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  padding: 18px 20px;
  border: 1px solid #dfe4ef;
  border-radius: 14px;
  background: #f8fafc;
}

.price-label {
  color: #485164;
  font-weight: 800;
}

.price-box strong {
  color: #2e43b8;
  font-size: 34px;
  line-height: 1;
}

.primary-button,
.skip-button {
  display: flex;
  width: 100%;
  min-height: 58px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  background: #2e43b8;
  color: #fff;
}

.skip-button {
  margin-top: 12px;
  background: transparent;
  color: #5b6477;
}

.primary-button:disabled,
.skip-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.error {
  margin: 14px 0 0;
  color: #a32626;
  font-weight: 700;
}

@media (max-width: 760px) {
  .ppu-card {
    padding: 18px;
  }

  .ppu-offer {
    grid-template-columns: 1fr;
  }

  .media {
    min-height: 260px;
  }
}
</style>
