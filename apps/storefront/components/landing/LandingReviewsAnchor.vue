<template>
  <div
    v-if="section.enabled !== false"
    class="landing-stamped-reviews"
  >
    <div
      id="stamped-main-widget"
      class="stamped stamped-main-widget"
      :data-product-id="section.product_id || undefined"
      data-widget-language=""
    >
      <div
        v-if="widgetHtml"
        v-html="widgetHtml"
      />
      <p v-else-if="pending" class="landing-stamped-reviews__notice">
        Loading reviews...
      </p>
      <p v-else class="landing-stamped-reviews__notice">
        Reviews are temporarily unavailable.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LandingReviewsAnchorSectionData } from '~/types/content'

interface StampedWidgetCacheResponse {
  html?: string
  rating?: string | number
  count?: string | number
}

const props = defineProps<{
  section: LandingReviewsAnchorSectionData
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
  () => `landing-stamped-widget-${props.section.product_id || 'missing'}`,
  () => $fetch<StampedWidgetCacheResponse>('/api/stamped/widget', {
    query: {
      product_id: props.section.product_id || '',
      product_name: props.section.title || '',
    },
  }),
  {
    default: () => ({ html: '' }),
  },
)

const widgetHtml = computed(() => data.value?.html || '')
</script>

<style scoped lang="scss">
.landing-stamped-reviews {
  display: flex;
  justify-content: center;
  padding: 50px 15px 70px;
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

.landing-stamped-reviews__notice {
  margin: 0;
  padding: 24px;
  border: 1px solid rgb(214 221 235 / 70%);
  color: rgb(34 42 88 / 70%);
  font-size: 16px;
  text-align: center;
}
</style>
