<template>
  <div
    v-if="section.enabled !== false && tabs.length"
    ref="root"
    class="pdp-scroll-tabs"
    :class="`pdp-scroll-tabs--${section.theme || 'gravite'}`"
  >
    <section
      v-if="isVarros"
      class="scroll-tabs-varros"
    >
      <div class="section-inner">
        <p
          class="top-title"
          v-html="displayTitle"
        />
        <div class="items">
          <button
            v-for="(tab, index) in tabs"
            :key="`varros-tab-${tab.id || index}`"
            class="item btn-reset"
            type="button"
            :tab-index="index + 1"
          >
            <div class="part-left">
              <div class="circle" />
              <div class="title">
                {{ tab.title }}
              </div>
            </div>
            <div class="part-right">
              <div class="inner">
                <div class="title">
                  {{ tab.title }}
                </div>
                <div class="text">
                  <p>{{ tab.text }}</p>
                </div>
                <div class="images">
                  <img
                    v-for="(image, imageIndex) in tab.images_desktop"
                    :key="`varros-image-${tab.id || index}-${image.id || imageIndex}`"
                    :src="imageUrl(image.url)"
                    :alt="image.alt || ''"
                    :title="image.title || image.alt || ''"
                  >
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="!isVarros"
      class="scroll-tabs"
    >
      <div class="section-inner">
        <div class="parts">
          <div class="part part-text">
            <p class="title">
              {{ section.title }}
            </p>

            <div class="items">
              <button
                v-for="(tab, index) in tabs"
                :key="`desktop-tab-${tab.id || index}`"
                class="item btn-reset"
                type="button"
                :tab-index="index + 1"
              >
                <div class="mark">
                  <div class="circle" />
                </div>
                <div class="line-top" />
                <div class="line-bottom" />
                <div class="box">
                  <p class="title">
                    {{ tab.title }}
                  </p>
                  <div class="content">
                    <p>{{ tab.text }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div class="part part-images">
            <div class="tabs">
              <div
                v-for="(tab, index) in tabs"
                :key="`desktop-images-${tab.id || index}`"
                class="tab"
                :tab-index="index + 1"
              >
                <div class="images">
                  <img
                    v-for="(image, imageIndex) in tab.images_desktop"
                    :key="`desktop-image-${tab.id || index}-${image.id || imageIndex}`"
                    :src="imageUrl(image.url)"
                    :alt="image.alt || ''"
                    :title="image.title || image.alt || ''"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="!isVarros"
      class="scroll-tabs-mobile"
    >
      <div class="section-inner">
        <p class="title">
          {{ section.title }}
        </p>
        <div class="items">
          <button
            v-for="(tab, index) in tabs"
            :key="`mobile-tab-${tab.id || index}`"
            class="item btn-reset"
            type="button"
            :tab-index="index + 1"
          >
            <div class="mark">
              <div class="circle" />
            </div>
            <div class="line-top" />
            <div class="line-bottom" />
            <div class="box">
              <p class="title">
                {{ tab.title }}
              </p>
              <div class="content">
                <p>{{ tab.text }}</p>
                <div class="images">
                  <img
                    v-for="(image, imageIndex) in mobileImages(tab)"
                    :key="`mobile-image-${tab.id || index}-${image.id || imageIndex}`"
                    :src="imageUrl(image.url)"
                    :alt="image.alt || ''"
                    :title="image.title || image.alt || ''"
                  >
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PdpScrollTabImage, PdpScrollTabItem, PdpScrollTabsSectionData } from '~/types/content'

const props = defineProps<{
  section: PdpScrollTabsSectionData
}>()

const config = useRuntimeConfig()
const root = ref<HTMLElement | null>(null)

type GsapMatchMedia = {
  add: (query: string, callback: () => unknown) => void
  revert: () => void
}

let mediaMatch: GsapMatchMedia | null = null
let deferredReinitCleanup: (() => void) | null = null

