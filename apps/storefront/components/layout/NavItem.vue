<template>
  <Menu
    v-if="hasMegaMenu"
    as="div"
    class="nav-item nav-item--mega"
    :class="{ 'nav-item--suppressed': isMegaMenuSuppressed }"
    @mouseleave="isMegaMenuSuppressed = false"
  >
    <MenuButton class="nav-item__button">
      {{ item.label }}
    </MenuButton>
    <MenuItems
      static
      class="nav-item__dropdown"
    >
      <MegaMenu
        :items="item.mega_menu"
        :narrow="isNarrowMegaMenu"
        @link-click="closeMegaMenu"
      />
    </MenuItems>
  </Menu>
  <AppLink
    v-else
    class="nav-item"
    :to="item.url || '#'"
  >
    {{ item.label }}
  </AppLink>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'
import type { NavTopItem } from '~/types/content'

const props = defineProps<{
  item: NavTopItem
}>()

const hasMegaMenu = computed(() => Boolean(props.item.mega_menu?.length))
const isMegaMenuSuppressed = ref(false)
const isNarrowMegaMenu = computed(() => {
  const megaMenu = props.item.mega_menu || []

  return megaMenu.length > 0
    && megaMenu.every((entry) => !entry.is_heading && !entry.image)
})

const closeMegaMenu = () => {
  isMegaMenuSuppressed.value = true

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
</script>

<style scoped lang="scss">
.nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 47px;
  color: inherit;
  font-family: $font-body;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.5;
  text-transform: uppercase;
  white-space: nowrap;
  transition: font-weight 0.15s ease-out;

  &:hover,
  &:focus-visible {
    color: inherit;
    font-weight: 700;
  }

  &::after {
    position: absolute;
    bottom: -13px;
    left: 0;
    width: 0;
    height: 4px;
    border-radius: 5px;
    background-color: $color-sky-light;
    content: '';
    transition: width 0.15s ease-in;
  }

  &:hover::after,
  &:focus-visible::after {
    width: 54%;
  }
}

.nav-item__button {
  color: inherit;
  background: transparent;
  border: 0;
  font: inherit;
  text-transform: inherit;
  cursor: pointer;
}

.nav-item__dropdown {
  position: absolute;
  top: 0;
  left: 50%;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transition: opacity 0.15s ease-in;
}

.nav-item--mega:not(.nav-item--suppressed):hover .nav-item__dropdown,
.nav-item--mega:not(.nav-item--suppressed):focus-within .nav-item__dropdown {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}
</style>
