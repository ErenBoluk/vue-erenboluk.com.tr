<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
const ringRef = ref(null)
let media
onMounted(() => {
  const ring = ringRef.value
  media = gsap.matchMedia()
  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    let shown = false
    const xTo = gsap.quickTo(ring, 'x', { duration: 0.16, ease: 'power2.out' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.16, ease: 'power2.out' })
    const hide = () => { shown = false; xTo.tween.pause(); yTo.tween.pause(); gsap.set(ring, { opacity: 0 }) }
    const move = event => {
      if (event.pointerType !== 'mouse') return
      if (document.hidden || document.querySelector('dialog[open]') || event.target.closest('input,textarea,select,[contenteditable="true"]')) return hide()
      if (!shown) { gsap.set(ring, { x: event.clientX, y: event.clientY, opacity: 1 }); shown = true }
      else { xTo(event.clientX); yTo(event.clientY) }
    }
    const visibility = () => { if (document.hidden) hide() }
    const dialogs = new MutationObserver(() => { if (document.querySelector('dialog[open]')) hide() })
    dialogs.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true })
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', hide)
    document.addEventListener('keydown', hide, true)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', hide)
    return () => {
      dialogs.disconnect()
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', hide)
      document.removeEventListener('keydown', hide, true)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('blur', hide)
      xTo.tween.kill(); yTo.tween.kill()
      gsap.set(ring, { clearProps: 'all' })
    }
  })
})
onBeforeUnmount(() => media?.revert())
</script>
<template><div class="cursor-container" aria-hidden="true"><div ref="ringRef" data-aura-cursor class="cursor-outline"></div></div></template>
<style scoped>
.cursor-container { position: fixed; inset: 0; z-index: 10000; pointer-events: none; overflow: hidden; }
.cursor-outline { position: absolute; left: -12px; top: -12px; width: 24px; height: 24px; border: 1px solid rgb(196 181 253 / .45); border-radius: 50%; opacity: 0; pointer-events: none; }
@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) { .cursor-outline { display: none; } }
</style>
