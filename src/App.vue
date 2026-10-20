<script setup>
import { watch, onMounted, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import SideMenu from '@/components/SideMenu.vue'
import Cursor from '@/components/Cursor.vue'
import RouteLoadingBar from '@/components/RouteLoadingBar.vue'


const { locale } = useI18n()
const route = useRoute()
const scrollRef = ref(null)
watch(() => route.name, async () => {
  await nextTick()
  scrollRef.value?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
})

// Update html lang attribute
watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale
}, { immediate: true })

useHead({
  link: [
    {
      rel: 'alternate',
      hreflang: 'en',
      href: () => {
        const path = route.path.replace(/^\/(tr|en)/, '') || '/'
        return `https://erenboluk.com.tr/en${path}`
      }
    },
    {
      rel: 'alternate',
      hreflang: 'tr',
      href: () => {
        const path = route.path.replace(/^\/(tr|en)/, '') || '/'
        return `https://erenboluk.com.tr/tr${path}`
      }
    },
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: () => {
        const path = route.path.replace(/^\/(tr|en)/, '') || '/'
        return `https://erenboluk.com.tr/en${path}`
      }
    }
  ]
})

onMounted(() => {
  document.documentElement.lang = locale.value
})
</script>

<template>
  <div class="aura-shell aura-editorial">
    <RouteLoadingBar />
    <Cursor v-if="route.name !== 'home'" />
    <SideMenu />
    <div ref="scrollRef" class="aura-scroll" data-aura-scroll>
      <div class="aura-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" class="aura-page" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
/* Shared Graphite header and content rhythm across localized routes. */
.aura-editorial { --aura-header-space: 88px; }
.aura-editorial .aura-scroll { scroll-padding-top: max(var(--aura-controls-space), var(--aura-header-space)); }
.aura-editorial .aura-content { max-width: 1440px; padding-inline: 24px; padding-bottom: 32px; }
@media (min-width: 768px) {
  .aura-editorial { --aura-header-space: 144px; }
.aura-editorial .aura-content { padding-inline: clamp(32px, 4.5vw, 64px); padding-top: max(var(--aura-controls-space), 144px); }
  .aura-editorial :deep(.navigation-panel) { position: fixed; inset: 0 0 auto; z-index: 30; width: 100%; max-width: none; height: 136px; max-height: none; overflow: visible; background: var(--aura-canvas); border-bottom: 1px solid var(--aura-divider); }
  .aura-editorial :deep(.navigation-body) { display: grid; grid-template-columns: 32px 1fr; align-items: center; gap: 12px 32px; min-height: 0; height: 100%; padding: 20px clamp(32px, 4.5vw, 64px); }
  .aura-editorial :deep(.header-brand) { grid-column: 1; margin: 0; justify-self: start; font-size: 23px; font-weight: 700; line-height: 1; letter-spacing: -.08em; }
  .aura-editorial :deep(.navigation-links) { grid-column: 1 / -1; grid-row: 2; flex-direction: row; justify-content: center; gap: 20px; padding: 0; }
  .aura-editorial :deep(.navigation-link) { min-height: 36px; padding: 6px 2px; border: 0; border-radius: 0; font-size: 13px; }
  .aura-editorial :deep(.navigation-link svg) { display: none; }
  .aura-editorial :deep(.navigation-active) { background: transparent; box-shadow: inset 0 -1px var(--aura-accent); }
  .aura-editorial :deep(.navigation-footer) { display: none; }
  .aura-editorial :deep(.aura-controls) { left: auto; right: clamp(32px, 4.5vw, 64px); }
  .aura-editorial :deep(.aura-controls .aura-button) { min-height: 40px; padding: 8px 12px; font-size: 13px; background: var(--aura-canvas); border-color: rgb(244 244 245 / .2); }
}
@media (min-width: 1024px) {
  .aura-editorial { --aura-header-space: 88px; }
.aura-editorial .aura-content { padding-top: max(var(--aura-controls-space), 88px); }
  .aura-editorial :deep(.navigation-panel) { height: 88px; }
  .aura-editorial :deep(.navigation-body) { grid-template-columns: 32px minmax(0, 1fr) 292px; gap: 32px; }
  .aura-editorial :deep(.navigation-links) { grid-column: 2; grid-row: 1; }
}
</style>
