<template>
  <LandingAdvertorialHero
    v-if="section.__component === 'landing.advertorial-hero'"
    :section="section"
  />
  <LandingReasonList
    v-else-if="section.__component === 'landing.reason-list'"
    :section="section"
  />
  <LandingVideoBlock
    v-else-if="section.__component === 'landing.video-block'"
    :section="section"
  />
  <LandingSaleOffer
    v-else-if="section.__component === 'landing.sale-offer'"
    :section="section"
  />
  <LandingReviewsAnchor
    v-else-if="section.__component === 'landing.reviews-anchor'"
    :section="section"
  />
</template>

<script setup lang="ts">
import type { LandingPageSection } from '~/types/content'

defineProps<{
  section: LandingPageSection
}>()
</script>
