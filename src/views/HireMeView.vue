<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowUpRightIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useEditorialMotion } from '@/composables/useEditorialMotion'
const { t } = useI18n()
useHead({
  title: () => t('seo.hireme.title'),
  meta: [
    { name: 'description', content: () => t('seo.hireme.description') },
    { property: 'og:title', content: () => t('seo.hireme.title') },
    { property: 'og:description', content: () => t('seo.hireme.description') },
    { name: 'twitter:title', content: () => t('seo.hireme.title') },
    { name: 'twitter:description', content: () => t('seo.hireme.description') }
  ]
})

const rootRef = ref(null)
const nameInputRef = ref(null)
const successRef = ref(null)
useEditorialMotion(rootRef)
const formData = reactive({ name: '', email: '', message: '' })
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const spamTimeoutUntil = ref(0)
const spamRemainingFormatted = ref('')
let timerInterval, controller, disposed = false
function formatRemainingTime(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000)
  return seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`
}
function updateTimer() {
  const remaining = spamTimeoutUntil.value - Date.now()
  if (remaining > 0) spamRemainingFormatted.value = formatRemainingTime(remaining)
  else {
    spamTimeoutUntil.value = 0
    clearInterval(timerInterval)
    timerInterval = undefined
    try { localStorage.removeItem('hireMeTimeoutUntil') } catch { /* Keep form usable without storage. */ }
  }
}
function startTimer() { clearInterval(timerInterval); updateTimer(); if (spamTimeoutUntil.value > 0) timerInterval = window.setInterval(updateTimer, 1000) }
async function resetForm() {
  formData.name = ''; formData.email = ''; formData.message = ''
  isSuccess.value = false
  errorMessage.value = ''
  await nextTick()
  if (!disposed) nameInputRef.value?.focus()
}
async function handleSubmit() {
  if (isSubmitting.value || spamTimeoutUntil.value > Date.now()) return
  isSubmitting.value = true
  errorMessage.value = ''
  controller = new AbortController()
  try {
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/hire'
    if (!apiUrl.endsWith('/api/hire')) apiUrl = `${apiUrl.replace(/\/$/, '')}/api/hire`
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formData.name, email: formData.email, message: formData.message }), signal: controller.signal })
    if (disposed) return
    if (response.status === 429) {
      const data = await response.json().catch(() => ({}))
      if (disposed) return
      const proposed = Number(data.retryAfterMs)
      spamTimeoutUntil.value = Date.now() + (Number.isFinite(proposed) && proposed > 0 ? proposed : 300000)
      try { localStorage.setItem('hireMeTimeoutUntil', String(spamTimeoutUntil.value)) } catch { /* Timer still works for this visit. */ }
      startTimer()
      return
    }
    if (!response.ok) throw new Error('Request failed')
    isSuccess.value = true
    await nextTick()
    if (!disposed) successRef.value?.focus()
  } catch (error) {
    if (!disposed && error.name !== 'AbortError') errorMessage.value = t('hireme.error')
  } finally { if (!disposed) isSubmitting.value = false }
}
onMounted(() => {
  let stored = 0
  try { stored = Number(localStorage.getItem('hireMeTimeoutUntil')) } catch { /* Optional persistence. */ }
  if (Number.isFinite(stored) && stored > Date.now()) { spamTimeoutUntil.value = stored; startTimer() }
  else updateTimer()
})
onBeforeUnmount(() => { disposed = true; clearInterval(timerInterval); controller?.abort() })
</script>
<template>
  <main ref="rootRef" class="editorial-page contact-page" aria-labelledby="contact-heading">
    <div class="contact-layout">
      <header class="contact-introduction" data-aura-reveal>
        <p class="editorial-kicker">03 / {{ t('hireme.title') }}</p>
        <h1 id="contact-heading" class="editorial-title">{{ t('hireme.headline') }}</h1>
        <p class="contact-availability"><span aria-hidden="true"></span>{{ t('hireme.open-work') }}</p>
        <div class="contact-address"><span class="editorial-meta">{{ t('hireme.email') }}</span><a class="editorial-text-link" href="mailto:erenboluk.dev@gmail.com">erenboluk.dev@gmail.com<ArrowUpRightIcon aria-hidden="true" /></a></div>
        <div class="contact-socials"><a :href="t('social.github')" target="_blank" rel="noopener noreferrer" class="editorial-text-link"><img src="@/assets/brands/github.svg" alt="" aria-hidden="true" />GitHub<ArrowUpRightIcon aria-hidden="true" /></a><a :href="t('social.linkedin')" target="_blank" rel="noopener noreferrer" class="editorial-text-link"><img src="@/assets/brands/linkedin.svg" alt="" aria-hidden="true" />LinkedIn<ArrowUpRightIcon aria-hidden="true" /></a></div>
      </header>
      <div class="contact-form-frame" data-aura-reveal>
        <section v-if="isSuccess" ref="successRef" class="contact-success" role="status" tabindex="-1"><CheckCircleIcon aria-hidden="true" /><h2>{{ t('hireme.success_title') }}</h2><p>{{ t('hireme.success_message') }}</p><button type="button" class="aura-button" @click="resetForm">{{ t('hireme.send_another') }}</button></section>
        <form v-else :aria-busy="isSubmitting" @submit.prevent="handleSubmit">
          <div v-if="spamTimeoutUntil > 0" class="form-notice" role="status" aria-live="polite"><h2>{{ t('hireme.spam_title') }}</h2><p>{{ t('hireme.spam_message', { time: spamRemainingFormatted }) }}</p></div>
          <p v-if="errorMessage" class="form-notice form-error" role="alert">{{ errorMessage }}</p>
          <fieldset :disabled="isSubmitting || spamTimeoutUntil > 0">
            <legend class="sr-only">{{ t('hireme.title') }}</legend>
            <div class="form-field"><label for="contact-name">{{ t('hireme.name') }}</label><input id="contact-name" ref="nameInputRef" v-model="formData.name" type="text" name="name" autocomplete="name" placeholder="John Doe" required /></div>
            <div class="form-field"><label for="contact-email">{{ t('hireme.email') }}</label><input id="contact-email" v-model="formData.email" type="email" name="email" autocomplete="email" placeholder="john@example.com" required /></div>
            <div class="form-field"><label for="contact-message">{{ t('hireme.message') }}</label><textarea id="contact-message" v-model="formData.message" name="message" rows="5" :placeholder="t('hireme.message_placeholder')" required></textarea></div>
            <button class="aura-button aura-button-primary contact-submit" type="submit" :disabled="isSubmitting || spamTimeoutUntil > 0"><span>{{ isSubmitting ? t('hireme.sending') : t('hireme.send') }}</span><ArrowUpRightIcon class="size-4" aria-hidden="true" /></button>
          </fieldset>
        </form>
      </div>
    </div>
  </main>
</template>
<style scoped>
.contact-layout { display: grid; gap: 40px; padding-block: 56px 48px; align-items: start; }
.contact-introduction .editorial-title { max-width: 14ch; font-size: clamp(2.75rem, 5vw, 4.5rem); line-height: 1.08; }
.contact-availability { display: flex; align-items: center; gap: 10px; margin-top: 32px; color: var(--aura-muted); font-size: 13px; }
.contact-availability > span { width: 5px; height: 5px; border-radius: 50%; background: var(--aura-accent); }
.contact-address { display: grid; gap: 4px; border-top: 1px solid var(--aura-divider); margin-top: 40px; padding-top: 24px; }
.contact-address a { overflow-wrap: anywhere; }
.contact-socials { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 12px; }
.contact-socials img { width: 16px; height: 16px; filter: brightness(0) invert(1); }
.contact-form-frame { border: 1px solid var(--aura-divider); background: var(--aura-surface); border-radius: 8px; padding: 32px; min-width: 0; }
fieldset { min-width: 0; border: 0; padding: 0; margin: 0; }
.form-field + .form-field { margin-top: 24px; }
.form-field label { display: block; margin-bottom: 10px; font-size: 13px; color: var(--aura-text); }
.form-field input, .form-field textarea { display: block; width: 100%; min-height: 48px; padding: 12px 14px; border: 1px solid var(--aura-border); border-radius: 6px; background: var(--aura-canvas); color: var(--aura-text); font-size: 16px; line-height: 1.6; }
.form-field textarea { resize: vertical; min-height: 160px; }
.form-field input::placeholder, .form-field textarea::placeholder { color: var(--aura-muted); opacity: 1; }
.form-field input:focus-visible, .form-field textarea:focus-visible { border-color: var(--aura-accent); }
.contact-submit { width: 100%; justify-content: space-between; margin-top: 28px; }
.form-notice { border-left: 2px solid var(--aura-accent); padding: 4px 0 4px 16px; margin-bottom: 24px; color: var(--aura-muted); font-size: 14px; line-height: 1.7; }
.form-notice h2 { font-size: 16px; color: var(--aura-text); font-weight: 500; margin-bottom: 8px; }
.form-error { border-color: #fda4af; color: #fecdd3; }
.contact-success { min-height: 360px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 20px; }
.contact-success > svg { width: 32px; height: 32px; color: var(--aura-accent); }
.contact-success h2 { font-size: 32px; font-weight: 500; line-height: 1.15; letter-spacing: -.04em; }
.contact-success p { color: var(--aura-muted); font-size: 15px; line-height: 1.8; }
.contact-success .aura-button { margin-top: 8px; }
@media (min-width: 1024px) { .contact-layout { grid-template-columns: 1fr 1fr; gap: clamp(48px, 7vw, 112px); } }
@media (max-width: 767px) { .contact-layout { padding-block: 38px 24px; } .contact-form-frame { padding: 24px 20px; } }
</style>
