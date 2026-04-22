<template>
  <main class="home">
    <h1>particle-turbo</h1>
    <p>Storefront is running. Phase 3 will build real pages here.</p>
    <ul>
      <li>Commerce (Medusa): <a :href="medusaUrl" target="_blank">{{ medusaUrl }}</a></li>
      <li>Content (Strapi): <a :href="strapiUrl" target="_blank">{{ strapiUrl }}</a></li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const { public: { medusaUrl, strapiUrl } } = useRuntimeConfig()
</script>
