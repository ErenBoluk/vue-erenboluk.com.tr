<script setup>
import { ref, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowDownTrayIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import CvDownloadModal from './CvDownloadModal.vue'
defineProps({ variant: { type: String, default: 'default' } })
const isDownloading = ref(false)
const isDownloaded = ref(false)
const errorMessage = ref('')
const showModal = ref(false)
const { t } = useI18n()
const route = useRoute()
let timer, controller, objectUrl, disposed = false
const cvFiles = {
  tr: { path: 'assets/cv/cv-turkish.pdf', name: 'Eren Bölük - CV (Turkish).pdf' },
  en: { path: 'assets/cv/cv-english.pdf', name: 'Eren Boluk - CV (English).pdf' }
}
function openCvModal() {
  if (!isDownloading.value && !isDownloaded.value) showModal.value = true
}
async function downloadCV(lang = 'tr') {
  if (isDownloading.value || isDownloaded.value) return
  showModal.value = false
  errorMessage.value = ''
  isDownloading.value = true
  controller = new AbortController()
  try {
    const { path, name } = cvFiles[lang] || cvFiles.tr
    const response = await fetch(`${import.meta.env.BASE_URL}${path}`, { signal: controller.signal })
    if (!response.ok) throw new Error('CV file not found')
    const blob = await response.blob()
    if (disposed) return
    objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = name
    document.body.appendChild(link)
    try { link.click() } finally { link.remove() }
    isDownloaded.value = true
    timer = window.setTimeout(() => {
      isDownloaded.value = false
      URL.revokeObjectURL(objectUrl)
      objectUrl = undefined
    }, 3000)
  } catch (error) {
    if (error.name !== 'AbortError' && !disposed) errorMessage.value = t('general.error_cv_not_found')
  } finally { if (!disposed) isDownloading.value = false }
}
watch(() => route.fullPath, () => { showModal.value = false })
onBeforeUnmount(() => {
  disposed = true
  controller?.abort()
  clearTimeout(timer)
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})
</script>
<template>
  <div class="cv-control" :data-variant="variant">
    <button type="button" class="aura-button" :aria-disabled="isDownloading || isDownloaded" :aria-busy="isDownloading" aria-haspopup="dialog" @click="openCvModal">
      <CheckIcon v-if="isDownloaded" class="size-5 shrink-0" aria-hidden="true" />
      <ArrowDownTrayIcon v-else class="size-5 shrink-0" aria-hidden="true" />
      <span>{{ isDownloading ? t('general.downloading') : isDownloaded ? t('general.downloaded') : t('general.download-cv') }}</span>
    </button>
    <span class="sr-only" role="status">{{ isDownloading ? t('general.downloading') : isDownloaded ? t('general.downloaded') : '' }}</span>
    <p v-if="errorMessage" role="alert" class="cv-error aura-surface">{{ errorMessage }}</p>
    <CvDownloadModal :is-visible="showModal" @close="showModal = false" @download="downloadCV" />
  </div>
</template>
<style scoped>
.cv-control { position: relative; min-width: 0; }
.cv-control > button[aria-disabled="true"] { opacity: .55; cursor: not-allowed; }
.cv-error { position: absolute; right: 0; top: calc(100% + 8px); padding: 12px; width: min(280px, 80vw); color: var(--aura-text); font-size: 14px; z-index: 2; }
</style>
