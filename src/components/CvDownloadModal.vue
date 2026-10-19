<script setup>
import { trapDialogFocus } from '@/utils/dialogFocus'
import { ref, watch, onBeforeUnmount, onMounted, useId } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { XMarkIcon } from '@heroicons/vue/24/outline'
const props = defineProps({ isVisible: Boolean })
const emit = defineEmits(['close', 'download'])
const { t } = useI18n()
const route = useRoute()
const dialog = ref(null)
const titleId = `cv-title-${useId()}`
watch(() => props.isVisible, visible => {
  if (visible && !dialog.value.open) dialog.value.showModal()
  else if (!visible && dialog.value.open) dialog.value.close()
}, { flush: 'post' })
onMounted(() => { if (props.isVisible) dialog.value.showModal() })
watch(() => route.fullPath, () => { if (props.isVisible) emit('close') })
onBeforeUnmount(() => dialog.value?.close())
</script>
<template>
  <Teleport to="body">
    <dialog ref="dialog" class="cv-dialog aura-surface" :aria-labelledby="titleId" @keydown="trapDialogFocus" @cancel.prevent="emit('close')" @click="event => { if (event.target === dialog) emit('close') }">
      <div class="cv-dialog-body">
        <div class="cv-heading"><h2 :id="titleId" class="text-xl font-semibold">{{ t('general.cv-modal-title') }}</h2><button type="button" class="aura-button close-button" :aria-label="t('general.close-dialog')" autofocus @click="emit('close')"><XMarkIcon class="size-5" aria-hidden="true" /></button></div>
        <div class="grid gap-3">
          <button type="button" class="aura-button" @click="emit('download', 'tr')"><span class="language-code" aria-hidden="true">TR</span>{{ t('general.download-tr') }}</button>
          <button type="button" class="aura-button" @click="emit('download', 'en')"><span class="language-code" aria-hidden="true">EN</span>{{ t('general.download-en') }}</button>
        </div>
        <div class="flex justify-end mt-6"><button type="button" class="aura-button" @click="emit('close')">{{ t('general.cancel') }}</button></div>
      </div>
    </dialog>
  </Teleport>
</template>
<style scoped>
.cv-dialog { padding: 0; width: min(400px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); margin: auto; color: var(--aura-text); overflow-y: auto; }
.cv-dialog::backdrop { background: rgb(0 0 0 / .7); }
.cv-dialog-body { padding: 24px; }
.cv-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.close-button { padding: 10px; flex-shrink: 0; }
.language-code { color: var(--aura-accent); font-size: 12px; font-weight: 600; }
</style>
