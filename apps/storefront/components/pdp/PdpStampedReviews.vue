<template>
  <section
    v-if="section.enabled !== false"
    :id="section.anchor_id || 'stampedcreambot'"
    class="pdp-stamped-reviews"
    :class="`pdp-stamped-reviews--${section.theme || 'default'}`"
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

.pdp-stamped-reviews--dark {
  color: #fff;
  background: #14161f;

  .stamped-main-widget {
    margin-top: 0;
    margin-bottom: 0;
  }

  :deep(.stamped-container[data-widget-show-product-variant=true] .stamped-review-product a),
  :deep(.stamped-container[data-widget-show-product-variant=true] .stamped-review-variant a),
  :deep(.stamped-container ul.stamped-tabs li),
  :deep(.stamped-header-title),
  :deep(.stamped-summary),
  :deep(.stamped-summary-text),
  :deep(.stamped-summary-text-1),
  :deep(.stamped-review),
  :deep(.stamped-review *),
  :deep(.stamped-review-header .author),
  :deep(.stamped-review-header-title),
  :deep(h3.stamped-review-header-title),
  :deep(.stamped-review-content-body),
  :deep(p.stamped-review-content-body),
  :deep(.stamped-review-body),
  :deep(.stamped-review-content),
  :deep(.stamped-review-product),
  :deep(.stamped-review-product a),
  :deep(.stamped-review-variant),
  :deep(.stamped-review-variant a) {
    color: #fff !important;
  }

  :deep(.stamped-review-header .created) {
    color: rgb(255 255 255 / 64%) !important;
  }

  :deep(li#tab-reviews[data-count]::after) {
    color: #14161f;
  }

  .pdp-stamped-reviews__notice {
    border-color: rgb(255 255 255 / 18%);
    color: rgb(255 255 255 / 76%);
  }
}

.pdp-stamped-reviews--varros {
  color: #100f0d;
  background: #f1eee9;

  :deep(.stamped-container[data-widget-show-product-variant=true] .stamped-review-product a),
  :deep(.stamped-container[data-widget-show-product-variant=true] .stamped-review-variant a),
  :deep(.stamped-container ul.stamped-tabs li) {
    color: #100f0d;
  }

  :deep(li#tab-reviews[data-count]::after) {
    color: #f1eee9;
    background: #555;
  }

  :deep(.stamped-reviews .stamped-review) {
    border-top: 2px solid #14161f !important;
  }

  :deep(div[data-widget-style] .summary-rating:nth-child(2) .summary-rating-title::before),
  :deep(div[data-widget-style] .summary-rating:nth-child(3) .summary-rating-title::before),
  :deep(div[data-widget-style] .summary-rating:nth-child(4) .summary-rating-title::before),
  :deep(div[data-widget-style] .summary-rating:first-child .summary-rating-title::before),
  :deep(div[data-widget-style] .summary-rating:nth-child(5) .summary-rating-title::before) {
    color: #777;
  }

  :deep(.stamped-review-header .created),
  :deep(div[data-widget-style*='standard'] .summary-rating-count) {
    color: #100f0d !important;
  }

  :deep(.stamped-pagination a) {
    color: #100f0d;
  }

  :deep(.stamped-pagination li.page.active a) {
    color: #f1eee9;
  }

  :deep(.stamped-summary-actions-newreview) {
    background: #555;
  }
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

<style lang="scss">
.pdp-stamped-reviews--dark {
  color: #fff !important;

  .stamped-main-widget,
  .stamped-main-widget .stamped-container,
  .stamped-main-widget .stamped-container .stamped-header-title,
  .stamped-main-widget .stamped-container .stamped-summary,
  .stamped-main-widget .stamped-container .stamped-summary *,
  .stamped-main-widget .stamped-container .stamped-reviews,
  .stamped-main-widget .stamped-container .stamped-review,
  .stamped-main-widget .stamped-container .stamped-review *,
  .stamped-main-widget .stamped-container .stamped-review-header strong.author,
  .stamped-main-widget .stamped-container strong.author,
  .stamped-main-widget .stamped-container h3.stamped-review-header-title,
  .stamped-main-widget .stamped-container .stamped-review-header-title,
  .stamped-main-widget .stamped-container .stamped-review-content-body,
  .stamped-main-widget .stamped-container p.stamped-review-content-body,
  .stamped-main-widget .stamped-container .stamped-review-body,
  .stamped-main-widget .stamped-container .stamped-review-content,
  .stamped-main-widget .stamped-container .stamped-review-content p,
  .stamped-main-widget .stamped-container .stamped-review-product,
  .stamped-main-widget .stamped-container .stamped-review-product a,
  .stamped-main-widget .stamped-container .stamped-review-variant,
  .stamped-main-widget .stamped-container .stamped-review-variant a {
    color: #fff !important;
  }

  .stamped-main-widget .stamped-container .stamped-review-header .created,
  .stamped-main-widget .stamped-container .review-location,
  .stamped-main-widget .stamped-container .review-location span {
    color: rgb(255 255 255 / 64%) !important;
  }
}
</style>
