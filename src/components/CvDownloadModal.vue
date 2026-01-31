<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div class="relative w-full max-w-sm rounded-2xl bg-neutral-900/90 p-6 shadow-2xl border border-white/10 backdrop-blur-xl transform transition-all">
          
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-white">
              {{ $t('general.cv-modal-title') }}
            </h3>
            <button 
              @click="$emit('close')"
              class="p-1 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Buttons -->
          <div class="space-y-3">
            <button 
              @click="$emit('download', 'tr')"
              class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all border border-white/5 group cursor-pointer"
            >
              <span>🇹🇷</span>
              <span class="font-medium">{{ $t('general.download-tr') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>

            <button 
              @click="$emit('download', 'en')"
              class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all border border-white/5 group cursor-pointer"
            >
              <span>🇺🇸</span>
              <span class="font-medium">{{ $t('general.download-en') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>

          <!-- Footer -->
          <div class="mt-6 flex justify-end">
            <button 
              @click="$emit('close')"
              class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-wider font-medium cursor-pointer"
            >
              {{ $t('general.cancel') }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isVisible: Boolean
})

defineEmits(['close', 'download'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal,
.fade-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.fade-enter-from .modal,
.fade-leave-to .modal {
  opacity: 0;
  transform: scale(0.95);
}
</style>
