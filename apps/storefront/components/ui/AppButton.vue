<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'text'
}>(), {
  variant: 'primary',
})

const classes = computed(() => ['app-button', `app-button--${props.variant}`])
</script>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 232px;
  min-height: 64px;
  padding: 0 $space-8;
  border-radius: 7px;
  font-family: $font-body;
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  transition:
    background-color $transition-base,
    border-color $transition-base,
    color $transition-base;
}

.app-button--primary {
  color: #010101;
  background: $color-sky;

  &:hover {
    background: #85d2f3;
  }
}

.app-button--outline {
  color: $color-sky;
  border: 1px solid currentcolor;
}

.app-button--text {
  min-width: auto;
  min-height: auto;
  padding: 0;
  color: $color-sky;
}
</style>
