<script setup>
import { ref } from 'vue'
import { ArrowDownTrayIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import CvDownloadModal from './CvDownloadModal.vue'

// State management
const isDownloading = ref(false)
const isDownloaded = ref(false)
const showModal = ref(false)
const { locale: siteLang } = useI18n()

const cvFiles = {
  tr: {
    path: 'assets/cv/cv-turkish.pdf',
    name: 'Eren Bölük - CV (Turkish).pdf'
  },
  en: {
    path: 'assets/cv/cv-english.pdf',
    name: 'Eren Boluk - CV (English).pdf'
  }
}

const getCvFile = (lang) => {
  return cvFiles[lang] || cvFiles['tr']
}

const downloadCV = async (lang = 'tr') => {
  if (isDownloading.value || isDownloaded.value) return
  
  // Close modal if open
  showModal.value = false

  try {
    isDownloading.value = true

    const { path, name } = getCvFile(lang)
    const response = await fetch(path)

    if (!response.ok) {
      throw new Error('CV file not found')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    isDownloaded.value = true

    setTimeout(() => {
      isDownloaded.value = false
    }, 3000)

  } catch (error) {
    console.error('Download failed:', error)
    alert('CV dosyası bulunamadı. Lütfen daha sonra tekrar deneyin.')
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="relative flex items-center justify-center">
    <!-- Buton -->
    <button 
      @click="showModal = true"
      :disabled="isDownloading"
      class="relative p-[2px] overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
      :class="{ 'cursor-not-allowed': isDownloading }"
    >
      <!-- Dönen Kenarlık -->
      <div 
        class="absolute top-1/2 left-1/2 w-[400%] h-[400%] transition-all duration-300"
        :class="[
          isDownloaded ? 'animate-pulse' : 'animate-spin-slow',
          isDownloading ? 'opacity-50' : 'opacity-100'
        ]"
        :style="isDownloaded 
          ? 'background: conic-gradient(rgba(34, 197, 94, 0.8) 0deg, rgba(34, 197, 94, 0.8) 60deg, transparent 150deg);' 
          : 'background: conic-gradient(rgba(244, 114, 182, 0.8) 0deg, rgba(192, 132, 252, 0.8) 60deg, transparent 150deg);'
        "
      >
      </div>

      <!-- Buton İçeriği -->
      <div class="relative flex items-center justify-center bg-secondary p-3 text-neutral-400 rounded-md shadow-lg transition-all duration-300 hover:bg-neutral-800">
        <span class="flex justify-center items-center gap-x-1">
          <!-- Loading State -->
          <template v-if="isDownloading">
            <span class="text-sm">{{ $t('general.downloading') || 'İndiriliyor...' }}</span>
            <div class="size-4 border-2 border-neutral-500 border-t-purple-400 rounded-full animate-spin"></div>
          </template>
          
          <!-- Success State -->
          <template v-else-if="isDownloaded">
            <span class="text-sm text-green-400">{{ $t('general.downloaded') || 'İndirildi!' }}</span>
            <CheckIcon class="size-4 text-green-400" />
          </template>
          
          <!-- Default State -->
          <template v-else>
            <span>{{ $t('general.download-cv') }}</span>
            <ArrowDownTrayIcon class="size-4 inline-block ms-1 transition-transform duration-300 group-hover:translate-y-0.5" />
          </template>
        </span>
      </div>
    </button>

    <CvDownloadModal 
      :is-visible="showModal"
      @close="showModal = false"
      @download="downloadCV"
    />
  </div>
</template>

<style scoped>
@keyframes spinSlow {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.animate-spin-slow {
  animation: spinSlow 5s linear infinite;
}

/* Hover effects */
button:hover .group-hover\:translate-y-0\.5 {
  transform: translateY(2px);
}

/* Pulse animation for success state */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>