<template>
  <button
    class="cart-icon"
    type="button"
    aria-label="Cart"
    @click="openCart"
  >
    <img
      class="cart-icon__image"
      src="/icons/basket.svg"
      alt=""
    >
    <span class="cart-icon__count">{{ itemCount }}</span>
  </button>
</template>

<script setup lang="ts">
const { itemCount, openCart, refreshCart } = useCart()

onMounted(() => {
  refreshCart()
})
</script>

<style scoped lang="scss">
.cart-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  height: 24px;
  margin-left: 45px;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.cart-icon__image {
  width: 24px;
  height: auto;
  filter: brightness(0) invert(1);
}

.cart-icon__count {
  position: absolute;
  top: -6px;
  right: -7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  min-width: 15px;
  height: 15px;
  padding: 0;
  border-radius: 50%;
  color: $color-navy;
  background: $color-sky-light;
  font-family: $font-body;
  font-size: 12px;
  font-weight: 700;
  line-height: 10px;
}

@media (max-width: 576px) {
  .cart-icon {
    width: 21px;
    min-width: 21px;
    margin-left: 0;
  }
}
</style>
