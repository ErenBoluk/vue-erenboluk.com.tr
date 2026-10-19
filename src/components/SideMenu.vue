<script setup>
import { trapDialogFocus } from '@/utils/dialogFocus'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { HomeIcon, ClipboardDocumentListIcon, Bars3Icon, XMarkIcon, PlusCircleIcon, BriefcaseIcon } from '@heroicons/vue/24/outline'
import DownloadCvBtn from './DownloadCvBtn.vue'
import LocalizeBtn from './LocalizeBtn.vue'
const { t } = useI18n()
const route = useRoute()
const sidebarShow = ref(false)
const panel = ref(null)
const toolbar = ref(null)
const trigger = ref(null)
const desktop = ref(false)
let media, observer, shell, previousSpace
const menuItems = computed(() => [
  { name: t('sidebar.home'), route: 'home', icon: HomeIcon },
  { name: t('sidebar.about'), route: 'about', icon: ClipboardDocumentListIcon },
  { name: t('sidebar.portfolio'), route: 'portfolio', icon: BriefcaseIcon },
  { name: t('sidebar.hireme'), route: 'hireme', icon: PlusCircleIcon },
])
function closeSidebar() { sidebarShow.value = false }
function syncPanel() {
  if (!panel.value) return
  panel.value.close?.()
  if (desktop.value) return
  else if (sidebarShow.value) panel.value.showModal()
}
function breakpoint() { desktop.value = media.matches; sidebarShow.value = false; nextTick(syncPanel) }
watch(sidebarShow, syncPanel)
watch(() => route.fullPath, closeSidebar)
onMounted(() => {
  media = window.matchMedia('(min-width: 768px)')
  media.addEventListener('change', breakpoint)
  breakpoint()
  shell = toolbar.value.closest('.aura-shell')
  previousSpace = shell?.style.getPropertyValue('--aura-controls-space')
  observer = new ResizeObserver(() => {
    const bottom = toolbar.value.getBoundingClientRect().bottom
    shell?.style.setProperty('--aura-controls-space', `${Math.ceil(bottom + 24)}px`)
  })
  observer.observe(toolbar.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  media?.removeEventListener('change', breakpoint)
  panel.value?.close?.()
  if (previousSpace) shell?.style.setProperty('--aura-controls-space', previousSpace)
  else shell?.style.removeProperty('--aura-controls-space')
})
</script>
<template>
  <div ref="toolbar" class="aura-controls">
    <button ref="trigger" type="button" class="aura-button menu-toggle" :aria-label="t('sidebar.open-menu')" :aria-expanded="sidebarShow" aria-controls="aura-navigation" @click="sidebarShow = true"><Bars3Icon class="size-5" aria-hidden="true" /></button>
    <div class="controls-actions"><DownloadCvBtn /><LocalizeBtn /></div>
  </div>
  <component :is="desktop ? 'div' : 'dialog'" id="aura-navigation" ref="panel" :role="desktop ? undefined : 'dialog'" class="navigation-panel" :aria-label="desktop ? undefined : t('sidebar.navigation')" @keydown="event => !desktop && trapDialogFocus(event)" @cancel.prevent="closeSidebar" @click="event => { if (event.target === panel && !desktop) closeSidebar() }">
    <aside class="navigation-body">
      <button type="button" class="aura-button menu-close" :aria-label="t('sidebar.close-menu')" autofocus @click="closeSidebar"><XMarkIcon class="size-5" aria-hidden="true" /></button>
      <RouterLink :to="{ name: 'home', params: { lang: $i18n.locale } }" class="header-brand" aria-label="eb. Eren Bölük">eb.</RouterLink>
      <nav class="navigation-links" :aria-label="t('sidebar.navigation')">
        <RouterLink v-for="item in menuItems" :key="item.route" :to="{ name: item.route, params: { lang: $i18n.locale } }" class="navigation-link" exact-active-class="navigation-active" @click="closeSidebar"><component :is="item.icon" class="size-5 shrink-0" aria-hidden="true" /><span>{{ item.name }}</span></RouterLink>
      </nav>
      <div class="navigation-footer">
        <div class="flex justify-center gap-3">
          <a :href="t('social.github')" target="_blank" rel="noopener noreferrer" class="aura-button social-link"><img src="@/assets/brands/github.svg" alt="Github" class="size-5" /></a>
          <a :href="t('social.linkedin')" target="_blank" rel="noopener noreferrer" class="aura-button social-link"><img src="@/assets/brands/linkedin.svg" alt="LinkedIn" class="size-5 linkedin-icon" /></a>
        </div>
        <p class="aura-muted text-xs text-center mt-4">© {{ new Date().getFullYear() }} Eren Bölük</p>
      </div>
    </aside>
  </component>
</template>
<style scoped>
.aura-controls { position: fixed; top: 24px; left: var(--aura-gutter); right: var(--aura-gutter); display: flex; align-items: flex-start; gap: 12px; z-index: 40; pointer-events: none; }
.aura-controls > * { pointer-events: auto; }
.controls-actions { margin-left: auto; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; min-width: 0; }
.menu-toggle, .menu-close, .social-link { padding: 10px; flex-shrink: 0; }
.navigation-panel { color: var(--aura-text); background: var(--aura-surface); border: 0; margin: 0; padding: 0; height: 100dvh; max-height: 100dvh; width: min(280px, 90vw); max-width: 90vw; overflow-y: auto; }
.navigation-panel::backdrop { background: rgb(0 0 0 / .7); }
.navigation-body { display: flex; flex-direction: column; min-height: 100%; padding: 24px 16px; }
.menu-close { align-self: flex-end; }
.header-brand { margin: 24px auto; color: var(--aura-text); font-size: 23px; font-weight: 700; letter-spacing: -.08em; text-decoration: none; }
.brand-logo { width: 32px; height: 32px; margin: 24px auto; }
.navigation-links { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding-block: 24px; }
.navigation-link { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 10px 12px; border-left: 3px solid transparent; border-radius: 0 8px 8px 0; color: var(--aura-muted); font-size: 16px; transition: color 180ms ease, background-color 180ms ease; }
.navigation-link:hover { background: var(--aura-canvas); color: var(--aura-text); }
.navigation-active { color: var(--aura-accent); border-left-color: var(--aura-accent); background: var(--aura-canvas); }
.navigation-footer { border-top: 1px solid var(--aura-divider); padding-top: 24px; }
.linkedin-icon { filter: brightness(0) invert(1); }
@media(min-width:768px) { .aura-controls { left: calc(224px + var(--aura-gutter)); } .menu-toggle, .menu-close { display: none; } .navigation-panel { position: static; display: block; flex: 0 0 224px; width: 224px; max-width: 224px; } }
@media(prefers-reduced-motion:reduce) { .navigation-link { transition: none; } }
</style>
