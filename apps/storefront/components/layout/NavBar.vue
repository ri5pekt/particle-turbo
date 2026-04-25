<template>
  <div
    class="nav-bar"
    :class="{ 'nav-bar--dark': isDark }"
  >
    <div class="nav-bar__inner">
      <AppLink
        class="nav-bar__logo"
        to="/"
        aria-label="Particle home"
      >
        <AppImage
          v-if="logo"
          :image="logo"
          :alt="settings.site_name || 'Particle'"
          loading="eager"
        />
        <img
          v-else
          src="/icons/logo-particle.svg"
          alt="Particle"
        >
      </AppLink>

      <nav class="nav-bar__nav" aria-label="Main navigation">
        <NavItem
          v-for="item in settings.header?.nav || []"
          :key="item.id || item.label"
          :item="item"
        />
      </nav>

      <div class="nav-bar__tools">
        <AppLink
          class="nav-bar__account"
          to="/account"
          aria-label="Account"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.6724 6.4678c.2734-.2812.6804-.4707 1.3493-.4707.3971 0 .705.0838.9529.2225.241.1348.4379.3311.5934.6193l.0033.006c.1394.2541.237.6185.237 1.1403 0 .7856-.2046 1.2451-.4796 1.5278l-.0048.005c-.2759.2876-.679.4764-1.334.4764-.3857 0-.6962-.082-.956-.2241-.2388-.1344-.4342-.3293-.5888-.6147-.1454-.275-.2419-.652-.2419-1.1704 0-.7902.2035-1.2442.4692-1.5174zm1.3493-2.4717c-1.0834 0-2.054.3262-2.7838 1.0766-.7376.7583-1.0358 1.781-1.0358 2.9125 0 .7656.1431 1.483.4773 2.112l.0031.0058c.3249.602.785 1.084 1.3777 1.4154l.0062.0035c.5874.323 1.2368.4736 1.9235.4736 1.0818 0 2.0484-.3333 2.7755-1.0896.7406-.7627 1.044-1.786 1.044-2.9207 0-.7629-.1421-1.4784-.482-2.0996-.3247-.6006-.7844-1.0815-1.376-1.4125-.5858-.3276-1.2388-.477-1.9297-.477zM6.4691 16.8582c.2983-.5803.7228-1.0273 1.29-1.3572.5582-.3191 1.2834-.5049 2.2209-.5049h4.04c.9375 0 1.6626.1858 2.2209.5049.5672.3299.9917.7769 1.29 1.3572.3031.5896.4691 1.2936.4691 2.1379v1h2v-1c0-1.1122-.2205-2.1384-.6904-3.0523a5.3218 5.3218 0 0 0-2.0722-2.1769c-.9279-.5315-2.0157-.7708-3.2174-.7708H9.98c-1.1145 0-2.2483.212-3.2225.7737-.8982.5215-1.5928 1.2515-2.0671 2.174C4.2205 16.8577 4 17.8839 4 18.9961v1h2v-1c0-.8443.166-1.5483.4691-2.1379z"
            />
          </svg>
        </AppLink>
        <CartIcon />
        <LanguageSelector class="nav-bar__language" />
        <button
          class="nav-bar__burger"
          type="button"
          aria-label="Open menu"
          @click="isMobileOpen = true"
        >
          <img src="/icons/burger.svg" alt="">
        </button>
      </div>
    </div>
    <MobileMenu
      :open="isMobileOpen"
      :nav="settings.header?.nav || []"
      @close="isMobileOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { SiteSettings } from '~/types/content'

const props = defineProps<{
  settings: SiteSettings
  scrolled?: boolean
}>()

const route = useRoute()
const isMobileOpen = ref(false)

const isDark = computed(() => props.scrolled || route.name === 'index')
const logo = computed(() => props.settings.logo_dark || props.settings.logo || null)
</script>

<style scoped lang="scss">
.nav-bar {
  color: $color-white;
  background: $color-navy-deep;
  transition:
    background-color $transition-base,
    box-shadow $transition-base,
    color $transition-base;
}

.nav-bar--dark {
  color: $color-white;
  background: rgb(3 11 46 / 75%);
}

.nav-bar__inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  min-height: 77px;
  margin: 0 auto;
  padding: 17px 34px;
  gap: 15px;
  transition: all 0.2s ease-out;
}

.nav-bar__logo {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  width: 370px;
  margin-top: auto;
  margin-bottom: auto;

  :deep(img) {
    width: 100%;
    height: auto;
    filter: brightness(0) invert(1);
  }
}

.nav-bar__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1 1 auto;
  width: 100%;
  max-width: 763px;
  gap: 0 10px;
  margin-left: auto;
}

.nav-bar__tools {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 0;
  min-height: 47px;
}

.nav-bar__account {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 52px;
  padding: 3px;
  color: $color-white;
}

.nav-bar__language {
  margin-left: 45px;
}

.nav-bar__burger {
  display: none;
  width: 22.5px;
  min-width: 22.5px;
  height: 17.5px;
  padding: 0;
  margin-top: auto;
  margin-bottom: auto;
  background: transparent;
  border: 0;
  cursor: pointer;

  img {
    width: 22.5px;
    height: auto;
    filter: brightness(0) invert(1);
  }
}

@media (max-width: 1600px) {
  .nav-bar__inner {
    gap: 57px;
  }
}

@media (max-width: 1440px) {
  .nav-bar__inner {
    padding: 20px 34px;
  }

  .nav-bar__account {
    margin: 0 29px;
  }
}

@media only screen and (max-width: 1360px) {
  .nav-bar__logo {
    width: 330px;
  }
}

@media (max-width: 1200px) {
  .nav-bar__nav,
  .nav-bar__language {
    display: none;
  }

  .nav-bar__burger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .nav-bar__inner {
    gap: 0;
    padding: 14px 15px 8px;
  }

  .nav-bar__logo {
    order: 2;
    width: 210px;
    justify-content: center;
    text-align: center;
  }

  .nav-bar__tools {
    order: 3;
    width: 64px;
  }

  .nav-bar__account {
    display: none;
  }

  .nav-bar__burger {
    order: 1;
  }
}
</style>
