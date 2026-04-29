<template>
  <section
    v-if="section.enabled !== false"
    class="landing-offer"
    :style="{ backgroundColor: section.background_color || '#ECF0F4' }"
  >
    <div class="landing-offer__inner">
      <h2
        class="landing-offer__headline"
        v-html="section.headline_html"
      />

      <div class="landing-offer__countdown" aria-label="Offer countdown">
        <div
          v-for="item in countdown"
          :key="item.label"
          class="landing-offer__countdown-item"
        >
          <span>{{ item.value }}</span>
          <small>{{ item.label }}</small>
        </div>
      </div>

      <div
        v-if="section.body_html"
        class="landing-offer__body"
        v-html="section.body_html"
      />

      <AppLink
        v-if="section.cta?.url"
        class="landing-offer__cta"
        :to="section.cta.url"
        :target="section.cta.target"
      >
        {{ section.cta.label }}
      </AppLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingSaleOfferSectionData } from '~/types/content'

const props = defineProps<{
  section: LandingSaleOfferSectionData
}>()

const initialSeconds = computed(() => {
  const hours = Math.max(0, props.section.countdown_hours || 0)
  return (hours * 60 * 60) + (55 * 60) + 54
})
const remainingSeconds = ref(initialSeconds.value)
let countdownInterval: ReturnType<typeof setInterval> | undefined

const resetCountdown = () => {
  remainingSeconds.value = initialSeconds.value
}

onMounted(() => {
  resetCountdown()
  countdownInterval = setInterval(() => {
    remainingSeconds.value = Math.max(0, remainingSeconds.value - 1)
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const countdown = computed(() => [
  { value: String(Math.floor(remainingSeconds.value / 86400)), label: 'Days' },
  { value: String(Math.floor((remainingSeconds.value % 86400) / 3600)).padStart(2, '0'), label: 'Hours' },
  { value: String(Math.floor((remainingSeconds.value % 3600) / 60)).padStart(2, '0'), label: 'Minutes' },
  { value: String(remainingSeconds.value % 60).padStart(2, '0'), label: 'Seconds' },
])
</script>

<style scoped lang="scss">
.landing-offer {
  padding: 0;
  color: #0f0f0f;
}

.landing-offer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 0 100px;
  gap: 20px;
  text-align: center;
}

.landing-offer__headline {
  margin: 0;
  color: #0f0f0f;
  font-family: $font-body;
  font-size: 32px;
  font-weight: 800;
  line-height: 136%;
  text-align: center;
  text-transform: uppercase;

  :deep(span) {
    display: block;
    font-size: 23px;
  }

  :deep(font),
  :deep(.accent) {
    color: #f00;
  }
}

.landing-offer__countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  margin: 0 auto;
  border-radius: 5px;
  gap: 15px;
  color: #fff;
  text-align: center;
  transition: opacity 0.1s;
}

.landing-offer__countdown-item {
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 2px;

  span {
    width: 85px;
    padding: 10px 20px;
    border-radius: 10px 10px 0 0;
    color: #fff;
    font-family: $font-body;
    font-size: 45px;
    font-weight: 700;
    line-height: 100%;
    background: #cd072b;
  }

  small {
    width: 85px;
    padding: 5px 10px 10px;
    border-radius: 0 0 10px 10px;
    color: #fff;
    font-family: $font-body;
    font-size: 13px;
    font-weight: 600;
    line-height: 121%;
    text-transform: uppercase;
    background: #cd072b;
  }
}

.landing-offer__body {
  margin-top: 20px;
  color: #0f0f0f;
  font-family: $font-body;

  :deep(p) {
    margin: 10px 0 0;
    color: #0f0f0f;
    font-size: 30px;
    font-weight: 700;
    line-height: 130%;
    text-align: center;
  }
}

.landing-offer__cta {
  display: block;
  width: max-content;
  min-width: 230px;
  margin: 30px 0 20px;
  padding: 14px 20px;
  border-radius: 55px;
  color: #fff;
  font-family: $font-ui;
  font-size: 23px;
  font-weight: 700;
  line-height: 35px;
  text-align: center;
  text-transform: uppercase;
  background: #cd072b;
  transition: 0.3s;

  &:hover {
    transform: scale(0.9);
  }
}

@media (max-width: 1024px) {
  .landing-offer__inner {
    max-width: 91%;
    padding: 30px 0 100px;
  }
}

@media only screen and (max-width: 820px) {
  .landing-offer__inner {
    gap: 10px;
  }

  .landing-offer__headline {
    font-size: 26px;

    :deep(span) {
      font-size: 17px;
    }
  }

  .landing-offer__countdown {
    gap: 10px;
  }

  .landing-offer__countdown-item {
    span {
      width: 70px;
      padding: 10px 5px 5px;
      font-size: 35px;
    }

    small {
      width: 70px;
      font-size: 11px;
    }
  }

  .landing-offer__body {
    :deep(p) {
      font-size: 18px;
      line-height: 21px;
    }
  }

  .landing-offer__cta {
    margin: 15px auto 10px;
    font-size: 23px;
    line-height: 35px;
  }
}

@media (max-width: 620px) {
  .landing-offer__headline {
    font-size: 20px;
  }
}
</style>
