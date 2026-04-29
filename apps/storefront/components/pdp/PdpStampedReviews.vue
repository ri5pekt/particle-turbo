<template>
  <section
    v-if="section.enabled !== false"
    :id="section.anchor_id || 'stampedcreambot'"
    class="pdp-stamped-reviews"
  >
    <div
      id="stamped-main-widget"
      class="stamped stamped-main-widget"
      :data-product-id="section.product_id || undefined"
      :data-product-sku="section.product_sku || undefined"
      :data-name="section.product_name || undefined"
      :data-url="section.product_url || undefined"
      :data-image-url="section.image_url || undefined"
      data-widget-language=""
    >
      <div
        v-if="widgetHtml"
        v-html="widgetHtml"
      />
      <p v-else-if="pending" class="pdp-stamped-reviews__notice">
        Loading reviews...
      </p>
      <p v-else class="pdp-stamped-reviews__notice">
        Reviews are temporarily unavailable.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PdpStampedReviewsSectionData } from '~/types/content'

interface StampedWidgetCacheResponse {
  html?: string
  rating?: string | number
  count?: string | number
}

const props = defineProps<{
  section: PdpStampedReviewsSectionData
}>()

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: '/api/stamped/asset?url=https%3A%2F%2Fcdn1.stamped.io%2Ffiles%2Fwidget.min.css',
    },
  ],
})

const { data, pending } = await useAsyncData(
  () => `stamped-widget-${props.section.product_id || 'missing'}`,
  () => $fetch<StampedWidgetCacheResponse>('/api/stamped/widget', {
    query: {
      product_id: props.section.product_id || '',
      product_name: props.section.product_name || '',
    },
  }),
  {
    default: () => ({ html: '' }),
  },
)

const widgetHtml = computed(() => data.value?.html || '')
</script>

<style scoped lang="scss">
.pdp-stamped-reviews {
  display: flex;
  justify-content: center;
  padding: 40px 15px 70px;
  background: #fff;
}

.stamped-main-widget {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  overflow: hidden;

  :deep(.stamped-container) {
    width: 100% !important;
    max-width: 980px !important;
    margin-right: auto !important;
    margin-left: auto !important;
  }
}

.pdp-stamped-reviews__notice {
  margin: 0;
  padding: 24px;
  border: 1px solid rgb(214 221 235 / 70%);
  color: rgb(34 42 88 / 70%);
  font-size: 16px;
  text-align: center;
}
</style>
