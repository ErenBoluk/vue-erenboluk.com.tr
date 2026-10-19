import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

// Visible base content; only intersecting sections receive a one-time enhancement.
export function useEditorialMotion(rootRef) {
  let media, observer, active = false
  let seen = new WeakSet()
  const pending = new Map()
  const observed = new Set()
  const refresh = () => {
    if (!active || !observer) return
    observed.forEach(element => {
      if (!rootRef.value?.contains(element)) { observer.unobserve(element); observed.delete(element) }
    })
    pending.forEach((tween, element) => {
      if (!rootRef.value?.contains(element)) { tween.revert(); pending.delete(element) }
    })
    rootRef.value?.querySelectorAll('[data-aura-reveal]').forEach(element => {
      if (!seen.has(element)) { observer.observe(element); observed.add(element) }
    })
  }
  onMounted(() => {
    const root = rootRef.value
    media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      active = true
      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting || seen.has(target)) return
          seen.add(target)
          observer.unobserve(target)
          observed.delete(target)
          const tween = gsap.fromTo(target, { y: 12, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform',
            onComplete: () => pending.delete(target)
          })
          pending.set(target, tween)
        })
      }, { root: root.closest('[data-aura-scroll]'), threshold: 0.1 })
      const finishFocused = event => {
        const target = event.target.closest('[data-aura-reveal]')
        if (!target || !root.contains(target)) return
        seen.add(target)
        observer.unobserve(target)
        pending.get(target)?.progress(1)
      }
      const finishHidden = () => { if (document.hidden) [...pending.values()].forEach(tween => tween.progress(1)) }
      root.addEventListener('focusin', finishFocused)
      document.addEventListener('visibilitychange', finishHidden)
      refresh()
      return () => {
        active = false
        observer.disconnect()
        pending.forEach(tween => tween.revert())
        pending.clear()
        observed.clear()
        seen = new WeakSet()
        root.removeEventListener('focusin', finishFocused)
        document.removeEventListener('visibilitychange', finishHidden)
      }
    })
  })
  onBeforeUnmount(() => media?.revert())
  return { refresh }
}
