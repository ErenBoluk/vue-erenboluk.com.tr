<script setup>
import ProgressiveImage from '@/components/ProgressiveImage.vue'
import { trapDialogFocus } from '@/utils/dialogFocus'
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEditorialMotion } from '@/composables/useEditorialMotion'
import { useHead } from '@unhead/vue'

import {
  CommandLineIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
  QueueListIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const { t, tm } = useI18n()

// Page Meta & SEO
useHead({
  title: () => t('seo.portfolio.title'),
  meta: [
    { name: 'description', content: () => t('seo.portfolio.description') },
    { property: 'og:title', content: () => t('seo.portfolio.title') },
    { property: 'og:description', content: () => t('seo.portfolio.description') },
    { name: 'twitter:title', content: () => t('seo.portfolio.title') },
    { name: 'twitter:description', content: () => t('seo.portfolio.description') }
  ]
})

// UI State
const activeCategory = ref('all')
const viewMode = ref('list') // 'list' | 'showcase'
const scrollProgress = ref(0)
const scrollContainerRef = ref(null)
const headerRef = ref(null)
const activeModalProject = ref(null)

// Raw Projects Metadata
const rawProjects = [
  {
    id: 1,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/teknosa.png',
    icon: ShieldCheckIcon,
    tags: ['Backend', 'Security', 'File Transfer'],
    category: 'backend'
  },
  {
    id: 2,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/manas.png',
    icon: ChartBarIcon,
    tags: ['BI Tool', 'Paywall Management', 'Web'],
    category: 'web'
  },
  {
    id: 3,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/gappze.png',
    icon: ChartBarIcon,
    tags: ['Analytics', 'Dashboard', 'Vue.js'],
    category: 'web'
  },
  {
    id: 4,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/ardraw.png',
    icon: DevicePhoneMobileIcon,
    tags: ['iOS', 'Admin Panel', 'REST API'],
    category: 'mobile',
    url: 'https://apps.apple.com/us/app/ar-drawing-draw-projector-app/id6473737662'
  },
  {
    id: 5,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/speedometer.png',
    icon: DevicePhoneMobileIcon,
    tags: ['Swift', 'iOS', 'GPS Telemetry'],
    category: 'mobile',
    url: 'https://apps.apple.com/us/app/speedometer-gps-tracker-mph/id6478858110'
  },
  {
    id: 6,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/fortunely.png',
    icon: CommandLineIcon,
    tags: ['Backend', 'Node.js', 'Scalable'],
    category: 'backend'
  },
  {
    id: 7,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/temsa.png',
    icon: GlobeAltIcon,
    tags: ['Enterprise', 'Transfer Tool', 'Encryption'],
    category: 'backend'
  },
  {
    id: 8,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/pokemon.png',
    icon: CommandLineIcon,
    tags: ['Node.js', 'Fastify', 'Redis', 'Architecture'],
    category: 'backend'
  },
  {
    id: 9,
    img: 'https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/img/hepapp.png',
    icon: CommandLineIcon,
    tags: ['Koa.js', 'Prisma ORM', 'MySQL', 'Docker'],
    category: 'backend'
  }
]

// Computed Projects with localized title, desc & guaranteed array highlights
const projects = computed(() => {
  return rawProjects.map((p, idx) => {
    const hlList = tm(`portfolio.projects.${idx}.highlights`)
    return {
      ...p,
      title: t(`portfolio.projects.${idx}.title`),
      desc: t(`portfolio.projects.${idx}.desc`),
      highlights: Array.isArray(hlList) ? hlList : []
    }
  })
})

// Filtered projects
const filteredProjects = computed(() => {
  if (activeCategory.value === 'all') return projects.value
  return projects.value.filter(p => p.category === activeCategory.value)
})

// Category tab config with counts
const categories = computed(() => [
  { key: 'all', label: t('portfolio.filters.all'), count: projects.value.length },
  { key: 'backend', label: t('portfolio.filters.backend'), count: projects.value.filter(p => p.category === 'backend').length },
  { key: 'mobile', label: t('portfolio.filters.mobile'), count: projects.value.filter(p => p.category === 'mobile').length },
  { key: 'web', label: t('portfolio.filters.web'), count: projects.value.filter(p => p.category === 'web').length }
])

const rootRef = ref(null)
const projectDialog = ref(null)
const dialogTitle = `project-title-${useId()}`
const motion = useEditorialMotion(rootRef)
let returnTarget, resizeObserver, disposed = false
function setCategory(catKey) { activeCategory.value = catKey }
function updateScrollProgress() {
  const container = scrollContainerRef.value
  if (!container) return
  const max = container.scrollWidth - container.clientWidth
  scrollProgress.value = max <= 0 ? 100 : Math.min(100, Math.round(Math.max(0, container.scrollLeft) / max * 100))
}
function onScroll() { updateScrollProgress() }
function scrollHorizontal(direction) {
  const container = scrollContainerRef.value
  if (!container) return
  container.scrollBy({ left: container.clientWidth * 0.75 * (direction === 'right' ? 1 : -1), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
async function openModal(project, event) {
  returnTarget = event.currentTarget
  activeModalProject.value = project
  await nextTick()
  if (!disposed && projectDialog.value && !projectDialog.value.open) projectDialog.value.showModal()
}
function closeModal() {
  projectDialog.value?.close()
  activeModalProject.value = null
  const target = returnTarget
  nextTick(() => { if (!disposed) (target?.isConnected ? target : headerRef.value)?.focus({ preventScroll: true }) })
}
watch([viewMode, activeCategory], async () => {
  if (activeModalProject.value) closeModal()
  await nextTick()
  if (!disposed) { updateScrollProgress(); motion.refresh() }
})
watch(projects, list => {
  if (activeModalProject.value) activeModalProject.value = list.find(project => project.id === activeModalProject.value.id) || null
})
onMounted(() => {
  resizeObserver = new ResizeObserver(updateScrollProgress)
  resizeObserver.observe(rootRef.value)
  updateScrollProgress()
})
onBeforeUnmount(() => { disposed = true; projectDialog.value?.close(); resizeObserver?.disconnect() })
</script>
<template>
  <main ref="rootRef" class="editorial-page portfolio" aria-labelledby="portfolio-heading">
    <header class="editorial-header portfolio-header" data-aura-reveal>
      <div><p class="editorial-kicker">02 / {{ t('portfolio.title') }}</p><h1 id="portfolio-heading" ref="headerRef" class="editorial-title portfolio-title" tabindex="-1"><span>{{ t('portfolio.headline_1') }}</span><span>{{ t('portfolio.headline_2') }}.</span></h1><p class="editorial-lead">{{ t('portfolio.subtitle') }}</p></div>
      <div class="view-switch" role="group" :aria-label="t('portfolio.title')"><button type="button" :aria-pressed="viewMode === 'list'" @click="viewMode = 'list'"><QueueListIcon aria-hidden="true" />{{ t('portfolio.view_modes.list') }}</button><button type="button" :aria-pressed="viewMode === 'showcase'" @click="viewMode = 'showcase'"><ViewColumnsIcon aria-hidden="true" />{{ t('portfolio.view_modes.showcase') }}</button></div>
    </header>
    <div class="portfolio-toolbar">
      <div class="project-filters" role="group" :aria-label="t('portfolio.title')"><button v-for="category in categories" :key="category.key" type="button" :aria-pressed="activeCategory === category.key" @click="setCategory(category.key)"><span>{{ category.label }}</span><span class="filter-count">{{ category.count }}</span></button></div>
      <div v-if="viewMode === 'showcase'" class="showcase-controls"><button type="button" class="aura-button icon-button" :aria-label="t('portfolio.previous')" :disabled="scrollProgress <= 2" @click="scrollHorizontal('left')"><ChevronLeftIcon aria-hidden="true" /></button><button type="button" class="aura-button icon-button" :aria-label="t('portfolio.next')" :disabled="scrollProgress >= 98" @click="scrollHorizontal('right')"><ChevronRightIcon aria-hidden="true" /></button></div>
    </div>
    <div ref="scrollContainerRef" class="project-collection" :class="{ 'project-showcase': viewMode === 'showcase' }" @scroll.passive="onScroll">
      <article v-for="(project, index) in filteredProjects" :key="project.id" class="project-card" data-aura-reveal>
        <div class="project-image"><ProgressiveImage :src="project.img" :alt="project.title" :width="640" :height="400" /></div>
        <div class="project-copy">
          <div class="project-topline"><span class="editorial-index">{{ String(index + 1).padStart(2, '0') }}</span><span class="editorial-label">{{ t(`portfolio.filters.${project.category}`) }}</span><component :is="project.icon" aria-hidden="true" /></div>
          <h2>{{ project.title }}</h2><p class="project-description">{{ project.desc }}</p>
          <div class="editorial-tags"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div>
          <ul v-if="project.highlights.length" class="project-highlights"><li v-for="highlight in project.highlights" :key="highlight">{{ highlight }}</li></ul>
          <div class="project-actions"><button type="button" class="editorial-text-link" :aria-label="`${t('portfolio.view_details')}: ${project.title}`" @click="openModal(project, $event)">{{ t('portfolio.view_details') }}<ArrowUpRightIcon aria-hidden="true" /></button><a v-if="project.url" class="editorial-text-link" :href="project.url" target="_blank" rel="noopener noreferrer">{{ t('portfolio.visit') }}<ArrowUpRightIcon aria-hidden="true" /></a><span v-else class="editorial-meta">{{ t('portfolio.internal_tool') }}</span></div>
        </div>
      </article>
    </div>
    <div v-if="viewMode === 'showcase'" class="showcase-progress" role="progressbar" :aria-label="t('portfolio.view_modes.showcase')" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="scrollProgress"><span :style="{ transform: `scaleX(${scrollProgress / 100})` }"></span></div>
    <Teleport to="body"><dialog ref="projectDialog" class="project-dialog" :aria-labelledby="dialogTitle" @keydown="trapDialogFocus" @cancel.prevent="closeModal" @click="event => { if (event.target === projectDialog) closeModal() }"><article v-if="activeModalProject">
      <header class="dialog-heading"><span class="editorial-kicker">{{ t('portfolio.modal.title') }}</span><button type="button" class="aura-button icon-button" :aria-label="t('portfolio.modal.close')" autofocus @click="closeModal"><XMarkIcon aria-hidden="true" /></button></header>
      <ProgressiveImage class="dialog-image" :src="activeModalProject.img" :alt="activeModalProject.title" :width="640" :height="400" fit="contain" eager />
      <div class="dialog-copy"><h2 :id="dialogTitle">{{ activeModalProject.title }}</h2><p>{{ activeModalProject.desc }}</p><h3>{{ t('portfolio.modal.tech_stack') }}</h3><div class="editorial-tags"><span v-for="tag in activeModalProject.tags" :key="tag">{{ tag }}</span></div><h3 v-if="activeModalProject.highlights.length">{{ t('portfolio.modal.highlights') }}</h3><ul class="project-highlights"><li v-for="highlight in activeModalProject.highlights" :key="highlight">{{ highlight }}</li></ul><a v-if="activeModalProject.url" class="aura-button aura-button-primary" :href="activeModalProject.url" target="_blank" rel="noopener noreferrer">{{ t('portfolio.visit') }}<ArrowUpRightIcon class="size-4" aria-hidden="true" /></a><p v-else class="editorial-meta">{{ t('portfolio.internal_tool') }}</p></div>
    </article></dialog></Teleport>
  </main>
</template>
<style scoped>
.portfolio-header { display: grid; gap: 32px; align-items: end; }
.portfolio-title > span { display: block; }
.view-switch { display: flex; flex-wrap: wrap; gap: 8px; }
.view-switch button { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 12px; border: 1px solid var(--aura-divider); border-radius: 6px; color: var(--aura-muted); font-size: 12px; cursor: pointer; }
.view-switch button[aria-pressed="true"] { color: var(--aura-accent); border-color: var(--aura-border); background: var(--aura-surface); }
.view-switch svg { width: 16px; height: 16px; }
.portfolio-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 24px; align-items: center; margin-bottom: 32px; }
.project-filters { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.project-filters button { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding-block: 8px; color: var(--aura-muted); border-bottom: 1px solid transparent; font-size: 13px; cursor: pointer; }
.project-filters button[aria-pressed="true"] { color: var(--aura-accent); border-bottom-color: var(--aura-accent); }
.filter-count { font-size: 11px; font-family: ui-monospace, monospace; color: var(--aura-muted); }
.showcase-controls { display: flex; gap: 8px; }
.icon-button { padding: 10px; flex-shrink: 0; }
.icon-button svg { width: 20px; height: 20px; }
.project-card { display: grid; align-items: start; gap: 28px; padding-block: 36px; border-top: 1px solid var(--aura-divider); min-width: 0; }
.project-image { background: var(--aura-surface); padding: 8px; border: 1px solid var(--aura-divider); border-radius: 8px; overflow: hidden; }
.project-image .progressive-image { display: block; width: 100%; height: auto; aspect-ratio: 1.6; object-fit: cover; border-radius: 3px; }
.project-copy { min-width: 0; }
.project-topline { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
.project-topline > svg { width: 17px; height: 17px; color: var(--aura-muted); margin-left: auto; }
.project-copy h2 { font-size: clamp(1.5rem, 2.5vw, 2rem); line-height: 1.2; letter-spacing: -.035em; font-weight: 500; }
.project-description { font-size: 15px; line-height: 1.85; color: var(--aura-muted); margin-block: 16px 20px; max-width: 70ch; }
.project-highlights { padding-left: 18px; list-style: disc; color: var(--aura-muted); font-size: 13px; line-height: 1.8; margin-block: 20px; }
.project-highlights li + li { margin-top: 6px; }
.project-highlights li::marker { color: var(--aura-accent); }
.project-actions { display: flex; align-items: center; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px; margin-top: 20px; border-top: 1px solid var(--aura-divider); padding-top: 12px; }
.project-showcase { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 20px; scrollbar-width: thin; scrollbar-color: var(--aura-border) var(--aura-canvas); }
.project-showcase .project-card { display: flex; flex-direction: column; flex: 0 0 min(640px, 88%); scroll-snap-align: start; border: 1px solid var(--aura-divider); border-radius: 8px; padding: 16px; gap: 24px; background: var(--aura-surface); }
.project-showcase .project-image { width: 100%; padding: 0; border: 0; }
.project-showcase .project-copy { display: flex; flex-direction: column; flex: 1; width: 100%; }
.project-showcase .project-actions { margin-top: auto; }
.showcase-progress { height: 2px; background: var(--aura-divider); margin-block: 24px; overflow: hidden; }
.showcase-progress span { display: block; width: 100%; height: 100%; background: var(--aura-accent); transform-origin: left center; }
.project-dialog { margin: auto; padding: 0; width: min(760px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow-y: auto; color: var(--aura-text); background: var(--aura-surface); border: 1px solid var(--aura-border); border-radius: 8px; }
.project-dialog::backdrop { background: rgb(0 0 0 / .75); }
.dialog-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 20px 24px; }
.dialog-heading .editorial-kicker { margin: 0; }
.dialog-image { display: block; width: 100%; max-height: 320px; object-fit: contain; background: var(--aura-canvas); }
.dialog-copy { padding: 24px; }
.dialog-copy h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); line-height: 1.15; letter-spacing: -.04em; font-weight: 500; }
.dialog-copy > p { color: var(--aura-muted); font-size: 15px; line-height: 1.85; margin-top: 20px; }
.dialog-copy h3 { font-size: 14px; font-weight: 500; margin-block: 28px 12px; }
@media (min-width: 768px) { .project-card { grid-template-columns: 220px minmax(0, 1fr); gap: 40px; padding-block: 40px; } .dialog-copy { padding: 32px; } }
@media (min-width: 1024px) { .portfolio-header { grid-template-columns: minmax(0, 1fr) auto; } .project-card { grid-template-columns: 280px minmax(0, 1fr); gap: 64px; } }
</style>
