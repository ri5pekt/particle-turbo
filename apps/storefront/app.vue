<template>
  <div id="app">
    <ClientOnly>
      <AdminBar />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CartDrawer />
  </div>
</template>
