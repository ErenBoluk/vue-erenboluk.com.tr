<script setup>
import { ref, useId, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

const rootRef = ref(null)
const patternId = useId()
let context, media

onMounted(() => {
  const root = rootRef.value, frame = root.parentElement
  context = gsap.context(() => {
    media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: reduce)', () => {
      root.dataset.motion = 'reduced'
      gsap.set(root.querySelector('.contact-light'), {opacity:0})
    })
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let visible = false
      const light = root.querySelector('.contact-light')
      root.dataset.motion = 'idle'
      // A finite pass avoids an endlessly moving background while reading/typing.
      const timeline = gsap.timeline({paused:true,onStart:()=>{root.dataset.motion='playing'},onComplete:()=>{root.dataset.motion='idle'}})
        .fromTo(light,{xPercent:-6,yPercent:4,opacity:0},{xPercent:8,yPercent:-8,duration:4.2,ease:'sine.inOut'},0)
        .to(light,{opacity:.4,duration:1.1,ease:'sine.out'},0)
        .to(light,{opacity:0,duration:1.1,ease:'sine.in'},3.1)
      const finish = () => {timeline.progress(1).pause();root.dataset.motion='idle'}
      const play = () => {
        if(!visible || document.hidden || frame.contains(document.activeElement) || timeline.isActive())return
        timeline.restart()
      }
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting
        if(visible)play()
        else finish()
      },{threshold:.15})
      observer.observe(root)
      const visibility = () => {if(document.hidden)finish();else play()}
      frame.addEventListener('pointerenter',play,{passive:true})
      frame.addEventListener('focusin',finish)
      document.addEventListener('visibilitychange',visibility)
      return () => {
        observer.disconnect();timeline.kill()
        frame.removeEventListener('pointerenter',play)
        frame.removeEventListener('focusin',finish)
        document.removeEventListener('visibilitychange',visibility)
        gsap.set(light,{clearProps:'transform,opacity'})
      }
    })
  },root)
})
onBeforeUnmount(() => {media?.revert();context?.revert()})
</script>

<template>
  <div ref="rootRef" class="contact-atmosphere" data-contact-atmosphere data-motion="idle" aria-hidden="true">
    <div class="contact-light"></div>
    <svg class="contact-grid" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs><pattern :id="patternId" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M 56 0 H 0 V 56" fill="none" stroke="currentColor" stroke-opacity=".045" stroke-width="1"/><circle cx="1" cy="1" r="1" fill="currentColor" fill-opacity=".1"/></pattern></defs>
      <rect width="100%" height="100%" :fill="`url(#${patternId})`"/>
    </svg>
  </div>
</template>

<style scoped>
.contact-atmosphere { position:absolute; inset:0; z-index:-1; overflow:hidden; border-radius:inherit; color:var(--aura-accent); pointer-events:none; }
.contact-light { position:absolute; inset:-35%; opacity:0; background:radial-gradient(ellipse at 22% 28%,color-mix(in srgb,var(--aura-accent) 12%,transparent),transparent 48%),radial-gradient(ellipse at 82% 72%,color-mix(in srgb,var(--aura-accent) 6%,transparent),transparent 42%); }
.contact-grid { position:absolute; inset:0; display:block; }
@media (prefers-reduced-motion:reduce) { .contact-light { opacity:0 !important; } }
</style>
