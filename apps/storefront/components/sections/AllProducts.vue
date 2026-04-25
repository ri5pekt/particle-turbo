<template>
  <section
    v-if="section.enabled !== false && categories.length && products.length"
    class="all-products-index section-container"
  >
    <div class="section-inner all-products-index__inner">
      <h2 class="section-title all-products-index__title">
        {{ section.title || 'All Products' }}
      </h2>
      <div
        v-if="section.subtitle_html"
        class="section-subtitle"
        v-html="section.subtitle_html"
      />

      <div class="categories-menu">
        <div class="items">
          <div
            v-for="category in categories"
            :key="category.slug"
            class="item-wrapper"
          >
            <AppImage
              v-if="category.icon"
              class="icon-item"
              :image="category.icon"
              :alt="category.label || ''"
            />
            <button
              type="button"
              class="item btn-reset"
              :class="{ active: category.slug === activeCategory }"
              :aria-pressed="category.slug === activeCategory"
              @click="activeCategory = category.slug || ''"
            >
              <span class="item-title">{{ category.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="tabs">
        <div class="tab active">
          <Transition name="category-fade" mode="out-in">
            <div :key="activeCategory" class="boxes">
              <div
                v-for="product in activeProducts"
                :key="product.id || product.title"
                class="box box-product-index-all"
              >
                <AppLink
                  class="inner"
                  :to="product.url || '#'"
                  :aria-label="`Discover ${product.title || ''}`"
                >
                  <div class="image">
                    <AppImage
                      class="main"
                      :image="product.image"
                      :alt="product.alt || product.title || ''"
                    />
                  </div>
                  <div class="text">
                    <p class="title">{{ product.title }}</p>
                    <div class="description">
                      <p>{{ product.description }}</p>
                    </div>
                    <div class="button">
                      <span>{{ product.button_label || 'Discover' }}</span>
                    </div>
                  </div>
                </AppLink>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AllProductsSectionData } from '~/types/content'

const props = defineProps<{
  section: AllProductsSectionData
}>()

const categories = computed(() => props.section.categories?.filter((category) => category.slug) || [])
const products = computed(() => props.section.items?.filter((item) => item.image?.url && item.category_slug) || [])
const activeCategory = ref(categories.value[0]?.slug || '')

watch(categories, (value) => {
  if (!value.some((category) => category.slug === activeCategory.value)) {
    activeCategory.value = value[0]?.slug || ''
  }
})

const activeProducts = computed(() => {
  return products.value.filter((product) => product.category_slug === activeCategory.value)
})
</script>

<style scoped lang="scss">
.all-products-index {
  position: relative;
  z-index: 3;
  padding: 70px 0;
}

.all-products-index__inner {
  max-width: $section-inner-max;
  margin: auto;
  padding: 0 20px;
}

.all-products-index__title {
  color: $color-navy;
  font-family: $font-heading;
  font-size: 50px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
}

.section-subtitle {
  margin-top: 15px;
  color: $color-navy-mid;
  font-family: $font-heading;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;

  :deep(.coupon) {
    padding: 2px 6px;
    border-radius: 4px;
    color: $color-navy;
    font-weight: 700;
    background: #33f5f4;
  }
}

.categories-menu {
  position: sticky;
  top: 80px;
  z-index: 10;
  margin-top: 55px;
  background: $color-white;
  box-shadow:
    6px 9px 30px 0 rgb(40 32 71 / 5%),
    4px -14px 10px 0 rgb(163 163 176 / 2%),
    0 4px 4px 0 rgb(255 255 255 / 46%) inset;

  &::after,
  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 9;
    display: block;
    width: 235px;
    content: '';
  }

  &::after {
    right: -35px;
    background: linear-gradient(to left, $color-white, $color-white 15%, transparent);
  }

  &::before {
    left: -35px;
    background: linear-gradient(to right, $color-white, $color-white 15%, transparent);
  }
}

.items {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 20px;
}

.icon-item {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.item {
  position: relative;
  color: rgb(34 42 88 / 80%);
  font-family: $font-body;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: 0.5s;
  -webkit-tap-highlight-color: transparent;

  &::after {
    position: absolute;
    bottom: -11px;
    left: 50%;
    display: block;
    width: 0;
    height: 5px;
    background-color: rgb(34 42 88 / 80%);
    opacity: 0;
    transition: 0.5s;
    transform: translateX(-50%);
    content: '';
  }

  &.active {
    color: rgb(34 42 88);
    font-weight: 700;

    &::after {
      width: 60px;
      opacity: 1;
    }
  }
}

.boxes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: -55px -16px;
  margin-top: 0;
}

.category-fade-enter-active,
.category-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.category-fade-enter-from,
.category-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.box {
  width: 33.33%;
  padding: 55px 16px;
}

.inner {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 350px;
  height: 100%;
  margin: auto;
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.image {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 330px;
  font-size: 0;

  :deep(img) {
    width: auto;
    max-height: 100%;
    pointer-events: none;
    transition: transform 0.5s;
  }
}

.text {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-top: 10px;
}

.title {
  color: $color-navy;
  font-family: $font-heading;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
}

.description {
  flex-grow: 1;
  color: $color-navy-mid;
  font-family: $font-heading;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;

  p {
    margin-top: 15px;
    font-size: 17px;
  }
}

.button {
  width: fit-content;
  margin: auto;
  margin-top: 25px;
  padding: 15px 35px;
  border: 1px solid $color-navy-mid;
  border-radius: 7px;
  color: $color-navy-mid;
  font-family: $font-body;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  text-transform: uppercase;
  background: $color-white;
  transition:
    background-color 0.5s,
    color 0.5s;
}

@media only screen and (min-width: 950px) {
  .item:hover {
    color: #0038b1;
  }

  .inner:hover .button {
    color: $color-white;
    background: $color-navy-mid;
  }
}

@media only screen and (max-width: 1370px) {
  .all-products-index {
    padding: 55px 0;
  }

  .all-products-index__title {
    font-size: 45px;
  }

  .categories-menu {
    margin-top: 35px;
  }

  .item-wrapper {
    flex-direction: column;
    margin: 20px;
  }

  .item {
    font-size: 28px;
  }

  .boxes {
    margin: -45px -16px;
    margin-top: 0;
  }

  .box {
    padding: 45px 16px;
  }

  .image {
    height: 270px;
  }
}

@media only screen and (max-width: 950px) {
  .all-products-index {
    padding: 35px 0;
  }

  .all-products-index__title {
    font-size: 35px;
  }

  .categories-menu {
    top: 58px;
    margin: 25px -20px 0;
    padding: 5px 10px;

    &::after,
    &::before {
      content: none;
    }
  }

  .items {
    flex-wrap: wrap;
    justify-content: center;
  }

  .item-wrapper {
    margin: 8px;
  }

  .icon-item {
    width: 20px;
    height: 20px;
  }

  .item {
    font-size: 16px;

    &::after {
      bottom: -8px;
      height: 3px;
    }

    &.active::after {
      width: 40px;
    }
  }

  .boxes {
    margin: -25px -14px;
    margin-top: 0;
  }

  .box {
    width: 50%;
    padding: 25px 14px;
  }

  .image {
    height: 150px;
  }

  .title {
    font-size: 15px;
  }

  .description p {
    margin-top: 10px;
    font-size: 13px;
  }

  .button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>
