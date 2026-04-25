<template>
  <footer
    v-if="footer"
    class="site-footer"
  >
    <div class="site-footer__inner">
      <div
        v-if="footer.columns?.length"
        class="site-footer__columns"
      >
        <FooterColumn
          v-for="column in footer.columns"
          :key="column.id || column.heading"
          :column="column"
        />
        <section
          v-if="footer.show_newsletter_form || footer.newsletter_heading || settings.social_links?.length"
          class="site-footer__box site-footer__newsletter"
        >
          <h2
            v-if="footer.newsletter_heading"
            class="site-footer__heading"
          >
            {{ footer.newsletter_heading }}
          </h2>
          <form
            v-if="footer.show_newsletter_form"
            class="site-footer__newsletter-form"
          >
            <input
              type="email"
              placeholder="example@gmail.com"
              aria-label="Email address"
            >
            <button type="submit">Send</button>
          </form>
          <ul
            v-if="settings.social_links?.length"
            class="site-footer__social"
            aria-label="Social links"
          >
            <li
              v-for="social in settings.social_links"
              :key="social.id || social.platform"
            >
              <AppLink
                v-if="social.url"
                class="site-footer__social-link"
                :to="social.url"
                target="_blank"
                :aria-label="social.aria_label || social.platform"
              >
                <span class="site-footer__social-label">
                  {{ social.platform }}
                </span>
                <svg
                  v-if="socialIcon(social.platform) === 'instagram'"
                  aria-hidden="true"
                  focusable="false"
                  width="33"
                  height="33"
                  viewBox="0 0 33 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22.9429 11.0734C23.7382 11.0734 24.3829 10.4286 24.3829 9.63336C24.3829 8.83807 23.7382 8.19336 22.9429 8.19336C22.1476 8.19336 21.5029 8.83807 21.5029 9.63336C21.5029 10.4286 22.1476 11.0734 22.9429 11.0734Z" fill="currentColor" />
                  <path d="M16.537 9.87695C15.3183 9.87695 14.1269 10.2383 13.1136 10.9154C12.1002 11.5925 11.3104 12.5549 10.8441 13.6809C10.3777 14.8068 10.2556 16.0458 10.4934 17.2411C10.7312 18.4364 11.318 19.5344 12.1798 20.3961C13.0416 21.2579 14.1395 21.8448 15.3349 22.0826C16.5302 22.3203 17.7691 22.1983 18.8951 21.7319C20.0211 21.2655 20.9834 20.4757 21.6605 19.4624C22.3376 18.449 22.699 17.2577 22.699 16.039C22.699 14.4047 22.0498 12.8374 20.8942 11.6818C19.7386 10.5262 18.1713 9.87695 16.537 9.87695ZM16.537 20.039C15.7459 20.039 14.9725 19.8044 14.3147 19.3648C13.6569 18.9253 13.1442 18.3006 12.8415 17.5697C12.5387 16.8388 12.4595 16.0345 12.6139 15.2586C12.7682 14.4827 13.1492 13.7699 13.7086 13.2105C14.268 12.6511 14.9807 12.2702 15.7566 12.1158C16.5326 11.9615 17.3368 12.0407 18.0677 12.3434C18.7986 12.6462 19.4234 13.1589 19.8629 13.8167C20.3024 14.4745 20.537 15.2478 20.537 16.039C20.537 17.0998 20.1156 18.1172 19.3654 18.8674C18.6153 19.6175 17.5979 20.039 16.537 20.039Z" fill="currentColor" />
                  <path d="M16.5371 6.20106C19.7411 6.20106 20.1211 6.21306 21.3861 6.27106C22.147 6.2801 22.9006 6.41979 23.6141 6.68406C24.1318 6.88375 24.6019 7.18961 24.9942 7.58194C25.3866 7.97428 25.6924 8.4444 25.8921 8.96206C26.1564 9.67559 26.2961 10.4292 26.3051 11.1901C26.3631 12.4551 26.3751 12.8351 26.3751 16.0401C26.3751 19.2451 26.3631 19.6231 26.3051 20.8881C26.2961 21.6489 26.1564 22.4025 25.8921 23.1161C25.6924 23.6337 25.3866 24.1038 24.9942 24.4962C24.6019 24.8885 24.1318 25.1944 23.6141 25.3941C22.9006 25.6583 22.147 25.798 21.3861 25.8071C20.1211 25.8651 19.7411 25.8771 16.5371 25.8771C13.3331 25.8771 12.9531 25.8651 11.6881 25.8071C10.9273 25.798 10.1736 25.6583 9.46011 25.3941C8.94245 25.1944 8.47232 24.8885 8.07999 24.4962C7.68765 24.1038 7.3818 23.6337 7.18211 23.1161C6.91784 22.4025 6.77814 21.6489 6.76911 20.8881C6.71111 19.6231 6.69911 19.2431 6.69911 16.0391C6.69911 12.8351 6.71111 12.4551 6.76911 11.1901C6.77814 10.4292 6.91784 9.67559 7.18211 8.96206C7.3818 8.4444 7.68765 7.97428 8.07999 7.58194C8.47232 7.18961 8.94245 6.88375 9.46011 6.68406C10.1736 6.41979 10.9273 6.2801 11.6881 6.27106C12.9531 6.21306 13.3331 6.20106 16.5371 6.20106ZM16.5371 4.03906C13.2781 4.03906 12.8691 4.05306 11.5891 4.11106C10.5939 4.13116 9.60927 4.31983 8.67711 4.66906C7.87983 4.97736 7.15577 5.44884 6.55133 6.05328C5.94689 6.65772 5.47541 7.38179 5.16711 8.17906C4.81777 9.11154 4.62909 10.0965 4.60911 11.0921C4.55111 12.3721 4.53711 12.7791 4.53711 16.0391C4.53711 19.2991 4.55111 19.7071 4.60911 20.9871C4.62921 21.9823 4.81788 22.9669 5.16711 23.8991C5.47541 24.6963 5.94689 25.4204 6.55133 26.0248C7.15577 26.6293 7.87983 27.1008 8.67711 27.4091C9.60958 27.7584 10.5945 27.9471 11.5901 27.9671C12.8701 28.0251 13.2781 28.0391 16.5371 28.0391C19.7961 28.0391 20.2051 28.0251 21.4851 27.9671C22.4807 27.9471 23.4656 27.7584 24.3981 27.4091C25.1954 27.1008 25.9195 26.6293 26.5239 26.0248C27.1283 25.4204 27.5998 24.6963 27.9081 23.8991C28.2571 22.9665 28.4454 21.9816 28.4651 20.9861C28.5231 19.7061 28.5371 19.2991 28.5371 16.0391C28.5371 12.7791 28.5231 12.3711 28.4651 11.0911C28.445 10.0958 28.2563 9.11122 27.9071 8.17906C27.5988 7.38179 27.1273 6.65772 26.5229 6.05328C25.9185 5.44884 25.1944 4.97736 24.3971 4.66906C23.4646 4.32006 22.4796 4.13173 21.4841 4.11206C20.2041 4.05206 19.7971 4.03906 16.5371 4.03906Z" fill="currentColor" />
                </svg>
                <svg
                  v-else-if="socialIcon(social.platform) === 'facebook'"
                  aria-hidden="true"
                  focusable="false"
                  width="33"
                  height="33"
                  viewBox="0 0 33 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.0727 28.8383H18.7607V17.1583H22.6807L23.2727 12.6143H18.7607V9.70228C18.7607 8.39028 19.1287 7.49428 21.0167 7.49428H23.4327V3.41428C23.0167 3.36628 21.5927 3.23828 19.9287 3.23828C16.4407 3.23828 14.0727 5.36628 14.0727 9.25428V12.6143H10.1367V17.1583H14.0727V28.8383Z" fill="currentColor" />
                </svg>
                <svg
                  v-else-if="socialIcon(social.platform) === 'youtube'"
                  aria-hidden="true"
                  focusable="false"
                  width="33"
                  height="33"
                  viewBox="0 0 33 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.1025 15.7725L15.5089 14.0957C15.1953 13.9501 14.9377 14.1133 14.9377 14.4605V17.6189C14.9377 17.9661 15.1953 18.1293 15.5089 17.9837L19.1009 16.3069C19.4161 16.1597 19.4161 15.9197 19.1025 15.7725ZM16.5377 0.679688C8.05453 0.679688 1.17773 7.55649 1.17773 16.0397C1.17773 24.5229 8.05453 31.3997 16.5377 31.3997C25.0209 31.3997 31.8977 24.5229 31.8977 16.0397C31.8977 7.55649 25.0209 0.679688 16.5377 0.679688ZM16.5377 22.2797C8.67533 22.2797 8.53773 21.5709 8.53773 16.0397C8.53773 10.5085 8.67533 9.79969 16.5377 9.79969C24.4001 9.79969 24.5377 10.5085 24.5377 16.0397C24.5377 21.5709 24.4001 22.2797 16.5377 22.2797Z" fill="currentColor" />
                </svg>
                <svg
                  v-else-if="socialIcon(social.platform) === 'tiktok'"
                  aria-hidden="true"
                  focusable="false"
                  width="33"
                  height="33"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M412.19,118.66a109.27,109.27,0,0,1-9.45-5.5,132.87,132.87,0,0,1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14,23.9,350,16,350.13,16H267.69V334.78c0,4.28,0,8.51-.18,12.69,0,.52-.05,1-.08,1.56,0,.23,0,.47-.05,.71,0,.06,0,.12,0,.18a70,70,0,0,1-35.22,55.56,68.8,68.8,0,0,1-34.11,9c-38.41,0-69.54-31.32-69.54-70s31.13-70,69.54-70a68.9,68.9,0,0,1,21.41,3.39l.1-83.94a153.14,153.14,0,0,0-118,34.52,161.79,161.79,0,0,0-35.3,43.53c-3.48,6-16.61,30.11-18.2,69.24-1,22.21,5.67,45.22,8.85,54.73v.2c2,5.6,9.75,24.71,22.38,40.82A167.53,167.53,0,0,0,115,470.66v-.2l.2,.2C155.11,497.78,199.36,496,199.36,496c7.66-.31,33.32,0,62.46-13.81,32.32-15.31,50.72-38.12,50.72-38.12a158.46,158.46,0,0,0,27.64-45.93c7.46-19.61,9.95-43.13,9.95-52.53V176.49c1,.6,14.32,9.41,14.32,9.41s19.19,12.3,49.13,20.31c21.48,5.7,50.42,6.9,50.42,6.9V131.27C453.86,132.37,433.27,129.17,412.19,118.66Z" fill="currentColor" />
                </svg>
                <svg
                  v-else
                  aria-hidden="true"
                  focusable="false"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H0.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor" />
                </svg>
              </AppLink>
            </li>
          </ul>
        </section>
        <section
          v-if="footer.payment_icons?.length || footer.skin_cancer_badge"
          class="site-footer__box site-footer__payments-box"
        >
          <h2
            v-if="footer.payment_icons?.length"
            class="site-footer__heading"
          >
            {{ footer.payment_heading || 'We Accept' }}
          </h2>
          <div
            v-if="footer.payment_icons?.length"
            class="site-footer__payments"
          >
            <AppImage
              v-for="icon in footer.payment_icons"
              :key="icon.id || icon.url"
              :image="icon"
              :alt="icon.alternativeText || icon.name || ''"
            />
          </div>
          <div
            v-if="footer.skin_cancer_badge"
            class="site-footer__sep"
          />
          <div
            v-if="footer.skin_cancer_badge"
            class="site-footer__badge"
          >
            <AppImage
              :image="footer.skin_cancer_badge"
              alt="Skin Cancer Foundation badge"
            />
          </div>
        </section>
      </div>

      <hr class="site-footer__rule">

      <FooterBottom
        :copyright="footer.copyright_text"
        :legal-links="footer.legal_links || []"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { SiteSettings } from '~/types/content'