const tabs = computed(() => (props.section.tabs || []).filter((tab) => tab.title))
const isVarros = computed(() => props.section.theme === 'varros')
const displayTitle = computed(() => props.section.title || '')

const imageUrl = (url?: string | null) => {
  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${config.public.strapiUrl || 'http://localhost:1337'}${url}`
}

const mobileImages = (tab: PdpScrollTabItem): PdpScrollTabImage[] => {
  return tab.images_mobile?.length ? tab.images_mobile : tab.images_desktop || []
}

const resetAnimations = () => {
  deferredReinitCleanup?.()
  deferredReinitCleanup = null
  mediaMatch?.revert()
  mediaMatch = null
}

const isRootNearViewport = () => {
  if (!root.value) {
    return false
  }

  const rect = root.value.getBoundingClientRect()

  return rect.bottom > 0 && rect.top < window.innerHeight * 1.25
}

const deferReinitUntilNearViewport = () => {
  deferredReinitCleanup?.()

  let ticking = false

  const cleanup = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    deferredReinitCleanup = null
  }

  const maybeReinit = async () => {
    ticking = false

    if (!isRootNearViewport()) {
      return
    }

    cleanup()
    await initAnimations()
  }

  function onScroll() {
    if (ticking) {
      return
    }

    ticking = true
    requestAnimationFrame(() => {
      void maybeReinit()
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  deferredReinitCleanup = cleanup
}

const handleSkipJumpComplete = async () => {
  await nextTick()

  if (isRootNearViewport()) {
    await initAnimations()
    return
  }

  deferReinitUntilNearViewport()
}

const waitImages = async (container: Element) => {
  const images = Array.from(container.querySelectorAll('img')).filter((img) => !img.complete || img.naturalWidth === 0)

  if (!images.length) {
    return
  }

  await Promise.all(
    images.map((img) => img.decode?.().catch(() => undefined) || new Promise((resolve) => img.addEventListener('load', resolve, { once: true }))),
  )
}

const naturalHeight = (element: HTMLElement) => {
  const previousHeight = element.style.height
  element.style.height = 'auto'
  const height = element.scrollHeight
  element.style.height = previousHeight

  return height
}

const initAnimations = async () => {
  if (!import.meta.client || !root.value) {
    return
  }

  mediaMatch?.revert()

  const [{ gsap }, { ScrollTrigger }, { ScrollToPlugin }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/ScrollToPlugin'),
  ])

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

  const query = <T extends Element>(selector: string, container: ParentNode = root.value as HTMLElement) => container.querySelector<T>(selector)
  const queryAll = <T extends Element>(selector: string, container: ParentNode = root.value as HTMLElement) => Array.from(container.querySelectorAll<T>(selector))

  mediaMatch = gsap.matchMedia(root.value)

  if (isVarros.value) {
    mediaMatch.add('(min-width: 951px)', async () => {
      const container = query<HTMLElement>('.scroll-tabs-varros')

      if (!container) {
        return undefined
      }

      const items = queryAll<HTMLElement>('.items .item', container)

      if (!items.length) {
        return undefined
      }

      const activeColor = '#b2ada4'
      const inactiveColor = '#100f0d'
      const firstRight = query<HTMLElement>('.part-right', items[0])
      const firstInner = query<HTMLElement>('.part-right .inner', items[0])

      if (!firstRight || !firstInner) {
        return undefined
      }

      const openInnerWidth = Math.round(firstInner.getBoundingClientRect().width)
      const cssPaddingRight = parseFloat(getComputedStyle(firstRight).paddingRight) || 40
      const openRightWidth = openInnerWidth + cssPaddingRight

      gsap.set(queryAll<HTMLElement>('.part-right .inner', container), {
        width: openInnerWidth,
        minWidth: openInnerWidth,
        maxWidth: openInnerWidth,
        boxSizing: 'border-box',
      })

      items.forEach((item, index) => {
        const right = query<HTMLElement>('.part-right', item)
        const images = queryAll<HTMLElement>('img', right || item)
        const title = query<HTMLElement>('.part-left .title', item)

        if (index === 0) {
          gsap.set(item, { flexGrow: 1 })
          gsap.set(right, {
            width: openRightWidth,
            flexBasis: openRightWidth,
            paddingRight: cssPaddingRight,
            opacity: 1,
            overflow: 'hidden',
          })
          gsap.set(images, { autoAlpha: 1 })
          gsap.set(title, { color: activeColor })
        } else {
          gsap.set(item, { flexGrow: 0 })
          gsap.set(right, { width: 0, flexBasis: 0, paddingRight: 0, opacity: 0, overflow: 'hidden' })
          gsap.set(images, { autoAlpha: 0 })
          gsap.set(title, { color: inactiveColor })
        }
      })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          id: 'varros-desktop',
          pin: true,
          pinSpacing: true,
          scrub: true,
          start: 'top top+=30',
          end: `+=${Math.max(0, (items.length - 1) * 100)}%`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      timeline.addLabel('item0')

      items.forEach((item, index) => {
        if (index >= items.length - 1) {
          return
        }

        const next = items[index + 1]
        const currentRight = query<HTMLElement>('.part-right', item)
        const nextRight = query<HTMLElement>('.part-right', next)
        const currentImages = queryAll<HTMLElement>('img', currentRight || item)
        const nextImages = queryAll<HTMLElement>('img', nextRight || next)
        const currentTitle = query<HTMLElement>('.part-left .title', item)
        const nextTitle = query<HTMLElement>('.part-left .title', next)

        timeline.to(currentImages, { autoAlpha: 0, duration: 0.2 })
        timeline.to(currentRight, { width: 0, flexBasis: 0, paddingRight: 0, opacity: 0, duration: 0.35, ease: 'power1.inOut' }, '<')
        timeline.to(item, { flexGrow: 0, duration: 0.2 }, '<')
        timeline.to(next, { flexGrow: 1, duration: 0.2 }, '<')
        timeline.to(nextRight, {
          width: openRightWidth,
          flexBasis: openRightWidth,
          paddingRight: cssPaddingRight,
          opacity: 1,
          duration: 0.45,
          ease: 'power1.inOut',
        }, '<0.05')
        timeline.fromTo(nextImages, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, '<0.1')
        timeline.to(currentTitle, { color: inactiveColor, duration: 0.2 }, '<')
        timeline.to(nextTitle, { color: activeColor, duration: 0.2 }, '<')
        timeline.addLabel(`item${index + 1}`)
      })

      const clickCleanups = items.map((item, index) => {
        const handler = () => {
          gsap.to(window, {
            scrollTo: timeline.scrollTrigger?.labelToScroll(`item${index}`),
            duration: 0.5,
            ease: 'power1.out',
          })
        }

        item.addEventListener('click', handler)

        return () => item.removeEventListener('click', handler)
      })

      requestAnimationFrame(() => ScrollTrigger.refresh())

      return () => {
        clickCleanups.forEach((cleanup) => cleanup())
        timeline.scrollTrigger?.kill()
        timeline.kill()
      }
    })

    mediaMatch.add('(max-width: 950px)', async () => {
      const container = query<HTMLElement>('.scroll-tabs-varros')

      if (!container) {
        return undefined
      }

      const items = queryAll<HTMLElement>('.items .item', container)

      if (!items.length) {
        return undefined
      }

      const activeColor = '#b2ada4'
      const inactiveColor = '#100f0d'
      const firstRight = query<HTMLElement>('.part-right', items[0])

      if (!firstRight) {
        return undefined
      }

      const styles = getComputedStyle(firstRight)
      const openPaddingTop = parseFloat(styles.paddingTop) || 20
      const openPaddingBottom = parseFloat(styles.paddingBottom) || 20

      await waitImages(container)

      items.forEach((item) => {
        const right = query<HTMLElement>('.part-right', item)
        const inner = query<HTMLElement>('.inner', right || item)

        if (right && inner) {
          right.dataset.expandedHeight = String(Math.round(inner.getBoundingClientRect().height + openPaddingTop + openPaddingBottom))
        }
      })

      items.forEach((item, index) => {
        const right = query<HTMLElement>('.part-right', item)
        const images = queryAll<HTMLElement>('img', right || item)
        const title = query<HTMLElement>('.part-left .title', item)
        const expandedHeight = Number(right?.dataset.expandedHeight || 0)

        if (index === 0) {
          gsap.set(right, {
            height: expandedHeight,
            paddingTop: openPaddingTop,
            paddingBottom: openPaddingBottom,
            opacity: 1,
            overflow: 'hidden',
          })
          gsap.set(images, { autoAlpha: 1 })
          gsap.set(title, { color: activeColor })
        } else {
          gsap.set(right, { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, overflow: 'hidden' })
          gsap.set(images, { autoAlpha: 0 })
          gsap.set(title, { color: inactiveColor })
        }
      })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          id: 'varros-mobile',
          pin: true,
          pinSpacing: true,
          scrub: true,
          start: 'top top+=60',
          end: `+=${Math.max(0, (items.length - 1) * 200)}%`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      timeline.addLabel('item0')

      items.forEach((item, index) => {
        if (index >= items.length - 1) {
          return
        }

        const next = items[index + 1]
        const currentRight = query<HTMLElement>('.part-right', item)
        const nextRight = query<HTMLElement>('.part-right', next)
        const currentImages = queryAll<HTMLElement>('img', currentRight || item)
        const nextImages = queryAll<HTMLElement>('img', nextRight || next)
        const currentTitle = query<HTMLElement>('.part-left .title', item)
        const nextTitle = query<HTMLElement>('.part-left .title', next)
        const nextHeight = Number(nextRight?.dataset.expandedHeight || 0)

        timeline.to(currentImages, { autoAlpha: 0, duration: 0.2 })
        timeline.to(currentRight, { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, duration: 0.35, ease: 'power1.inOut' }, '<')
        timeline.to(nextRight, {
          height: nextHeight,
          paddingTop: openPaddingTop,
          paddingBottom: openPaddingBottom,
          opacity: 1,
          duration: 0.45,
          ease: 'power1.inOut',
        }, '<0.05')
        timeline.fromTo(nextImages, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, '<0.1')
        timeline.to(currentTitle, { color: inactiveColor, duration: 0.2 }, '<')
        timeline.to(nextTitle, { color: activeColor, duration: 0.2 }, '<')
        timeline.addLabel(`item${index + 1}`)
      })

      const clickCleanups = items.map((item, index) => {
        const handler = () => {
          gsap.to(window, {
            scrollTo: timeline.scrollTrigger?.labelToScroll(`item${index}`),
            duration: 0.5,
            ease: 'power1.out',
          })
        }

        item.addEventListener('click', handler)

        return () => item.removeEventListener('click', handler)
      })

      requestAnimationFrame(() => ScrollTrigger.refresh())

      return () => {
        clickCleanups.forEach((cleanup) => cleanup())
        timeline.scrollTrigger?.kill()
        timeline.kill()
      }
    })

    return
  }

  mediaMatch.add('(min-width: 951px)', () => {
    const container = query<HTMLElement>('.scroll-tabs')

    if (!container) {
      return undefined
    }

    const items = queryAll<HTMLElement>('.items .item', container)

    items.forEach((item, index) => {
      const content = query<HTMLElement>('.content', item)
      const mark = query<HTMLElement>('.mark', item)
      const circle = query<HTMLElement>('.mark .circle', item)
      const lines = queryAll<HTMLElement>('.line-top, .line-bottom', item)
      const tabIndex = item.getAttribute('tab-index')
      const images = queryAll<HTMLElement>(`.tabs .tab[tab-index="${tabIndex}"] img`, container)

      gsap.set(content, { height: index === 0 ? 56 : 0 })
      gsap.set(mark, { width: index === 0 ? 18 : 14, height: index === 0 ? 18 : 14 })
      gsap.set(circle, { opacity: index === 0 ? 0.5 : 0, scale: index === 0 ? 1 : 0 })
      gsap.set(lines, { opacity: index === 0 ? 1 : 0 })
      gsap.set(images, { autoAlpha: index === 0 ? 1 : 0, height: index === 0 ? '100%' : 0 })
    })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        id: 'desktop-scroll-tabs',
        pin: true,
        pinSpacing: true,
        scrub: true,
        start: 'top 80px',
        end: '+=250%',
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    })

    timeline.addLabel('item0')

    items.forEach((item, index) => {
      if (index >= items.length - 1) {
        return
      }

      const next = items[index + 1]
      const currentIndex = item.getAttribute('tab-index')
      const nextIndex = next.getAttribute('tab-index')

      const currentContent = query<HTMLElement>('.content', item)
      const nextContent = query<HTMLElement>('.content', next)
      const currentMark = query<HTMLElement>('.mark', item)
      const currentCircle = query<HTMLElement>('.mark .circle', item)
      const currentLines = queryAll<HTMLElement>('.line-top, .line-bottom', item)
      const nextMark = query<HTMLElement>('.mark', next)
      const nextCircle = query<HTMLElement>('.mark .circle', next)
      const nextLines = queryAll<HTMLElement>('.line-top, .line-bottom', next)
      const currentImages = queryAll<HTMLElement>(`.tabs .tab[tab-index="${currentIndex}"] img`, container)
      const nextImages = queryAll<HTMLElement>(`.tabs .tab[tab-index="${nextIndex}"] img`, container)

      timeline.to(currentContent, { height: 0, duration: 0.5, ease: 'none' })
      timeline.to(currentMark, { width: 14, height: 14, duration: 0.3 }, '<')
      timeline.to(currentCircle, { opacity: 0, scale: 0, duration: 0.3 }, '<')
      timeline.to(currentLines, { opacity: 0, duration: 0.3 }, '<')
      timeline.to(currentImages, { autoAlpha: 0, height: 0, duration: 0.3, stagger: 0.1 }, '<')

      timeline.to(nextContent, { height: 56, duration: 0.3, ease: 'none' })
      timeline.to(nextMark, { width: 18, height: 18, duration: 0.3 }, '<')
      timeline.to(nextCircle, { opacity: 0.5, scale: 1, duration: 0.3 }, '<')
      timeline.to(nextLines, { opacity: 1, duration: 0.3 }, '<')
      timeline.fromTo(nextImages, { autoAlpha: 0, height: 0 }, { autoAlpha: 1, height: '100%', duration: 0.3, stagger: 0.1 }, '<-0.5')

      timeline.addLabel(`item${index + 1}`)
    })

    const clickCleanups = items.map((item, index) => {
      const handler = () => {
        const html = document.documentElement
        const previous = html.style.scrollBehavior

        html.style.scrollBehavior = 'auto'
        gsap.to(window, {
          scrollTo: timeline.scrollTrigger?.labelToScroll(`item${index}`),
          duration: 0.5,
          ease: 'none',
          onComplete: () => {
            html.style.scrollBehavior = previous
          },
        })
      }

      item.addEventListener('click', handler)

      return () => item.removeEventListener('click', handler)
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      clickCleanups.forEach((cleanup) => cleanup())
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  })

  mediaMatch.add('(max-width: 950px)', async () => {
    const container = query<HTMLElement>('.scroll-tabs-mobile')

    if (!container) {
      return undefined
    }

    const items = queryAll<HTMLElement>('.item', container)

    items.forEach((item) => {
      const content = query<HTMLElement>('.content', item)
      const mark = query<HTMLElement>('.mark', item)
      const circle = query<HTMLElement>('.mark .circle', item)
      const lines = queryAll<HTMLElement>('.line-top, .line-bottom', item)
      const images = queryAll<HTMLElement>('img', content || item)

      gsap.set(content, { height: 'auto', visibility: 'visible' })
      gsap.set(images, { width: '100%', opacity: 1 })
      gsap.set(mark, { width: 18, height: 18 })
      gsap.set(circle, { opacity: 0.5, scale: 1 })
      gsap.set(lines, { opacity: 1 })
    })

    await waitImages(container)

    items.forEach((item) => {
      const content = query<HTMLElement>('.content', item)

      if (content) {
        content.dataset.expandedHeight = String(naturalHeight(content))
      }
    })

    items.forEach((item, index) => {
      if (index === 0) {
        return
      }

      const content = query<HTMLElement>('.content', item)
      const mark = query<HTMLElement>('.mark', item)
      const circle = query<HTMLElement>('.mark .circle', item)
      const lines = queryAll<HTMLElement>('.line-top, .line-bottom', item)
      const images = queryAll<HTMLElement>('img', content || item)

      gsap.set(content, { height: 0 })
      gsap.set(images, { width: 0, opacity: 0 })
      gsap.set(mark, { width: 14, height: 14 })
      gsap.set(circle, { opacity: 0, scale: 0 })
      gsap.set(lines, { opacity: 0 })
    })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        id: 'mobile-scroll-tabs',
        scrub: true,
        pin: true,
        pinSpacing: true,
        start: 'top 60px',
        end: '+=250%',
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    })

    timeline.addLabel('item0')

    items.forEach((item, index) => {
      if (index >= items.length - 1) {
        return
      }

      const next = items[index + 1]
      const currentContent = query<HTMLElement>('.content', item)
      const nextContent = query<HTMLElement>('.content', next)
      const currentMark = query<HTMLElement>('.mark', item)
      const currentCircle = query<HTMLElement>('.mark .circle', item)
      const currentLines = queryAll<HTMLElement>('.line-top, .line-bottom', item)
      const nextMark = query<HTMLElement>('.mark', next)
      const nextCircle = query<HTMLElement>('.mark .circle', next)
      const nextLines = queryAll<HTMLElement>('.line-top, .line-bottom', next)
      const nextImages = queryAll<HTMLElement>('img', nextContent || next)
      const nextHeight = Number(nextContent?.dataset.expandedHeight || 0)

      timeline.to(currentContent, { height: 0, duration: 0.25, ease: 'none' })
      timeline.to(currentMark, { width: 14, height: 14, duration: 0.3 }, '<')
      timeline.to(currentCircle, { opacity: 0, scale: 0, duration: 0.3 }, '<')
      timeline.to(currentLines, { opacity: 0, duration: 0.3 }, '<')

      timeline.to(nextContent, { height: nextHeight, duration: 0.5, ease: 'none' })
      timeline.fromTo(nextImages, { autoAlpha: 0, width: 0 }, { autoAlpha: 1, width: '100%', duration: 0.3, stagger: 0.1 }, '<')
      timeline.to(nextMark, { width: 18, height: 18, duration: 0.3 }, '<')
      timeline.to(nextCircle, { opacity: 0.5, scale: 1, duration: 0.3 }, '<')
      timeline.to(nextLines, { opacity: 1, duration: 0.3 }, '<')

      timeline.addLabel(`item${index + 1}`)
    })

    const clickCleanups = items.map((item, index) => {
      const handler = () => {
        gsap.to(window, {
          scrollTo: timeline.scrollTrigger?.labelToScroll(`item${index}`),
          duration: 0.5,
          ease: 'power1.out',
        })
      }

      item.addEventListener('click', handler)

      return () => item.removeEventListener('click', handler)
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      clickCleanups.forEach((cleanup) => cleanup())
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  })
}

onMounted(async () => {
  window.addEventListener('pdp:scroll-tabs-skip-jump-start', resetAnimations)
  window.addEventListener('pdp:scroll-tabs-skip-jump-complete', handleSkipJumpComplete)

  await nextTick()
  await initAnimations()
})

onBeforeUnmount(() => {
  window.removeEventListener('pdp:scroll-tabs-skip-jump-start', resetAnimations)
  window.removeEventListener('pdp:scroll-tabs-skip-jump-complete', handleSkipJumpComplete)
  resetAnimations()
})
</script>

<style scoped lang="scss">
.pdp-scroll-tabs {
  background: #14161f;
}

.pdp-scroll-tabs--varros {
  background: #f1eee9;
}

.btn-reset {
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  text-align: left;
}

.scroll-tabs {
  padding: 120px 0;
  background: #14161f;
}

.scroll-tabs-mobile {
  display: none;
}

.section-inner {
  max-width: 1600px;
  margin: auto;
  padding: 0 20px;
}

.parts {
  display: flex;
  align-items: stretch;
  gap: 40px;
}

.part-images {
  width: calc(60% - 20px);
  height: 600px;
  flex-shrink: 0;
}

.part-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: calc(40% - 20px);
  flex-shrink: 0;

  > .title {
    max-width: 340px;
    color: #fff;
    font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
    font-size: 40px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }
}

.tabs {
  position: relative;
  width: 100%;
  height: 100%;
}

.tab {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.part-images .images {
  display: flex;
  align-items: stretch;
  gap: 32px;
  height: 100%;

  img {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    border-radius: 6px;
    object-fit: cover;
    opacity: 0;
  }
}

.items .item {
  position: relative;
  display: block;
  width: 100%;
  margin-top: 32px;
  padding-left: 64px;

  &:first-child {
    margin-top: 0;

    .line-top {
      display: none !important;
    }
  }

  &:last-child .line-bottom {
    display: none !important;
  }
}

.mark {
  position: absolute;
  top: 30px;
  left: 8px;
  z-index: 9;
  width: 14px;
  height: 14px;
  border-radius: 100%;
  background: #7a81ad;

  .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 9;
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 100%;
    background: #7a81ad;
    opacity: 0;
    transform: translateX(-50%) translateY(-50%) scale(0);
  }
}

.line-top,
.line-bottom {
  position: absolute;
  left: 16px;
  width: 1px;
  opacity: 0;
}

.line-top {
  top: -20px;
  height: 50px;
  background: linear-gradient(to top, #7a81ad, #14161f);
}

.line-bottom {
  top: 44px;
  bottom: -20px;
  background: linear-gradient(to bottom, #7a81ad, #14161f);
}

.box {
  padding: 24px;
  border-radius: 6px;
  background: #1c1e29;
  cursor: pointer;

  &:hover .title {
    color: #7a81ad;
  }

  .title {
    color: #fff;
    font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
    text-transform: uppercase;
    transition: color 0.5s;
  }

  .content {
    height: 0;
    overflow: hidden;
  }

  .content p {
    margin: 0;
    padding-top: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
  }
}

:global(.pin-spacer) {
  background: #14161f;
}

.pdp-scroll-tabs--varros + :global(.pin-spacer),
.pdp-scroll-tabs--varros :global(.pin-spacer) {
  background: #f1eee9;
}

.scroll-tabs-varros {
  padding: 120px 0;
  background: #f1eee9;

  .section-inner {
    max-width: 1120px;
  }

  .top-title {
    margin: 0;
    color: #100f0d;
    font-family: Raleway, Arial, sans-serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.25;
    text-transform: uppercase;
  }

  .items {
    display: flex;
    height: 580px;
    margin-top: 48px;
    overflow: hidden;
    border: 1px solid #d2d0cc;
    border-radius: 6px;
  }

  .item {
    position: relative;
    display: flex;
    flex: 0 0 auto;
    width: auto;
    height: 100%;
    margin-top: 0;
    padding-left: 0;
    border-left: 1px solid #d2d0cc;
    color: #100f0d;
    text-align: left;

    &:first-child {
      flex: 1 1 auto;
      border-left: 0;

      .part-right {
        flex: 1 1 auto;
        width: auto;
        padding-right: 40px;
        opacity: 1;
      }

      .part-left .title {
        color: #b2ada4;
      }
    }
  }

  .part-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    width: 120px;
    height: 100%;
    padding: 40px;
    cursor: pointer;
  }

  .circle {
    width: 16px;
    height: 16px;
    margin-top: 15px;
    border-radius: 100%;
    background: #932829;
  }

  .part-left .title {
    color: #100f0d;
    font-family: Raleway, Arial, sans-serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
    text-orientation: mixed;
    text-transform: uppercase;
    white-space: nowrap;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }

  .part-right {
    display: flex;
    flex: 0 0 0;
    flex-direction: column;
    width: 0;
    min-width: 0;
    padding: 40px 0;
    overflow: hidden;
    opacity: 0;
  }

  .part-right .title {
    color: #100f0d;
    font-family: Raleway, Arial, sans-serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.5;
    text-transform: uppercase;
  }

  .text {
    max-width: 440px;
    margin-top: 12px;
    color: #100f0d;
    font-family: Raleway, Arial, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;

    p {
      margin: 0;
      font-size: inherit;
    }
  }

  .images {
    display: flex;
    flex: 0 0 auto;
    gap: 12px;
    margin-top: 40px;
  }

  .images img {
    display: block;
    flex: 1 1 0;
    min-width: 0;
    height: 360px;
    border-radius: 6px;
    object-fit: cover;
  }
}

@media (max-width: 950px) {
  .scroll-tabs {
    display: none;
  }

  .scroll-tabs-mobile {
    display: block;
    padding: 45px 0;
    background: #14161f;
  }

  .section-inner > .title {
    max-width: 340px;
    color: #fff;
    font-family: 'Libre Bodoni', Georgia, 'Times New Roman', serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .scroll-tabs-mobile .items {
    margin-top: 32px;
  }

  .scroll-tabs-mobile .items .item {
    margin-top: 20px;
    padding-left: 35px;

    &:first-child {
      margin-top: 0;
    }
  }

  .scroll-tabs-mobile .mark {
    top: 23px;
    left: 0;
  }

  .scroll-tabs-mobile .line-top {
    top: -20px;
    left: 9px;
    height: 44px;
  }

  .scroll-tabs-mobile .line-bottom {
    top: 41px;
    left: 9px;
  }

  .scroll-tabs-mobile .box {
    padding: 20px;

    .title {
      font-size: 17px;
    }

    .content p {
      font-size: 14px;
    }

    .images {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .images img {
      width: 100%;
      height: 63px;
      min-width: 0;
      overflow: hidden;
      border-radius: 6px;
      object-fit: cover;
    }
  }

  .scroll-tabs-varros {
    padding: 60px 0;

    .top-title {
      font-size: 24px;
    }

    .items {
      flex-direction: column;
      height: auto;
      margin-top: 32px;
    }

    .item {
      flex-direction: column;
      height: auto;
      border-top: 1px solid #d2d0cc;
      border-left: 0;

      &:first-child {
        .part-right {
          padding: 20px;
        }
      }
    }

    .part-left {
      flex-direction: row;
      align-items: center;
      width: 100%;
      height: auto;
      padding: 20px;
    }

    .circle {
      margin-top: 0;
    }

    .part-left .title {
      font-size: 16px;
      text-orientation: initial;
      writing-mode: horizontal-tb;
      transform: rotate(0);
    }

    .part-right {
      flex: 0 0 auto;
      width: 100%;
      min-height: 0;
      padding: 0 20px;
    }

    .part-right .title {
      font-size: 20px;
    }

    .text {
      margin-top: 8px;
      font-size: 14px;
    }

    .images {
      gap: 8px;
      margin-top: 20px;
    }

    .images img {
      height: 200px;
    }
  }
}
</style>
