<template>
  <section
    v-if="section.enabled !== false"
    class="ingredients-premium-block"
  >
    <div class="ingredients-premium-block__inner">
      <div class="ingredients-premium-block__content">
        <div
          v-for="(panel, index) in panels"
          :key="panel.key"
          class="ingredients-premium-block__panel"
          :class="`ingredients-premium-block__panel--${panel.key}`"
        >
          <button
            :id="buttonId(index)"
            class="ingredients-premium-block__title btn-reset"
            :class="{ active: activePanel === index }"
            type="button"
            :aria-expanded="activePanel === index"
            :aria-controls="panelId(index)"
            @click="togglePanel(index)"
          >
            <span class="ingredients-premium-block__block-title">{{ panel.title }}</span>
            <img
              src="/icons/plus-blue.svg"
              alt=""
              class="ingredients-premium-block__plus"
              :class="{ active: activePanel === index }"
            >
          </button>

          <div
            :id="panelId(index)"
            class="ingredients-premium-block__list"
            :class="{ 'ingredients-premium-block__list--active': activePanel === index }"
            role="region"
            :aria-labelledby="buttonId(index)"
          >
            <ul
              v-if="panel.key === 'ingredients'"
              class="ingredients-premium-block__ingredients"
            >
              <li
                v-for="ingredient in section.ingredients"
                :key="ingredient.id || ingredient.label"
                class="ingredients-premium-block__ingredient"
              >
                <img
                  class="ingredients-premium-block__check"
                  src="/icons/check-green.svg"
                  alt=""
                >
                <span>{{ ingredient.label }}</span>
              </li>
            </ul>

            <table
              v-else-if="panel.key === 'comparison'"
              class="ingredients-premium-block__table"
            >
              <caption class="sr-only">
                {{ section.particle_heading || 'Particle Face Cream' }} vs {{ section.competitor_heading || 'Competitors' }} comparison
              </caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">{{ section.particle_heading || 'Particle Face Cream' }}</th>
                  <th scope="col">{{ section.competitor_heading || 'Competitors' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in section.comparison_rows"
                  :key="row.id || row.feature"
                >
                  <td>{{ row.feature }}</td>
                  <td>
                    <div class="ingredients-premium-block__item-string">
                      <img
                        class="ingredients-premium-block__check"
                        src="/icons/check-green.svg"
                        alt=""
                      >
                      {{ row.particle_value }}
                    </div>
                  </td>
                  <td>
                    <div class="ingredients-premium-block__item-string">
                      <img
                        class="ingredients-premium-block__x"
                        src="/icons/red-x.svg"
                        alt=""
                      >
                      {{ row.competitor_value }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              v-else-if="panel.key === 'faq'"
              class="ingredients-premium-block__faq"
            >
              <template
                v-for="item in section.faq_items"
                :key="item.id || item.question"
              >
                <h3 class="ingredients-premium-block__faq-question">
                  {{ item.question }}
                </h3>
                <p class="ingredients-premium-block__faq-answer">
                  {{ item.answer }}
                </p>
              </template>
            </div>

            <div
              v-else-if="panel.key === 'guarantee'"
              class="ingredients-premium-block__guarantee"
            >
              <p>{{ section.guarantee_body }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="ingredients-premium-block__image-block">
        <AppImage
          class="ingredients-premium-block__image"
          :image="section.image"
          :alt="section.image_alt || ''"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PdpIngredientsAccordionSectionData } from '~/types/content'

type PanelKey = 'ingredients' | 'comparison' | 'faq' | 'guarantee'

const props = defineProps<{
  section: PdpIngredientsAccordionSectionData
}>()

const activePanel = ref(0)
const panels = computed<Array<{ key: PanelKey, title: string }>>(() => [
  ...(props.section.ingredients?.length
    ? [{ key: 'ingredients' as const, title: props.section.ingredients_title || 'Premium Ingredients' }]
    : []),
  ...(props.section.comparison_rows?.length
    ? [{ key: 'comparison' as const, title: props.section.comparison_title || 'Particle Face Cream VS Competitors' }]
    : []),
  ...(props.section.faq_items?.length
    ? [{ key: 'faq' as const, title: props.section.faq_title || 'Frequently Asked Questions' }]
    : []),
  ...(props.section.guarantee_body
    ? [{ key: 'guarantee' as const, title: props.section.guarantee_title || '30 Day Money Back Guarantee' }]
    : []),
])

const buttonId = (index: number) => `ingredients-btn-${props.section.id || 'pdp'}-${index}`
const panelId = (index: number) => `ingredients-panel-${props.section.id || 'pdp'}-${index}`
const togglePanel = (index: number) => {
  activePanel.value = activePanel.value === index ? -1 : index
}
</script>

<style scoped lang="scss">
.ingredients-premium-block {
  margin: 50px 0;
}

.ingredients-premium-block__inner {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 40px;
}

.ingredients-premium-block__content,
.ingredients-premium-block__image-block {
  flex: 1;
}

.ingredients-premium-block__panel {
  border-bottom: 1px solid #e1e1e9;
}

.ingredients-premium-block__title {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  margin: 30px 0;
  cursor: pointer;
}

.ingredients-premium-block__title.active {
  color: #0038b1;
}

.ingredients-premium-block__block-title {
  font-size: 24px;
  font-weight: 700;
}

.ingredients-premium-block__plus {
  position: absolute;
  right: 0;
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
}

.ingredients-premium-block__plus.active {
  filter: grayscale(100%);
  transform: rotate(-45deg);
}

.ingredients-premium-block__list {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  will-change: max-height;
}

.ingredients-premium-block__list--active {
  max-height: 900px;
}

.ingredients-premium-block__ingredients {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 0 0 20px;
  gap: 20px;
}

.ingredients-premium-block__ingredient,
.ingredients-premium-block__item-string {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ingredients-premium-block__check,
.ingredients-premium-block__x {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
}

.ingredients-premium-block__table {
  width: 100%;
  border: 1px solid #e1e1e9;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.ingredients-premium-block__table th {
  padding: 15px;
  border-bottom: 1px solid #e1e1e9;
  font-weight: 700;
  text-align: left;
}

.ingredients-premium-block__table th:nth-child(2),
.ingredients-premium-block__table td:nth-child(2) {
  background: #f5f5f5;
}

.ingredients-premium-block__table td {
  padding: 15px;
  border-bottom: 1px dashed #e1e1e9;
  font-size: 16px;
  font-weight: 500;
}

.ingredients-premium-block__table tr:last-of-type td {
  border-bottom: 0;
}

.ingredients-premium-block__faq {
  margin-bottom: 20px;
}

.ingredients-premium-block__faq-question {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
}

.ingredients-premium-block__faq-answer,
.ingredients-premium-block__guarantee p {
  margin: 0 0 20px;
  font-size: 16px;
  line-height: 1.45;
}

.ingredients-premium-block__image {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 1310px) {
  .ingredients-premium-block__inner {
    padding: 0 20px;
  }
}

@media (max-width: 992px) {
  .ingredients-premium-block__inner {
    flex-direction: column-reverse;
    padding: 0 15px;
  }
}

@media (max-width: 625px) {
  .ingredients-premium-block__block-title {
    font-size: 16px;
  }

  .ingredients-premium-block__list span,
  .ingredients-premium-block__list p,
  .ingredients-premium-block__list td {
    font-size: 14px;
  }

  .ingredients-premium-block__table td,
  .ingredients-premium-block__table th {
    padding: 9px 3px;
  }

  .ingredients-premium-block__faq-question {
    font-size: 16px;
  }
}
</style>