const props = defineProps<{
  settings: SiteSettings
}>()

const footer = computed(() => props.settings.footer)
const socialIcon = (platform?: string) => {
  const value = (platform || '').toLowerCase()

  if (value.includes('instagram')) return 'instagram'
  if (value.includes('facebook')) return 'facebook'
  if (value.includes('youtube')) return 'youtube'
  if (value.includes('tiktok')) return 'tiktok'

  return 'x'
}
</script>

<style scoped lang="scss">
.site-footer {
  padding: 77px 0 44px;
  color: $color-white;
  background: $color-footer;
}

.site-footer__inner {
  width: min(100% - 48px, $container-max);
  margin: 0 auto;
}

.site-footer__columns {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.site-footer__box {
  min-width: 0;
}

.site-footer__heading {
  max-width: 153px;
  color: $color-white;
  font-family: $font-ui;
  font-size: 22px;
  font-weight: 600;
  line-height: 133.7%;
  text-transform: capitalize;
}

.site-footer__newsletter-form {
  position: relative;
  margin: 24px 0 29px;

  input {
    width: 348px;
    padding: 9px 122px 9px 16px;
    color: $color-white;
    background:
      linear-gradient(0deg, rgb(146 146 160 / 30%), rgb(146 146 160 / 30%)),
      linear-gradient(0deg, rgb(28 35 75 / 30%), rgb(28 35 75 / 30%)),
      rgb(28 35 74 / 30%);
    border: 0;
    border-radius: 34px;

    &::placeholder {
      color: $color-white;
      opacity: 0.7;
      font-family: $font-ui;
      font-weight: 300;
    }
  }

  button {
    position: absolute;
    top: 0;
    right: 0;
    width: 106px;
    height: 41.95px;
    color: $color-white;
    background: $color-sky-light;
    box-shadow: 0 24px 51px rgb(34 42 88 / 40%);
    border: 0;
    border-radius: 39px;
    transition: background 0.15s ease-in;

    &:hover {
      background: #52b9e6;
      cursor: pointer;
    }
  }
}

.site-footer__social {
  display: flex;
  align-items: center;
  gap: 18px;
}

.site-footer__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $color-white;
  transition: color 0.15s ease-in;

  &:hover,
  &:focus-visible {
    color: $color-sky;
  }
}

.site-footer__social-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.site-footer__payments {
  display: flex;
  flex-wrap: wrap;
  max-width: 180px;
  gap: 11px 42px;
  margin-top: 37px;
}

.site-footer__sep {
  width: 100%;
  height: 1px;
  margin: 35px 0;
  background: $color-footer-sep;
}

.site-footer__badge {
  text-align: center;

  :deep(img) {
    width: 150px;
    margin: auto;
  }
}

.site-footer__rule {
  height: 1px;
  margin: 94px 0 34px;
  border: 0;
  background: $color-footer-rule;
  opacity: 0.2;
}

@media (max-width: 1440px) {
  .site-footer {
    padding-right: 39px;
    padding-left: 39px;
  }
}

@media (max-width: 1200px) {
  .site-footer__columns {
    flex-wrap: wrap;
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .site-footer__sep {
    margin: 0;
  }

  .site-footer__badge {
    padding: 25px 0;
  }
}

@media (max-width: 625px) {
  .site-footer {
    padding: 0 39px;
  }

  .site-footer__columns {
    display: none;
  }

  .site-footer__rule {
    display: none;
  }
}
</style>
