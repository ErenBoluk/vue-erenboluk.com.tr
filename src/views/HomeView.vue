<script setup>
import ProgressiveImage from '@/components/ProgressiveImage.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowUpRightIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { gsap } from 'gsap'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import AsciiHoverBackground from '@/components/AsciiHoverBackground.vue'

const { t, locale } = useI18n()
const rootRef = ref(null)
const portraitStageRef = ref(null)
const portraitRef = ref(null)
const emailCopied = ref(false)
const copyFailed = ref(false)
const isCopying = ref(false)
let motionContext, media, feedbackTimer
let disposed = false

useHead({
  title: () => t('seo.home.title'),
  meta: [
    { name: 'description', content: () => t('seo.home.description') },
    { property: 'og:title', content: () => t('seo.home.title') },
    { property: 'og:description', content: () => t('seo.home.description') },
    { name: 'twitter:title', content: () => t('seo.home.title') },
    { name: 'twitter:description', content: () => t('seo.home.description') }
  ]
})

async function copyEmail() {
  if (isCopying.value) return
  isCopying.value = true
  emailCopied.value = false
  copyFailed.value = false
  clearTimeout(feedbackTimer)
  try {
    await navigator.clipboard.writeText('erenboluk.dev@gmail.com')
    if (disposed) return
    emailCopied.value = true
    feedbackTimer = window.setTimeout(() => { emailCopied.value = false }, 2000)
  } catch {
    if (!disposed) copyFailed.value = true
  } finally {
    if (!disposed) isCopying.value = false
  }
}

onMounted(() => {
  const root = rootRef.value
  const stage = portraitStageRef.value
  const portrait = portraitRef.value
  motionContext = gsap.context(() => {
    media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      pointer: '(hover: hover) and (pointer: fine)'
    }, ({ conditions }) => {
      if (!conditions.motion) return
      const entrance = gsap.fromTo(root.querySelectorAll('[data-hero-enter]'),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'opacity,transform' }
      )
      const finishEntrance = () => entrance.progress(1)
      root.addEventListener('focusin', finishEntrance)
      let cleanPointer = () => {}
      if (conditions.pointer) {
        let bounds
        const xTo = gsap.quickTo(portrait, 'x', { duration: 0.18, ease: 'power2.out' })
        const yTo = gsap.quickTo(portrait, 'y', { duration: 0.18, ease: 'power2.out' })
        const reset = () => { bounds = null; xTo(0); yTo(0) }
        const enter = event => {
          if (event.pointerType === 'mouse') bounds = stage.getBoundingClientRect()
        }
        const move = event => {
          if (event.pointerType !== 'mouse' || !bounds || document.hidden) return
          xTo(gsap.utils.clamp(-6, 6, ((event.clientX - bounds.left) / bounds.width - 0.5) * 12))
          yTo(gsap.utils.clamp(-6, 6, ((event.clientY - bounds.top) / bounds.height - 0.5) * 12))
        }
        const visibility = () => {
          if (document.hidden) {
            entrance.progress(1)
            bounds = null
            xTo.tween.pause()
            yTo.tween.pause()
            gsap.set(portrait, { x: 0, y: 0 })
          }
        }
        stage.addEventListener('pointerenter', enter, { passive: true })
        stage.addEventListener('pointermove', move, { passive: true })
        stage.addEventListener('pointerleave', reset, { passive: true })
        window.addEventListener('resize', reset, { passive: true })
        window.addEventListener('blur', reset)
        document.addEventListener('visibilitychange', visibility)
        cleanPointer = () => {
          stage.removeEventListener('pointerenter', enter)
          stage.removeEventListener('pointermove', move)
          stage.removeEventListener('pointerleave', reset)
          window.removeEventListener('resize', reset)
          window.removeEventListener('blur', reset)
          document.removeEventListener('visibilitychange', visibility)
          xTo.tween.kill()
          yTo.tween.kill()
        }
      }
      return () => {
        root.removeEventListener('focusin', finishEntrance)
        cleanPointer()
      }
    })
  }, root)
})

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(feedbackTimer)
  media?.revert()
  motionContext?.revert()
})
</script>

