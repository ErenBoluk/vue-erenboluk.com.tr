<template>
  <main class="portfolio min-h-screen p-4 sm:p-6 md:p-12 relative overflow-x-hidden isolate">
    <!-- Ambient Floating Orbs Background -->
    <BackgroundOrbs />

    <div class="max-w-[1440px] mx-auto relative z-10 space-y-8 md:space-y-12">
      <!-- Header Section -->
      <header ref="headerRef" class="header-section space-y-6">
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
          </span>
          <span class="text-[11px] font-bold text-purple-300 uppercase tracking-[0.25em]">
            {{ $t('portfolio.title') }}
          </span>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div class="space-y-3 max-w-3xl">
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              {{ $t('portfolio.headline_1') }}
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500 bg-[length:200%_auto] animate-gradient">
                {{ $t('portfolio.headline_2') }}
              </span>
            </h1>
            <p class="text-neutral-400 text-base md:text-lg font-light leading-relaxed">
              {{ $t('portfolio.subtitle') }}
            </p>
          </div>

          <!-- Controls Toolbar: View Modes & Scroll Navigation -->
          <div class="flex items-center gap-3 self-start lg:self-end">
            <!-- View Mode Switcher -->
            <div class="flex items-center p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl">
              <button
                @click="viewMode = 'list'"
                :class="[
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer',
                  viewMode === 'list' 
                    ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                ]"
                :title="$t('portfolio.view_modes.list')"
              >
                <QueueListIcon class="w-4 h-4 text-purple-400" />
                <span class="hidden sm:inline">{{ $t('portfolio.view_modes.list') }}</span>
              </button>

              <button
                @click="viewMode = 'showcase'"
                :class="[
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer',
                  viewMode === 'showcase' 
                    ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                ]"
                :title="$t('portfolio.view_modes.showcase')"
              >
                <ViewColumnsIcon class="w-4 h-4 text-purple-400" />
                <span class="hidden sm:inline">{{ $t('portfolio.view_modes.showcase') }}</span>
              </button>
            </div>

            <!-- Horizontal Scroll Arrow Controls (Showcase Mode Only) -->
            <div v-if="viewMode === 'showcase'" class="hidden md:flex items-center gap-2">
              <button
                @click="scrollHorizontal('left')"
                class="p-2.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl text-neutral-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                :disabled="scrollProgress <= 2"
                aria-label="Previous Project"
              >
                <ChevronLeftIcon class="w-5 h-5" />
              </button>

              <button
                @click="scrollHorizontal('right')"
                class="p-2.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl text-neutral-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer disabled:opacity-98 disabled:cursor-not-allowed"
                :disabled="scrollProgress >= 98"
                aria-label="Next Project"
              >
                <ChevronRightIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="setCategory(cat.key)"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2',
              activeCategory === cat.key
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/30'
                : 'bg-neutral-900/40 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/5'
            ]"
          >
            <span>{{ cat.label }}</span>
            <span 
              :class="[
                'text-[10px] px-2 py-0.5 rounded-full font-mono',
                activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-500'
              ]"
            >
              {{ cat.count }}
            </span>
          </button>
        </div>
      </header>

      <!-- Mode 1: Showcase View (Horizontal Slider Carousel) -->
      <div v-if="viewMode === 'showcase'" class="space-y-6">
        <div
          ref="scrollContainerRef"
          @scroll="onScroll"
          class="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none no-scrollbar cursor-grab active:cursor-grabbing items-stretch"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <article
            v-for="(project, index) in filteredProjects"
            :key="project.id"
            class="project-card snap-start shrink-0 w-[88vw] sm:w-[540px] md:w-[640px] lg:w-[720px] group relative bg-neutral-900/70 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.3)] flex flex-col md:flex-row items-stretch"
          >
            <!-- Visual Preview Image Area -->
            <div class="relative w-full md:w-5/12 min-h-[200px] md:min-h-[260px] overflow-hidden bg-neutral-950 shrink-0">
              <img
                :src="project.img"
                :alt="project.title"
                class="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-neutral-950/90"></div>

              <!-- Index Badge -->
              <div class="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-white/10">
                <span class="text-xs font-mono font-bold text-purple-400">
                  0{{ index + 1 }}
                </span>
              </div>

              <!-- Floating Icon Badge -->
              <div class="absolute top-3 right-3 p-2.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/10 text-purple-400 group-hover:text-white transition-colors">
                <component :is="project.icon" class="w-4 h-4" />
              </div>
            </div>

            <!-- Content Area -->
            <div class="w-full md:w-7/12 p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div class="space-y-3">
                <!-- Tech Tags -->
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in project.tags"
                    :key="tag"
                    class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/5 text-purple-300 border border-white/10"
                  >
                    {{ tag }}
                  </span>
                </div>

                <h3 class="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                  {{ project.title }}
                </h3>

                <p class="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                  {{ project.desc }}
                </p>
              </div>

              <!-- Highlight Bullets -->
              <ul v-if="project.highlights && project.highlights.length" class="space-y-1.5 py-2 border-t border-b border-white/5">
                <li
                  v-for="(hl, i) in project.highlights"
                  :key="i"
                  class="flex items-center gap-2 text-xs text-neutral-300 font-light"
                >
                  <SparklesIcon class="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span class="line-clamp-1">{{ hl }}</span>
                </li>
              </ul>

              <!-- Footer Actions -->
              <div class="pt-1 flex items-center justify-between gap-2">
                <button
                  @click="openModal(project)"
                  class="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-all cursor-pointer group/modalBtn"
                >
                  <span>{{ $t('portfolio.view_details') }}</span>
                  <span class="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center group-hover/modalBtn:bg-purple-500/30 transition-colors text-[10px]">
                    &rarr;
                  </span>
                </button>

                <a
                  v-if="project.url"
                  :href="project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 transition-all duration-300 text-xs font-bold group/link"
                >
                  <span>{{ $t('portfolio.visit') }}</span>
                  <ArrowUpRightIcon class="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>

                <div v-else class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                  <span class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-500 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-500"></span>
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {{ $t('portfolio.internal_tool') }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Scroll Progress Bar -->
        <div class="flex items-center justify-between gap-4 max-w-md mx-auto pt-2 px-4">
          <span class="text-xs font-mono text-neutral-500">01</span>
          <div class="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
            <div
              class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
              :style="{ width: `${scrollProgress}%` }"
            ></div>
          </div>
          <span class="text-xs font-mono text-neutral-500">0{{ filteredProjects.length }}</span>
        </div>
      </div>

      <!-- Mode 2: List View (Stacked Horizontal Rows) -->
      <div v-else class="space-y-5">
        <article
          v-for="(project, index) in filteredProjects"
          :key="project.id"
          class="project-card group relative bg-neutral-900/70 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 flex flex-col md:flex-row items-stretch"
        >
          <!-- Visual Image Area -->
          <div class="relative w-full md:w-4/12 min-h-[180px] md:min-h-[220px] overflow-hidden bg-neutral-950 shrink-0">
            <img
              :src="project.img"
              :alt="project.title"
              class="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-neutral-950/90"></div>

            <div class="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-white/10">
              <span class="text-xs font-mono font-bold text-purple-400">
                0{{ index + 1 }}
              </span>
            </div>

            <div class="absolute top-3 right-3 p-2.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/10 text-purple-400 group-hover:text-white transition-colors">
              <component :is="project.icon" class="w-4 h-4" />
            </div>
          </div>

          <!-- Content Info Area -->
          <div class="w-full md:w-8/12 p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in project.tags"
                    :key="tag"
                    class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/5 text-purple-300 border border-white/10"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div v-if="!project.url" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                  <span class="relative flex h-1.5 w-1.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-500 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-500"></span>
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {{ $t('portfolio.internal_tool') }}
                  </span>
                </div>
              </div>

              <h3 class="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {{ project.title }}
              </h3>

              <p class="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
                {{ project.desc }}
              </p>
            </div>

            <!-- Bullet Highlights & Action Buttons -->
            <div class="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <ul v-if="project.highlights && project.highlights.length" class="flex flex-wrap gap-x-4 gap-y-1">
                <li
                  v-for="(hl, i) in project.highlights"
                  :key="i"
                  class="flex items-center gap-1.5 text-xs text-neutral-300 font-light"
                >
                  <SparklesIcon class="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{{ hl }}</span>
                </li>
              </ul>

              <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <button
                  @click="openModal(project)"
                  class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-xs font-bold cursor-pointer"
                >
                  {{ $t('portfolio.view_details') }}
                </button>

                <a
                  v-if="project.url"
                  :href="project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 transition-all text-xs font-bold group/link"
                >
                  <span>{{ $t('portfolio.visit') }}</span>
                  <ArrowUpRightIcon class="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Project Details Modal Popover -->
    <Transition name="modal-fade">
      <div
        v-if="activeModalProject"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-xl overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="relative w-full max-w-2xl bg-neutral-900/90 border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.3)] my-6">
          <!-- Modal Banner Image -->
          <div class="relative h-56 sm:h-72 w-full overflow-hidden bg-neutral-950">
            <img
              :src="activeModalProject.img"
              :alt="activeModalProject.title"
              class="w-full h-full object-cover object-center"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent"></div>

            <button
              @click="closeModal"
              class="absolute top-4 right-4 p-2 rounded-full bg-neutral-950/80 border border-white/10 text-neutral-300 hover:text-white hover:bg-purple-600/40 hover:border-purple-500/50 transition-all cursor-pointer z-10"
              :aria-label="$t('portfolio.modal.close')"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6 sm:p-8 space-y-5">
            <div class="space-y-2.5">
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in activeModalProject.tags"
                  :key="tag"
                  class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30"
                >
                  {{ tag }}
                </span>
              </div>

              <h2 class="text-2xl sm:text-3xl font-bold text-white">
                {{ activeModalProject.title }}
              </h2>

              <p class="text-neutral-300 text-sm leading-relaxed font-light">
                {{ activeModalProject.desc }}
              </p>
            </div>

            <!-- Highlights list in modal -->
            <div v-if="activeModalProject.highlights && activeModalProject.highlights.length" class="space-y-2.5 pt-3 border-t border-white/10">
              <h4 class="text-xs font-bold uppercase tracking-widest text-purple-400">
                {{ $t('portfolio.modal.highlights') }}
              </h4>
              <ul class="space-y-2">
                <li
                  v-for="(hl, i) in activeModalProject.highlights"
                  :key="i"
                  class="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200"
                >
                  <SparklesIcon class="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{{ hl }}</span>
                </li>
              </ul>
            </div>

            <!-- Modal Footer Actions -->
            <div class="pt-5 border-t border-white/10 flex items-center justify-between">
              <a
                v-if="activeModalProject.url"
                :href="activeModalProject.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform"
              >
                <span>{{ $t('portfolio.visit') }}</span>
                <ArrowUpRightIcon class="w-4 h-4" />
              </a>

              <div v-else class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span class="relative flex h-1.5 w-1.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-500 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-500"></span>
                </span>
                <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {{ $t('portfolio.internal_tool') }}
                </span>
              </div>

              <button
                @click="closeModal"
                class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors text-xs font-semibold cursor-pointer"
              >
                {{ $t('portfolio.modal.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { useHead } from '@unhead/vue'
import BackgroundOrbs from '@/components/BackgroundOrbs.vue'
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

const { t, locale } = useI18n()

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

// Raw Projects Data with explicit structured highlights arrays per language
const rawProjects = [
  {
    id: 1,
    img: '/assets/img/portfolio/teknosa.png',
    icon: ShieldCheckIcon,
    tags: ['Backend', 'Security', 'File Transfer'],
    category: 'backend',
    highlights: {
      tr: [
        'Sıfır 3. taraf bağımlılığı ile tam veri gizliliği',
        'Yüksek boyutlu kurumsal dosya aktarım mimarisi',
        'Gelişmiş yetkilendirme ve log denetimi'
      ],
      en: [
        'Zero 3rd-party dependency for complete privacy',
        'High-capacity enterprise file transfer architecture',
        'Advanced authorization and detailed audit logging'
      ]
    }
  },
  {
    id: 2,
    img: '/assets/img/portfolio/manas.png',
    icon: ChartBarIcon,
    tags: ['BI Tool', 'Paywall Management', 'Web'],
    category: 'web',
    highlights: {
      tr: [
        'Dinamik Paywall & abonelik yönetimi',
        'Gerçek zamanlı gelir ve kullanıcı analitiği',
        'Kapsamlı rol tabanlı yetki kontrolü'
      ],
      en: [
        'Dynamic Paywall & subscription management',
        'Real-time revenue and user behavior analytics',
        'Comprehensive role-based access control (RBAC)'
      ]
    }
  },
  {
    id: 3,
    img: '/assets/img/portfolio/gappze.png',
    icon: ChartBarIcon,
    tags: ['Analytics', 'Dashboard', 'Vue.js'],
    category: 'web',
    highlights: {
      tr: [
        'Vue.js tabanlı yüksek hızlı reaktif arayüz',
        'Uygulama bazlı detaylı raporlama ve grafikler',
        'Ödeme duvarı A/B test yapılandırması'
      ],
      en: [
        'Vue.js powered ultra-responsive UI dashboard',
        'App-level detailed metrics and visual charts',
        'Paywall A/B testing & configuration panel'
      ]
    }
  },
  {
    id: 4,
    img: '/assets/img/portfolio/ardraw.png',
    icon: DevicePhoneMobileIcon,
    tags: ['iOS', 'Admin Panel', 'REST API'],
    category: 'mobile',
    highlights: {
      tr: [
        'iOS istemcisi için düşük gecikmeli API mimarisi',
        'Çizim şablonları ve içerik dağıtım yönetimi',
        'Kullanıcı etkileşimi analitik altyapısı'
      ],
      en: [
        'Low-latency API architecture for mobile clients',
        'Drawing templates and content distribution suite',
        'User engagement analytics infrastructure'
      ]
    }
  },
  {
    id: 5,
    img: '/assets/img/portfolio/speedometer.png',
    icon: DevicePhoneMobileIcon,
    tags: ['Swift', 'iOS', 'GPS Telemetry'],
    category: 'mobile',
    url: 'https://apps.apple.com/us/app/speedometer-gps-tracker-mph/id6478858110',
    highlights: {
      tr: [
        'Swift & Native iOS mimarisi ile maksimum performans',
        'Gerçek zamanlı GPS konum ve hız takibi',
        'Özel arayüz ve kullanıcı dostu HUD göstergesi'
      ],
      en: [
        'Swift & Native iOS architecture for maximum performance',
        'Real-time GPS location tracking & speed telemetry',
        'Custom dashboard interface and HUD display mode'
      ]
    }
  },
  {
    id: 6,
    img: '/assets/img/portfolio/fortunely.png',
    icon: CommandLineIcon,
    tags: ['Backend', 'Node.js', 'Scalable'],
    category: 'backend',
    url: 'https://apps.apple.com/us/app/ar-drawing-draw-projector-app/id6473737662',
    highlights: {
      tr: [
        'Yüksek eşzamanlı istek kapasiteli Node.js altyapısı',
        'Güvenli ve ölçeklenebilir veritabanı mimarisi',
        'Otomatik bildirim ve içerik dağıtım servisleri'
      ],
      en: [
        'High-concurrency Node.js backend architecture',
        'Secure and scalable database infrastructure',
        'Automated push notifications & content scheduling'
      ]
    }
  },
  {
    id: 7,
    img: '/assets/img/portfolio/temsa.png',
    icon: GlobeAltIcon,
    tags: ['Enterprise', 'Transfer Tool', 'Encryption'],
    category: 'backend',
    highlights: {
      tr: [
        'Uçtan uca şifreli güvenli dosya iletimi',
        'Kurumsal sunucu entegrasyonu ve izlenebilirlik',
        'Ağ optimizasyonlu hızlı aktarım protokolü'
      ],
      en: [
        'End-to-end encrypted secure file transmission',
        'Enterprise server integration & audit traceability',
        'Network-optimized high-speed transfer protocol'
      ]
    }
  }
]

// Computed Projects with localized title, desc & guaranteed array highlights
const projects = computed(() => {
  const currentLang = locale.value === 'tr' ? 'tr' : 'en'
  return rawProjects.map((p, idx) => {
    const hlList = p.highlights && p.highlights[currentLang] ? p.highlights[currentLang] : []
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

// Category filter handler with GSAP stagger animation
const setCategory = (catKey) => {
  activeCategory.value = catKey
  nextTick(() => {
    animateCardsReveal()
    updateScrollProgress()
  })
}

// Scroll progress handler
const onScroll = () => {
  updateScrollProgress()
}

const updateScrollProgress = () => {
  const container = scrollContainerRef.value
  if (!container) return
  const maxScroll = container.scrollWidth - container.clientWidth
  if (maxScroll <= 0) {
    scrollProgress.value = 100
    return
  }
  const currentScroll = Math.max(0, container.scrollLeft)
  scrollProgress.value = Math.min(100, Math.round((currentScroll / maxScroll) * 100))
}

// Arrow click horizontal scroll
const scrollHorizontal = (direction) => {
  const container = scrollContainerRef.value
  if (!container) return
  const scrollAmount = container.clientWidth * 0.75
  container.scrollBy({
    left: direction === 'right' ? scrollAmount : -scrollAmount,
    behavior: 'smooth'
  })
}

// Modal open/close
const openModal = (project) => {
  activeModalProject.value = project
}

const closeModal = () => {
  activeModalProject.value = null
}

// Keyboard ESC listener for modal
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && activeModalProject.value) {
    closeModal()
  }
}

// GSAP Animations
const animateCardsReveal = () => {
  gsap.fromTo(
    '.project-card',
    { opacity: 0, y: 25, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power3.out',
      clearProps: 'all'
    }
  )
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  // Header GSAP Animation
  gsap.fromTo(
    '.header-section > *',
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power4.out'
    }
  )

  // Cards initial animation
  animateCardsReveal()
  updateScrollProgress()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

watch(viewMode, () => {
  nextTick(() => {
    animateCardsReveal()
    updateScrollProgress()
  })
})
</script>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  animation: gradient 6s ease infinite;
}

/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Hide scrollbars */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
