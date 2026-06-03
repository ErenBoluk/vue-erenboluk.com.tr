<template>
  <main class="portfolio min-h-screen p-6 md:p-12 relative overflow-hidden isolate">
    <!-- Background Elements (Same as HireMe) -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Header Section -->
      <div ref="headerRef" class="header-section mb-16 md:mb-24 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">{{ $t('portfolio.title') }}</span>
        </div>
        
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          {{ $t('portfolio.headline_1') }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-[length:200%_auto] animate-gradient">{{ $t('portfolio.headline_2') }}</span>
        </h1>
        
        <p class="text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
          {{ $t('portfolio.subtitle') }}
        </p>
      </div>

      <!-- Grid: High-End Card Design -->
      <div ref="gridRef" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        <article
          v-for="(project, index) in projects"
          :key="project.id"
          class="project-card group relative bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-purple-500/40 transition-all duration-700 hover:shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]"
        >
          <!-- Card Index (e.g., 01) -->
          <div class="absolute top-8 left-8 z-20 opacity-20 group-hover:opacity-40 transition-opacity">
            <span class="text-4xl font-black text-white italic tracking-tighter">0{{ index + 1 }}</span>
          </div>

          <!-- Image Container with Shine Effect -->
          <div class="h-64 w-full relative overflow-hidden">
            <img 
              :src="project.img" 
              :alt="project.title"
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            <!-- Shine Overlay -->
            <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-90"></div>
            
            <!-- Floating Icon Badge -->
            <div class="absolute top-8 right-8 p-3.5 bg-neutral-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:bg-purple-600/20 group-hover:border-purple-500/50">
              <component :is="project.icon" class="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
            </div>

            <!-- Tags -->
            <div class="absolute bottom-8 left-8 flex flex-wrap gap-2">
              <span 
                v-for="tag in project.tags" 
                :key="tag"
                class="text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-white/5 text-neutral-300 border border-white/10 backdrop-blur-xl shadow-lg"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Content Section -->
          <div class="p-10 space-y-6">
            <div class="space-y-3">
              <h3 class="text-2xl md:text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-400 transition-all duration-500">
                {{ project.title }}
              </h3>
              <p class="text-neutral-400 text-sm md:text-base leading-relaxed font-light opacity-80 group-hover:opacity-100 transition-all duration-500 line-clamp-3 group-hover:line-clamp-none">
                {{ project.desc }}
              </p>
            </div>

            <!-- Action Section -->
            <div class="pt-8 border-t border-white/5 flex items-center justify-between">
              <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                class="inline-flex items-center gap-3 text-sm font-bold text-white hover:text-purple-400 transition-all group/link"
              >
                <span class="relative">
                  {{ $t('portfolio.visit') }}
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover/link:w-full"></span>
                </span>
                <div class="p-2 rounded-full bg-white/5 group-hover/link:bg-purple-500/20 group-hover/link:rotate-[-45deg] transition-all duration-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </a>
              <div v-else class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <span class="relative flex h-1.5 w-1.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-600 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-600"></span>
                </span>
                <span class="text-[10px] font-black uppercase tracking-widest text-neutral-500">{{ $t('portfolio.internal_tool') }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { useHead } from '@unhead/vue'
import { 
  CommandLineIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const gridRef = ref(null)
const headerRef = ref(null)

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

const projects = computed(() => [
  {
    id: 1,
    title: t('portfolio.projects.0.title'),
    desc: t('portfolio.projects.0.desc'),
    img: '/assets/img/portfolio/teknosa.png',
    icon: ShieldCheckIcon,
    tags: ['Backend', 'Security', 'File Transfer']
  },
  {
    id: 2,
    title: t('portfolio.projects.1.title'),
    desc: t('portfolio.projects.1.desc'),
    img: '/assets/img/portfolio/manas.png',
    icon: ChartBarIcon,
    tags: ['BI Tool', 'Management', 'Web']
  },
  {
    id: 3,
    title: t('portfolio.projects.2.title'),
    desc: t('portfolio.projects.2.desc'),
    img: '/assets/img/portfolio/gappze.png',
    icon: ChartBarIcon,
    tags: ['Analytics', 'Dashboard', 'Vue.js']
  },
  {
    id: 4,
    title: t('portfolio.projects.3.title'),
    desc: t('portfolio.projects.3.desc'),
    img: '/assets/img/portfolio/ardraw.png',
    icon: DevicePhoneMobileIcon,
    tags: ['iOS', 'Admin Panel', 'API']
  },
  {
    id: 5,
    title: t('portfolio.projects.4.title'),
    desc: t('portfolio.projects.4.desc'),
    img: '/assets/img/portfolio/speedometer.png',
    icon: DevicePhoneMobileIcon,
    tags: ['Swift', 'iOS', 'GPS'],
    url: 'https://apps.apple.com/us/app/speedometer-gps-tracker-mph/id6478858110'
  },
  {
    id: 6,
    title: t('portfolio.projects.5.title'),
    desc: t('portfolio.projects.5.desc'),
    img: '/assets/img/portfolio/fortunely.png',
    icon: CommandLineIcon,
    tags: ['Backend', 'Node.js', 'Scalable'],
    url: 'https://apps.apple.com/us/app/ar-drawing-draw-projector-app/id6473737662'
  },
  {
    id: 7,
    title: t('portfolio.projects.6.title'),
    desc: t('portfolio.projects.6.desc'),
    img: '/assets/img/portfolio/temsa.png',
    icon: GlobeAltIcon,
    tags: ['Enterprise', 'Transfer Tool', 'Security']
  }
])

onMounted(() => {
  gsap.set('.header-section > *', { opacity: 0, y: 30 })
  gsap.set('.project-card', { opacity: 0, y: 60 })

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  tl.to('.header-section > *', {
    opacity: 1,
    y: 0,
    duration: 1.5,
    stagger: 0.15
  })

  tl.to('.project-card', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.1,
    clearProps: 'all'
  }, '-=1')
})
</script>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  animation: gradient 5s ease infinite;
}

.project-card {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card:hover {
  transform: translateY(-12px) scale(1.02);
  background-color: rgba(23, 23, 23, 0.6);
}
</style>
