<template>
  <div
    v-if="items.length"
    class="mega-menu"
    :class="{ 'mega-menu--narrow': narrow }"
    @mouseleave="activeItem = null"
  >
    <ul class="mega-menu__list">
      <li
        v-for="group in groupedItems"
        :key="group.key"
        class="mega-menu__group"
      >
        <h3
          v-if="group.heading"
          class="mega-menu__heading"
        >
          {{ group.heading.label }}
        </h3>
        <ul class="mega-menu__group-list">
          <li
            v-for="item in group.links"
            :key="item.id || item.label"
            class="mega-menu__item"
          >
            <AppLink
              class="mega-menu__link"
              :to="item.url || '#'"
              @focus="activeItem = item"
              @mouseenter="activeItem = item"
              @click="$emit('link-click')"
            >
              {{ item.label }}
            </AppLink>
          </li>
        </ul>
      </li>
    </ul>
    <AppImage
      v-if="activeItem?.image"
      class="mega-menu__image"
      :image="activeItem.image"
      :alt="activeItem.label || ''"
    />
  </div>
</template>

<script setup lang="ts">
import type { MegaMenuItem } from '~/types/content'

interface MegaMenuGroup {
  key: string
  heading?: MegaMenuItem
  links: MegaMenuItem[]
}

const props = withDefaults(defineProps<{
  items?: MegaMenuItem[]
  narrow?: boolean
}>(), {
  items: () => [],
  narrow: false,
})

defineEmits<{
  'link-click': []
}>()

const activeItem = ref<MegaMenuItem | null>(null)

const groupedItems = computed<MegaMenuGroup[]>(() => {
  const groups: MegaMenuGroup[] = []
  let currentGroup: MegaMenuGroup | null = null

  props.items.forEach((item, index) => {
    if (item.is_heading || !currentGroup) {
      currentGroup = {
        key: String(item.id || item.label || index),
        heading: item.is_heading ? item : undefined,
        links: [],
      }
      groups.push(currentGroup)

      if (item.is_heading) {
        return
      }
    }

    currentGroup.links.push(item)
  })

  return groups.filter((group) => group.heading || group.links.length)
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

.mega-menu__group {
  position: initial;
  width: 250px;
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;
}

.mega-menu__group-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mega-menu__item {
  position: initial;
  margin-left: 10px;
  break-inside: avoid;
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
  pointer-events: none;
  transform: translateY(-50%);
  opacity: 1;
}

.mega-menu--narrow {
  width: auto;
  min-width: 220px;
  padding: 25px;
  columns: 1;

  .mega-menu__group {
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
