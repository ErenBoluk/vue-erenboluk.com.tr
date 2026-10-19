<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { LanguageIcon, CheckIcon } from '@heroicons/vue/24/outline'
const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const showLocalizeModal = ref(false)
const root = ref(null)
const buttonRef = ref(null)
const languages = [{ code: 'en', name: 'English' }, { code: 'tr', name: 'Türkçe' }]
const activeLanguageName = computed(() => languages.find(lang => lang.code === locale.value)?.name || 'English')
function close(returnFocus = false) { showLocalizeModal.value = false; if (returnFocus) buttonRef.value?.focus() }
function changeLanguage(langCode) {
  try { localStorage.setItem('user-locale', langCode) } catch { /* Storage may be unavailable. */ }
  if (locale.value !== langCode) router.push({ name: route.name || 'home', params: { ...route.params, lang: langCode }, query: route.query, hash: route.hash })
  close(true)
}
function outside(event) { if (!root.value?.contains(event.target)) close() }
function escape(event) { if (event.key === 'Escape' && showLocalizeModal.value) { event.preventDefault(); close(true) } }
watch(() => route.fullPath, () => close())
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('keydown', escape)
  if (!languages.some(lang => lang.code === route.params.lang)) {
    let saved
    try { saved = localStorage.getItem('user-locale') } catch { /* Preserve locale without storage. */ }
    if (languages.some(lang => lang.code === saved)) locale.value = saved
    else if (!languages.some(lang => lang.code === locale.value)) locale.value = 'en'
  }
})
onUnmounted(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) })
</script>
<template>
  <div ref="root" class="locale-control" @focusout="event => { if (!root.contains(event.relatedTarget)) close() }">
    <button ref="buttonRef" type="button" class="aura-button" :aria-expanded="showLocalizeModal" aria-controls="language-options" @click="showLocalizeModal = !showLocalizeModal"><LanguageIcon class="size-5 shrink-0" aria-hidden="true" /><span>{{ activeLanguageName }}</span></button>
    <ul v-show="showLocalizeModal" id="language-options" class="locale-options aura-surface">
      <li v-for="language in languages" :key="language.code"><button type="button" class="locale-option" :aria-current="locale === language.code ? 'true' : undefined" @click="changeLanguage(language.code)"><span :lang="language.code">{{ language.name }}</span><CheckIcon v-if="locale === language.code" class="size-4" aria-hidden="true" /></button></li>
    </ul>
  </div>
</template>
<style scoped>
.locale-control { position: relative; }
.locale-options { position: absolute; right: 0; top: calc(100% + 8px); min-width: 160px; padding: 8px; z-index: 1; }
.locale-option { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; padding: 10px 12px; text-align: left; border-radius: 8px; cursor: pointer; }
.locale-option:hover { background: var(--aura-canvas); }
.locale-option[aria-current] { color: var(--aura-accent); }
</style>
