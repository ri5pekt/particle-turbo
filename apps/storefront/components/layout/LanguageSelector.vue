<template>
  <button
    class="language-selector"
    type="button"
    aria-label="Language selector"
  >
    <img
      class="language-selector__flag"
      src="/icons/flags/en-flag.svg"
      alt=""
    >
    <span class="language-selector__label">en</span>
    <svg
      class="language-selector__chevron"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.33301 1.5L7.99967 8.16667L14.6663 1.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped lang="scss">
.language-selector {
  display: inline-flex;
  align-items: center;
  color: inherit;
  background: transparent;
  border: 0;
  font-family: $font-body;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  cursor: default;
}

.language-selector__flag {
  width: 16px;
  min-width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 50%;
  object-fit: cover;
}

.language-selector__label {
  display: inline-block;
  margin-top: 5px;
}

.language-selector__chevron {
  margin-left: 5px;
}
</style>
