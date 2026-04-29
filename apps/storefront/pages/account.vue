<template>
  <main class="account-page">
    <section class="account-hero">
      <p class="eyebrow">Particle account</p>
      <h1>Your orders</h1>
      <p>Sign in to view previous orders and quickly check order status.</p>
    </section>

    <section v-if="pending" class="account-card">
      <p>Loading account...</p>
    </section>

    <section v-else-if="!account.customer" class="account-card auth-card">
      <div class="auth-tabs">
        <button :class="{ active: mode === 'login' }" type="button" @click="mode = 'login'">
          Sign in
        </button>
        <button :class="{ active: mode === 'register' }" type="button" @click="mode = 'register'">
          Create account
        </button>
      </div>

      <form class="auth-form" @submit.prevent="submitAuth">
        <div v-if="mode === 'register'" class="name-grid">
          <label>
            First name
            <input v-model="form.first_name" autocomplete="given-name">
          </label>
          <label>
            Last name
            <input v-model="form.last_name" autocomplete="family-name">
          </label>
        </div>

        <label>
          Email
          <input v-model="form.email" type="email" autocomplete="email" required>
        </label>

        <label>
          Password
          <input
            v-model="form.password"
            type="password"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            required
          >
        </label>

        <button class="primary-button" type="submit" :disabled="submitting">
          {{ submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account' }}
        </button>

        <p v-if="message" class="message">{{ message }}</p>
      </form>
    </section>

    <section v-else class="account-layout">
      <aside class="account-card account-summary">
        <p class="eyebrow">Signed in as</p>
        <h2>Account</h2>
        <p>{{ customerName }}</p>
        <p class="account-email">{{ account.customer.email }}</p>
        <button class="secondary-button" type="button" @click="logout">
          Sign out
        </button>
      </aside>

      <div class="account-card orders-card">
        <div class="orders-heading">
          <h2>Order history</h2>
          <span>{{ account.orders.length }} orders</span>
        </div>

        <div v-if="!account.orders.length" class="empty-state">
          <p>No orders found for this account yet.</p>
          <NuxtLink to="/products">Shop products</NuxtLink>
        </div>

        <article v-for="order in account.orders" :key="order.id" class="order-row">
          <div>
            <h3>Order #{{ order.display_id || order.id }}</h3>
            <p>{{ formatDate(order.created_at) }} · {{ order.status || 'pending' }}</p>
          </div>
          <div class="order-total">
            {{ formatMoney(order.total, order.currency_code) }}
          </div>
          <ul v-if="order.items?.length" class="order-items">
            <li v-for="item in order.items" :key="item.id">
              <span>{{ item.title }}</span>
              <span>x{{ item.quantity || 1 }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
type AccountCustomer = {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

type AccountOrder = {
  id: string
  display_id?: number
  status?: string
  currency_code?: string
  total?: number
  created_at?: string
  items?: Array<{
    id: string
    title?: string
    quantity?: number
  }>
}

type AccountResponse = {
  customer: AccountCustomer | null
  orders: AccountOrder[]
}

const emptyAccount = (): AccountResponse => ({
  customer: null,
  orders: [],
})

const mode = ref<'login' | 'register'>('login')
const pending = ref(true)
const submitting = ref(false)
const message = ref('')
const account = ref<AccountResponse>(emptyAccount())
const form = reactive({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
})

const customerName = computed(() => {
  const name = [account.value.customer?.first_name, account.value.customer?.last_name]
    .filter(Boolean)
    .join(' ')

  return name || account.value.customer?.email || 'Customer'
})

const loadAccount = async () => {
  pending.value = true
  message.value = ''

  try {
    account.value = await $fetch<AccountResponse>('/api/account/me')

    if (!account.value.customer && import.meta.dev) {
      await $fetch('/api/account/admin-test', {
        method: 'POST',
      })
      account.value = await $fetch<AccountResponse>('/api/account/me')
    }
  } catch (error) {
    account.value = emptyAccount()
    message.value = getErrorMessage(error)
  } finally {
    pending.value = false
  }
}

const submitAuth = async () => {
  submitting.value = true
  message.value = ''

  try {
    await $fetch(`/api/account/${mode.value}`, {
      method: 'POST',
      body: form,
    })
    form.password = ''
    await loadAccount()
  } catch (error) {
    message.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

const logout = async () => {
  await $fetch('/api/account/logout', {
    method: 'POST',
  })
  account.value = emptyAccount()
  message.value = ''
}

const getErrorMessage = (error: unknown) => {
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
    || 'Account request failed.'
}

const formatMoney = (amount?: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'usd',
  }).format(Number(amount || 0))
}

const formatDate = (value?: string) => {
  if (!value) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

onMounted(loadAccount)

useSeoMeta({
  title: 'My Account - Particle',
  description: 'View your Particle account and previous orders.',
  robots: 'noindex,follow',
})
</script>

<style scoped lang="scss">
.account-page {
  min-height: 100vh;
  padding: 72px 20px;
  background: #eef1f8;
  color: #11182c;
}

.account-hero {
  width: min(100%, 1100px);
  margin: 0 auto 28px;

  h1 {
    margin: 0 0 10px;
    font-size: clamp(40px, 7vw, 74px);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.05em;
  }

  p:last-child {
    max-width: 620px;
    margin: 0;
    color: #536071;
    font-size: 18px;
    line-height: 1.5;
  }
}

.eyebrow {
  margin: 0 0 8px;
  color: #2e43b8;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.account-card {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 28px;
  border: 1px solid rgba(17, 24, 44, 0.08);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 34px rgba(17, 24, 44, 0.1);
}

.auth-card {
  max-width: 560px;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 22px;

  button {
    min-height: 48px;
    border: 1px solid #dfe4ef;
    border-radius: 10px;
    background: #f8fafc;
    color: #536071;
    font-weight: 900;
    cursor: pointer;
  }

  .active {
    border-color: #2e43b8;
    background: #2e43b8;
    color: #fff;
  }
}

.auth-form,
.auth-form label {
  display: grid;
  gap: 10px;
}

.auth-form {
  gap: 16px;
}

.name-grid,
.account-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

input {
  width: 100%;
  min-height: 48px;
  border: 1px solid #dfe4ef;
  border-radius: 10px;
  padding: 0 14px;
  background: #fff;
  color: #11182c;
  font-size: 16px;
}

.primary-button,
.secondary-button {
  min-height: 52px;
  border: 0;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  background: #2e43b8;
  color: #fff;
}

.secondary-button {
  width: 100%;
  margin-top: 18px;
  background: #eef1f8;
  color: #2e43b8;
}

.message {
  margin: 0;
  color: #a32626;
  font-weight: 800;
}

.account-layout {
  width: min(100%, 1100px);
  margin: 0 auto;
  grid-template-columns: 320px 1fr;
  align-items: start;
}

.account-layout .account-card {
  width: 100%;
}

.account-summary h2,
.orders-heading h2 {
  margin: 0;
}

.account-summary p {
  overflow-wrap: anywhere;
}

.account-email {
  color: #667085;
  font-size: 14px;
}

.orders-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  span {
    color: #667085;
    font-weight: 800;
  }
}

.empty-state {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 12px;
  background: #f8fafc;

  p {
    margin: 0;
  }
}

.order-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid #e7ebf3;

  h3,
  p {
    margin: 0;
  }

  p {
    color: #667085;
  }
}

.order-total {
  color: #2e43b8;
  font-size: 20px;
  font-weight: 900;
}

.order-items {
  grid-column: 1 / -1;
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: #536071;
  }
}

@media (max-width: 820px) {
  .account-page {
    padding: 48px 14px;
  }

  .name-grid,
  .account-layout {
    grid-template-columns: 1fr;
  }

  .account-card {
    padding: 22px;
  }
}
</style>
