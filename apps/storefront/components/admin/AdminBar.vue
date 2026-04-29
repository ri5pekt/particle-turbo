<template>
  <div v-if="isEnabled" class="admin-bar" :class="{ 'admin-bar--open': isOpen }">
    <button
      class="admin-bar__toggle btn-reset"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="admin-bar-panel"
      @click="isOpen = !isOpen"
    >
      <span class="admin-bar__arrow" aria-hidden="true">{{ isOpen ? '↑' : '↓' }}</span>
      <span class="admin-bar__toggle-text">Admin</span>
    </button>

    <Transition name="admin-bar-panel">
      <div v-if="isOpen" id="admin-bar-panel" class="admin-bar__panel">
        <div class="admin-bar__group">
          <span class="admin-bar__label">{{ contextLabel }}</span>
          <a
            v-if="strapiEditUrl"
            class="admin-bar__button"
            :href="strapiEditUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Strapi Edit
          </a>
          <a
            v-if="medusaEditUrl"
            class="admin-bar__button"
            :href="medusaEditUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Medusa Edit
          </a>
          <span v-if="!strapiEditUrl && !medusaEditUrl" class="admin-bar__muted">
            No edit target for this route
          </span>
        </div>

        <div class="admin-bar__group admin-bar__group--actions">
          <button class="admin-bar__button" type="button" @click="openCart">
            Open Cart ({{ itemCount }})
          </button>
          <button
            class="admin-bar__button admin-bar__button--danger"
            type="button"
            :disabled="isLoading || itemCount === 0"
            @click="handleClearCart"
          >
            {{ isLoading ? 'Clearing...' : 'Clear Cart' }}
          </button>
          <button class="admin-bar__button" type="button" @click="reloadPage">
            Reload
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { LandingPageData, PageData, ProductData } from '~/types/content'

const route = useRoute()
const config = useRuntimeConfig()
const adminCookie = useCookie<string | null>('particle_admin_bar', {
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30,
})
const { clearCart, itemCount, isLoading, openCart } = useCart()
const isOpen = ref(false)

if (route.query.admin === '1') {
  adminCookie.value = '1'
}

const isEnabled = computed(() => {
  return import.meta.dev
    || adminCookie.value === '1'
    || config.public.adminBarEnabled === true
})

const productHandle = computed(() => {
  return route.name === 'product-handle' ? String(route.params.handle || '') : ''
})
const { data: productData } = useNuxtData<ProductData>(`product-page-${productHandle.value}`)
const { data: homePageData } = useNuxtData<PageData>('home-page')
const landingSlug = computed(() => {
  return route.name === 'lpage-slug' ? String(route.params.slug || '') : ''
})
const { data: landingPageData } = useNuxtData<LandingPageData>(`landing-page-${landingSlug.value}`)

const currentProduct = computed(() => productHandle.value ? productData.value : null)
const currentPage = computed(() => route.name === 'index' ? homePageData.value : null)
const currentLandingPage = computed(() => landingSlug.value ? landingPageData.value : null)

const cleanBaseUrl = (url?: string) => {
  return (url || '').replace(/\/$/, '')
}

const strapiBaseUrl = computed(() => cleanBaseUrl(config.public.strapiUrl || 'http://localhost:1337'))
const medusaBaseUrl = computed(() => cleanBaseUrl(config.public.medusaUrl || 'http://localhost:9000'))

const strapiEditUrl = computed(() => {
  if (currentProduct.value?.documentId || currentProduct.value?.id) {
    return `${strapiBaseUrl.value}/admin/content-manager/collection-types/api::product.product/${currentProduct.value.documentId || currentProduct.value.id}`
  }

  if (currentPage.value?.documentId || currentPage.value?.id) {
    return `${strapiBaseUrl.value}/admin/content-manager/collection-types/api::page.page/${currentPage.value.documentId || currentPage.value.id}`
  }

  if (currentLandingPage.value?.documentId || currentLandingPage.value?.id) {
    return `${strapiBaseUrl.value}/admin/content-manager/collection-types/api::landing-page.landing-page/${currentLandingPage.value.documentId || currentLandingPage.value.id}`
  }

  return ''
})

const medusaEditUrl = computed(() => {
  const productId = currentProduct.value?.commerce?.id

  return productId ? `${medusaBaseUrl.value}/app/products/${productId}` : ''
})

const contextLabel = computed(() => {
  if (currentProduct.value?.title) {
    return `Product: ${currentProduct.value.title}`
  }

  if (currentPage.value?.title) {
    return `Page: ${currentPage.value.title}`
  }

  if (currentLandingPage.value?.title) {
    return `Landing page: ${currentLandingPage.value.title}`
  }

  return 'Admin tools'
})

const handleClearCart = async () => {
  await clearCart()
}

const reloadPage = () => {
  window.location.reload()
}
</script>

<style scoped lang="scss">
.admin-bar {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 1200;
  transform: translateX(-50%);
  color: $color-white;
  font-family: $font-body;
}

.admin-bar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 86px;
  min-height: 24px;
  padding: 3px 12px 5px;
  color: $color-white;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  background: #0038b1;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 10px rgb(0 0 0 / 25%);
  cursor: pointer;
}

.admin-bar__arrow {
  font-size: 13px;
  line-height: 1;
}

.admin-bar__panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  min-width: min(760px, calc(100vw - 30px));
  margin-top: 6px;
  padding: 10px 12px;
  background: rgb(5 4 70 / 94%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 14px;
  box-shadow: 0 12px 30px rgb(0 0 0 / 30%);
  backdrop-filter: blur(8px);
}

.admin-bar__group {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.admin-bar__group--actions {
  justify-content: flex-end;
}

.admin-bar__label {
  max-width: 240px;
  overflow: hidden;
  color: #bcd7ff;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-bar__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 6px 10px;
  color: $color-white;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  background: #0b44c9;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.admin-bar__button:hover {
  background: #3269e0;
}

.admin-bar__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-bar__button--danger {
  background: #b42318;
}

.admin-bar__button--danger:hover {
  background: #d92d20;
}

.admin-bar__muted {
  color: rgb(255 255 255 / 65%);
  font-size: 12px;
  font-weight: 700;
}

.admin-bar-panel-enter-active,
.admin-bar-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.admin-bar-panel-enter-from,
.admin-bar-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 680px) {
  .admin-bar {
    width: calc(100vw - 24px);
  }

  .admin-bar__panel {
    min-width: 100%;
  }

  .admin-bar__group,
  .admin-bar__group--actions {
    justify-content: center;
  }
}
</style>

