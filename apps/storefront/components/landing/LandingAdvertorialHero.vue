<template>
  <section
    v-if="section.enabled !== false"
    class="landing-hero"
  >
    <h1 class="landing-hero__headline">
      {{ section.headline }}
    </h1>
    <p
      v-if="section.author"
      class="landing-hero__author"
    >
      by {{ section.author }}
    </p>
    <div class="landing-hero__inner">
      <div
        v-if="section.intro_html"
        class="landing-hero__intro"
        v-html="section.intro_html"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingAdvertorialHeroSectionData } from '~/types/content'

defineProps<{
  section: LandingAdvertorialHeroSectionData
}>()
</script>

<style scoped lang="scss">
.landing-hero {
  color: #0f0f0f;
  background: $color-white;
}

.landing-hero__inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 0 20px;
}

.landing-hero__headline {
  width: 100%;
  margin: 0;
  padding: 1% 20%;
  color: #0f0f0f;
  font-family: $font-body;
  font-size: 53px;
  font-style: normal;
  font-weight: 900;
  line-height: 136%;
  text-align: center;
  background: #ecf0f4;
}

.landing-hero__author {
  margin: 20px 0 0;
  padding-top: 0;
  color: #000;
  font-family: $font-body;
  font-size: 20px;
  font-weight: 600;
  line-height: 121%;
  text-align: center;
}

.landing-hero__intro {
  display: block;
  color: #000;
  font-family: $font-body;
  font-weight: 500;
  line-height: 121%;

  :deep(p) {
    margin: 0 0 20px;
    padding: 0 10px;
    color: #000;
    font-size: 25px;
    line-height: 121%;
    text-align: center;
  }

  :deep(i),
  :deep(em) {
    color: #000;
    font-style: italic;
  }
}

@media (max-width: 1600px) {
  .landing-hero__headline {
    padding: 2% 10%;
    font-size: 40px;
  }

  .landing-hero__intro {
    :deep(p) {
      font-size: 20px;
    }
  }
}

@media (max-width: 620px) {
  .landing-hero__headline {
    padding: 3% 5%;
    font-size: 30px;
  }

  .landing-hero__author {
    font-size: 17px;
  }

  .landing-hero__inner {
    max-width: 91%;
    padding: 30px 0 15px;
  }

  .landing-hero__intro {
    :deep(p) {
      margin-bottom: 15px;
      font-size: 17px;
    }
  }
}
</style>
