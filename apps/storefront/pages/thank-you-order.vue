<template>
  <main class="thank-you-page" aria-labelledby="order-complete-title">
    <section class="order-complete-card">
      <svg class="heart-mark" viewBox="0 0 70 70" role="img" aria-label="Particle heart">
        <path
          d="M35 22c-5-9-20-8-24 4-5 16 13 27 24 36 11-9 29-20 24-36-4-12-19-13-24-4Z"
          fill="#fff"
          stroke="#2e43b8"
          stroke-linejoin="round"
          stroke-width="3"
        />
        <path
          d="M21 10c7 0 10 8 14 8s7-8 14-8c3 0 6 1 8 3-3-7-10-12-18-12-6 0-11 3-14 8-3-5-8-8-14-8-8 0-15 5-18 12 2-2 5-3 8-3Z"
          fill="#e7ebf3"
          transform="translate(14 7) scale(.6)"
        />
      </svg>

      <h1 id="order-complete-title" class="title"><span>Order</span> Complete</h1>

      <p class="label">Your order number is</p>
      <p class="order-number">{{ orderNumber }}</p>

      <p v-if="ppuMessage" class="ppu-message">{{ ppuMessage }}</p>

      <ul class="notice-list">
        <li class="notice">
          <span class="check-icon" aria-hidden="true" />
          <span>You will receive an order confirmation in your email within a few minutes.</span>
        </li>
        <li class="notice">
          <span class="check-icon" aria-hidden="true" />
          <span>We'll start processing your order immediately and will let you know once your order has shipped.</span>
        </li>
      </ul>

      <NuxtLink class="account-link" to="/account">Visit My Account</NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()

const orderNumber = computed(() => {
  const value = route.query.order
  const order = Array.isArray(value) ? value[0] : value

  return order || 'confirmed'
})

const ppuMessage = computed(() => {
  const value = route.query.ppu
  const status = Array.isArray(value) ? value[0] : value

  if (status === 'added') {
    return 'Your special offer was added to this order.'
  }

  if (status === 'skipped') {
    return 'Your order is complete and will continue processing.'
  }

  return ''
})

useSeoMeta({
  title: 'Order Complete - Particle',
  description: 'Thank you for your Particle order.',
  robots: 'noindex,follow',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: '/thank-you-order',
    },
  ],
})
</script>

<style scoped lang="scss">
.thank-you-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 50px 24px;
  background: #e7ebf3;
  color: #33394a;
}

.order-complete-card {
  width: min(100%, 522px);
  padding: 28px 20px 20px;
  border: 1px solid rgba(17, 24, 44, 0.08);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 3px 8px rgba(17, 24, 44, 0.24);
  text-align: center;
}

.heart-mark {
  display: block;
  width: 68px;
  height: 68px;
  margin: 0 auto 20px;
}

.title {
  margin: 0 0 34px;
  color: #11182c;
  font-size: clamp(34px, 7vw, 46px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
  text-transform: uppercase;

  span {
    color: #2e43b8;
  }
}

.label {
  margin: 0 0 16px;
  color: #343a4a;
  font-size: 16px;
  line-height: 1.4;
}

.order-number {
  margin: 0 0 16px;
  padding: 36px 20px 31px;
  border: 1px solid #dfe4ef;
  border-radius: 22px;
  color: #11182c;
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.2px;
}

.ppu-message {
  margin: 0 0 16px;
  padding: 15px 18px;
  border-radius: 14px;
  background: #edf7ee;
  color: #23582b;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
}

.notice-list {
  display: grid;
  gap: 16px;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
}

.notice {
  display: grid;
  min-height: 80px;
  grid-template-columns: 32px 1fr;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 22px;
  background: #eef1f8;
  color: #33394a;
  font-size: 16px;
  line-height: 1.52;
  text-align: left;
}

.check-icon {
  display: inline-grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 50%;
  background: #9fbea4;
  color: #fff;

  &::after {
    width: 11px;
    height: 6px;
    border: solid currentColor;
    border-width: 0 0 3px 3px;
    content: "";
    transform: rotate(-45deg) translate(1px, -1px);
  }
}

.account-link {
  display: flex;
  min-height: 59px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #2e43b8;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 480px) {
  .thank-you-page {
    padding: 24px 12px;
  }

  .order-complete-card {
    padding: 24px 20px 20px;
  }

  .title {
    margin-bottom: 28px;
  }

  .notice {
    grid-template-columns: 28px 1fr;
    gap: 12px;
    padding: 16px;
  }
}
</style>
