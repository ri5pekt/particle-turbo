<template>
  <div class="cart-page">
    <div class="woocommerce">
      <ul class="card-breadcrumbs" aria-label="Checkout steps">
        <li class="card-breadcrumbs__item card-breadcrumbs__item--active" aria-current="step">
          <span>1</span> Order Details
        </li>
        <li class="card-breadcrumbs__item">
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

      <div class="info">
        <div class="woocommerce-notices-wrapper" />
      </div>

      <SectionRenderer
        v-for="section in cartSections"
        :key="section.id || section.__component"
        :section="section"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartMainSectionData, PageData, PageSection } from '~/types/content'

const fallbackSection: CartMainSectionData = {
  __component: 'sections.cart-main',
  enabled: true,
  title_prefix: 'My',
  title_accent: 'Cart',
  checkout_label: 'Proceed to secure checkout',
  empty_title: 'Your cart is empty.',
  empty_button_label: 'Continue Shopping',
  empty_button_url: '/',
  monthly_orders_text: '50,000+ Orders Last Month!',
}

const { data: page } = await useAsyncData<PageData | null>('cart-page', async () => {
  try {
    return await $fetch<PageData>('/api/pages/cart')
  } catch {
    return null
  }
})

const cartSections = computed<PageSection[]>(() => {
  return page.value?.sections?.length ? page.value.sections : [fallbackSection]
})

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

onMounted(() => {
  reservationDeadline = getReservationDeadline()
  updateReservationTime(reservationDeadline)
  reservationTimer = window.setInterval(() => {
    if (reservationDeadline) {
      updateReservationTime(reservationDeadline)
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (reservationTimer) {
    window.clearInterval(reservationTimer)
  }
})

useSeoMeta({
  title: () => page.value?.seo?.metaTitle || page.value?.title || 'Cart - Particle',
  description: () => page.value?.seo?.metaDescription || 'Review your Particle cart.',
  robots: () => page.value?.seo?.noIndex ? 'noindex,nofollow' : 'noindex,follow',
})

useHead(() => ({
  link: page.value?.seo?.canonicalURL
    ? [
        {
          rel: 'canonical',
          href: page.value.seo.canonicalURL,
        },
      ]
    : [],
}))
</script>

<style scoped lang="scss">
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

.woocommerce-notices-wrapper {
  display: none;
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
</style>