<template>
  <div class="home-page-wrapper">
    <AsciiHoverBackground
      full-width
      :font-size="15"
      :fluid="{ hoverRadiusPx: 24, densityDissipation: 1.4 }"
      :safe-area="{ enabled: true, selector: '.hero-name, .hero-kicker, .hero-role, .hero-introduction, .hero-actions .aura-button, .hero-feedback, .hero-portrait-frame, .hero-route-strip a', textSelector: '.hero-name, .hero-kicker, .hero-role, .hero-introduction, .hero-feedback, .hero-route-strip a', fadeSize: 10 }"
    />
    <main ref="rootRef" class="graphite-hero" aria-labelledby="home-title">
      <div class="hero-layout">
        <div class="hero-copy">
          <p class="hero-kicker" data-hero-enter>Eren Bölük · Web Developer</p>
          <h1 id="home-title" class="hero-name" data-hero-enter>Eren <span>Bölük<span class="hero-period" aria-hidden="true">.</span></span></h1><p class="hero-role" data-hero-enter>Web Developer</p>
          <div class="hero-introduction" data-hero-enter>
            <p>{{ t('home.about-text-1') }}</p>
            <p>{{ t('home.about-text-2') }}</p>
          </div>
          <div class="hero-actions aura-actions ascii-safe-area">
            <RouterLink id="hire-me-button" class="aura-button aura-button-primary" :to="{ name: 'hireme', params: { lang: locale } }">
              {{ t('home.hireme') }}<ArrowUpRightIcon class="size-5" aria-hidden="true" />
            </RouterLink>
            <button id="copy-email-button" type="button" class="aura-button hero-copy-button" :aria-busy="isCopying" @click="copyEmail">
              <CheckIcon v-if="emailCopied" class="size-5" aria-hidden="true" />
              <DocumentDuplicateIcon v-else class="size-5" aria-hidden="true" />
              <span>{{ emailCopied ? t('home.copied') : t('home.copy-email') }}</span>
            </button>
          </div>
          <div class="hero-feedback" role="status" aria-live="polite" aria-atomic="true">
            <p v-if="emailCopied">{{ t('home.email_copied') }}</p>
            <p v-else-if="copyFailed">{{ t('home.copy-error', { email: 'erenboluk.dev@gmail.com' }) }}</p>
          </div>
        </div>
        <div ref="portraitStageRef" class="hero-portrait-stage">
          <div class="hero-portrait-entrance" data-hero-enter>
            <figure ref="portraitRef" class="hero-portrait-frame">
              <ProgressiveImage src="https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/me-min.jpg" :alt="t('home.alt-profile')" :width="640" :height="640" aspect-ratio="1 / 1.12" eager fetchpriority="high" />
              <figcaption aria-hidden="true">Eren Bölük / Web Developer</figcaption>
            </figure>
          </div>
        </div>
      </div>
      <nav class="hero-route-strip" :aria-label="t('sidebar.navigation')">
        <RouterLink :to="{ name: 'about', params: { lang: locale } }"><span>{{ t('sidebar.about') }}<ArrowUpRightIcon aria-hidden="true" /></span><small>{{ t('home.section-about') }}</small></RouterLink>
        <RouterLink :to="{ name: 'portfolio', params: { lang: locale } }"><span>{{ t('sidebar.portfolio') }}<ArrowUpRightIcon aria-hidden="true" /></span><small>{{ t('home.section-portfolio') }}</small></RouterLink>
        <RouterLink :to="{ name: 'hireme', params: { lang: locale } }"><span>{{ t('sidebar.hireme') }}<ArrowUpRightIcon aria-hidden="true" /></span><small>{{ t('home.section-contact') }}</small></RouterLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.home-page-wrapper {
  position: relative;
  width: 100%;
}
.graphite-hero {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - var(--aura-header-space, 88px) - 48px);
  padding: clamp(24px, 3.5vw, 44px);
  color: var(--aura-text);
  isolation: isolate;
  background: transparent;
}
.hero-layout { position: relative; z-index: 1; display: grid; align-items: center; gap: 40px; padding-block: 38px 48px; }
.hero-copy { min-width: 0; }
.hero-kicker { margin: 0 0 28px; color: var(--aura-accent); font-size: 11px; font-weight: 500; letter-spacing: .17em; text-transform: uppercase; }
.hero-name { margin: 0 0 28px; font-size: clamp(3rem, 10vw, 3.625rem); font-weight: 600; line-height: .98; letter-spacing: -.065em; }
.hero-name > span { display: block; }
.hero-period { color: var(--aura-text); }
.hero-role { margin-bottom: 20px; font-size: 20px; line-height: 1.4; }
.hero-introduction { color: var(--aura-muted); max-width: 48ch; font-size: 16px; line-height: 1.8; }
.hero-introduction p + p { margin-top: 16px; }
.hero-actions { margin-top: 28px; }
.hero-actions .aura-button { min-height: 44px; padding: 11px 18px; font-size: 14px; text-decoration: none; }
.hero-copy-button { min-width: 142px; }
.hero-feedback { min-height: 32px; max-width: 48ch; padding-top: 12px; color: var(--aura-accent); font-size: 13px; line-height: 1.6; }
.hero-portrait-stage { position: relative; width: 100%; max-width: 220px; justify-self: start; }
.hero-portrait-stage::before { content: ''; position: absolute; inset: -30px; z-index: -1; border-radius: 50%; background: radial-gradient(ellipse, rgb(196 181 253 / .06), transparent 68%); pointer-events: none; }
.hero-portrait-frame { margin: 0; padding: 13px; background: var(--aura-canvas); border: 1px solid rgb(244 244 245 / .16); border-radius: 8px; }
.hero-portrait-frame .progressive-image { display: block; width: 100%; height: auto; aspect-ratio: 1 / 1.12; object-fit: cover; border-radius: 3px; filter: grayscale(30%); }
figcaption { margin-top: 12px; color: var(--aura-muted); font-size: 10px; line-height: 1.5; letter-spacing: .06em; text-transform: uppercase; }
.hero-route-strip { position: relative; z-index: 1; display: grid; gap: 0; border-top: 1px solid var(--aura-divider); }
.hero-route-strip a { display: block; padding-block: 20px; text-decoration: none; border-bottom: 1px solid var(--aura-divider); }
.hero-route-strip a > span { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; }
.hero-route-strip svg { width: 14px; height: 14px; color: var(--aura-muted); transition: transform 180ms ease, color 180ms ease; }
.hero-route-strip small { display: block; margin-top: 7px; color: var(--aura-muted); font-size: 12px; line-height: 1.6; }
.hero-route-strip a:hover svg { transform: translate(2px, -2px); color: var(--aura-accent); }
@media (min-width: 768px) {
  .hero-layout { padding-block: 56px 64px; }
  .hero-name { font-size: clamp(4.5rem, 6.5vw, 5.5rem); }
  .hero-route-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
  .hero-route-strip a { border-bottom: 0; padding-block: 24px 12px; }
}
@media (min-width: 1024px) {
  .hero-layout { grid-template-columns: 1.25fr 1fr; gap: 60px; padding-block: 64px 56px; }
  .hero-portrait-stage { max-width: 340px; justify-self: center; }
  .hero-introduction { max-width: 48ch; font-size: 15px; }
}
@media (max-width: 359px) { .hero-actions { flex-direction: column; align-items: stretch; } .hero-portrait-stage { max-width: 190px; } }
@media (prefers-reduced-motion: reduce) { .hero-portrait-frame, [data-hero-enter] { transform: none !important; opacity: 1 !important; } .hero-route-strip svg { transition: none; } }
</style>
