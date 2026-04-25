import type { SiteSettings } from '~/types/content'

export const useSiteSettings = () => {
  return useAsyncData<SiteSettings>('site-settings', () => $fetch('/api/site-setting'))
}
