<template>
  <TransitionRoot
    :show="open"
    as="template"
  >
    <Dialog
      class="mobile-menu"
      @close="$emit('close')"
    >
      <TransitionChild
        as="template"
        enter="mobile-menu__overlay-enter"
        enter-from="mobile-menu__overlay-enter-from"
        enter-to="mobile-menu__overlay-enter-to"
        leave="mobile-menu__overlay-leave"
        leave-from="mobile-menu__overlay-leave-from"
        leave-to="mobile-menu__overlay-leave-to"
      >
        <div class="mobile-menu__overlay" />
      </TransitionChild>
      <TransitionChild
        as="template"
        enter="mobile-menu__panel-enter"
        enter-from="mobile-menu__panel-enter-from"
        enter-to="mobile-menu__panel-enter-to"
        leave="mobile-menu__panel-leave"
        leave-from="mobile-menu__panel-leave-from"
        leave-to="mobile-menu__panel-leave-to"
      >
        <DialogPanel class="mobile-menu__panel">
          <button
            class="mobile-menu__close"
            type="button"
            aria-label="Close menu"
            @click="$emit('close')"
          >
            x
          </button>
          <nav class="mobile-menu__nav" aria-label="Mobile navigation">
            <template
              v-for="item in nav"
              :key="item.id || item.label"
            >
              <AppLink
                v-if="item.url"
                class="mobile-menu__link"
                :to="item.url"
                @click="$emit('close')"
              >
                {{ item.label }}
              </AppLink>
              <div
                v-else
                class="mobile-menu__group"
              >
                <p class="mobile-menu__group-title">{{ item.label }}</p>
                <AppLink
                  v-for="child in item.mega_menu?.filter((entry) => !entry.is_heading && entry.url)"
                  :key="child.id || child.label"
                  class="mobile-menu__sublink"
                  :to="child.url || '#'"
                  @click="$emit('close')"
                >
                  {{ child.label }}
                </AppLink>
              </div>
            </template>
          </nav>
          <div class="mobile-menu__tools">
            <LanguageSelector />
            <CartIcon />
          </div>
        </DialogPanel>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import type { NavTopItem } from '~/types/content'

withDefaults(defineProps<{
  open?: boolean
  nav?: NavTopItem[]
}>(), {
  open: false,
  nav: () => [],
})

defineEmits<{
  close: []
}>()
</script>

<style scoped lang="scss">
.mobile-menu {
  position: relative;
  z-index: $z-modal;
}

.mobile-menu__overlay {
  position: fixed;
  inset: 0;
  background: rgb(3 11 46 / 45%);
}

.mobile-menu__panel {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: min(390px, 100vw);
  padding: 45px 10px 42px 28px;
  color: $color-white;
  background: $color-navy-deep;
  overflow-y: auto;
}

.mobile-menu__close {
  position: relative;
  z-index: 1;
  width: 18px;
  height: 18px;
  margin-left: auto;
  color: $color-white;
  background: transparent;
  border: 0;
  font-size: 0;
  cursor: pointer;

  &::before,
  &::after {
    position: absolute;
    left: 0;
    display: block;
    width: 100%;
    height: 2px;
    border-radius: 3px;
    background-color: $color-white;
    content: '';
  }

  &::before {
    transform: rotate(-45deg);
  }

  &::after {
    transform: rotate(45deg);
  }
}

.mobile-menu__nav {
  display: grid;
  gap: 40px;
  margin-top: 35px;
  padding-right: 10px;
}

.mobile-menu__link,
.mobile-menu__group-title {
  color: $color-white;
  font-family: $font-body;
  font-size: 25px;
  font-weight: 500;
  line-height: 113.7%;
  text-transform: capitalize;
}

.mobile-menu__group {
  display: grid;
  gap: $space-3;
}

.mobile-menu__sublink {
  padding-left: 10px;
  color: $color-white;
  font-family: $font-body;
  font-size: 17px;
  font-weight: 500;
  line-height: 113.7%;
  text-transform: capitalize;
}

.mobile-menu__tools {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: auto;
  padding-top: 40px;
}

:global(.mobile-menu__overlay-enter),
:global(.mobile-menu__overlay-leave) {
  transition: opacity $transition-base;
}

:global(.mobile-menu__overlay-enter-from),
:global(.mobile-menu__overlay-leave-to) {
  opacity: 0;
}

:global(.mobile-menu__overlay-enter-to),
:global(.mobile-menu__overlay-leave-from) {
  opacity: 1;
}

:global(.mobile-menu__panel-enter),
:global(.mobile-menu__panel-leave) {
  transition: transform $transition-base;
}

:global(.mobile-menu__panel-enter-from),
:global(.mobile-menu__panel-leave-to) {
  transform: translateX(-100%);
}

:global(.mobile-menu__panel-enter-to),
:global(.mobile-menu__panel-leave-from) {
  transform: translateX(0);
}
</style>
