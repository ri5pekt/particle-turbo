<template>
  <div
    v-if="items.length"
    class="mega-menu"
    :class="{ 'mega-menu--narrow': narrow }"
  >
    <ul class="mega-menu__list">
      <li
        v-for="item in items"
        :key="item.id || item.label"
        class="mega-menu__item"
        :class="{ 'mega-menu__item--heading': item.is_heading }"
      >
        <h3
          v-if="item.is_heading"
          class="mega-menu__heading"
        >
          {{ item.label }}
        </h3>
        <AppLink
          v-else
          class="mega-menu__link"
          :to="item.url || '#'"
        >
          {{ item.label }}
        </AppLink>
        <AppImage
          v-if="item.image"
          class="mega-menu__image"
          :image="item.image"
          :alt="item.label || ''"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { MegaMenuItem } from '~/types/content'

withDefaults(defineProps<{
  items?: MegaMenuItem[]
  narrow?: boolean
}>(), {
  items: () => [],
  narrow: false,
})
</script>

<style scoped lang="scss">
.mega-menu {
  position: absolute;
  top: 52px;
  left: 50%;
  z-index: $z-dropdown;
  width: 850px;
  padding: 54px 283px 50px 70px;
  border: 1px solid rgb(0 19 67 / 8%);
  border-radius: 24px;
  color: #000;
  background: $color-white;
  box-shadow: 0 49px 114px rgb(34 42 88 / 44%);
  columns: 2;
  column-gap: 75px;
  transform: translateX(-50%);
  transition: opacity 0.15s ease-in;

  &::before {
    position: absolute;
    top: -9px;
    left: 50%;
    width: 0;
    height: 0;
    border-right: 9px solid transparent;
    border-bottom: 10px solid $color-white;
    border-left: 9px solid transparent;
    content: '';
    transform: translateX(-50%);
  }

  &::after {
    position: absolute;
    left: 0;
    top: -32px;
    width: 100%;
    height: 32px;
    content: '';
  }
}

.mega-menu__list {
  display: contents;
}

.mega-menu__item {
  position: initial;
  width: 250px;
  break-inside: avoid;

  &:not(.mega-menu__item--heading) {
    margin-left: 10px;
  }
}

.mega-menu__heading {
  font-family: $font-body;
  font-size: 17px;
  font-weight: 800;
  line-height: 113.7%;
  margin: 0 0 16px;
  color: #000;
  text-transform: capitalize;
}

.mega-menu__link {
  display: block;
  margin-bottom: 16px;
  color: #000;
  font-family: $font-body;
  font-size: 17px;
  font-weight: 500;
  line-height: 113.7%;
  text-transform: capitalize;
  white-space: break-spaces;
  transition: color $transition-base;

  &:hover,
  &:focus-visible {
    color: #0038b1;
    font-weight: 500;
  }
}

.mega-menu__image {
  position: absolute;
  top: 50%;
  right: 38px;
  width: auto;
  max-width: 230px;
  height: 230px;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%);
  transition: opacity $transition-base;
}

.mega-menu__item:hover .mega-menu__image,
.mega-menu__item:focus-within .mega-menu__image {
  opacity: 1;
}

.mega-menu--narrow {
  width: auto;
  min-width: 220px;
  padding: 25px;
  columns: 1;

  .mega-menu__item {
    width: auto;
  }
}

@media only screen and (max-width: 1440px) {
  .mega-menu {
    padding-top: 36px;
  }

  .mega-menu__heading,
  .mega-menu__link {
    font-size: 16px;
  }
}

@media only screen and (max-height: 750px) {
  .mega-menu {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .mega-menu__heading,
  .mega-menu__link {
    margin-bottom: 10px;
  }
}
</style>
