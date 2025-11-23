<template>
  <main class="portfolio min-h-screen p-6 md:p-12 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Header -->
      <div class="header-section mb-16 md:mb-24">
        <h1 class="inline-block text-white py-3 px-5 rounded-2xl mb-6 text-2xl md:text-3xl font-medium shadow-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
          {{ $t('portfolio.title') }}
        </h1>
        <p class="text-neutral-400 text-lg max-w-2xl leading-relaxed">
          Selected works showcasing expertise in backend systems, mobile applications, and secure data solutions.
        </p>
      </div>

      <!-- Grid -->
      <div ref="gridRef" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <article
          v-for="project in projects"
          :key="project.id"
          class="group relative bg-neutral-900/60 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20 z-0 hover:z-20"
        >
          <!-- Image Thumbnail -->
          <div class="h-56 w-full relative overflow-hidden rounded-t-3xl transform-gpu" style="-webkit-mask-image: -webkit-radial-gradient(white, black);">
            <img 
              :src="project.img" 
              :alt="project.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <!-- Icon/Badge -->
            <div class="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 z-10">
              <component :is="project.icon" class="w-6 h-6 text-white/90" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 md:p-8 relative rounded-b-3xl">
            <div class="flex flex-wrap gap-2 mb-4">
              <span 
                v-for="tag in project.tags" 
                :key="tag"
                class="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 text-neutral-300 border border-white/5"
              >
                {{ tag }}
              </span>
            </div>

            <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
              {{ project.title }}
            </h3>

            <!-- Description with Popover -->
            <div class="relative group/desc">
              <p class="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {{ project.desc }}
              </p>
              
              <!-- Popover -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/desc:opacity-100 group-hover/desc:translate-y-0 transition-all duration-300 z-50">
                <p class="text-neutral-200 text-sm leading-relaxed">
                  {{ project.desc }}
                </p>
                <!-- Arrow -->
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 border-b border-r border-white/10 rotate-45"></div>
              </div>
            </div>

            <!-- Action -->
            <div class="pt-6 border-t border-white/5 flex items-center justify-between">
              <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                class="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-purple-400 transition-colors"
              >
                {{ $t('portfolio.visit') }}
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
              <span v-else class="text-sm font-medium text-neutral-600 cursor-not-allowed flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-neutral-600"></span>
                Internal Tool
              </span>
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
import { 
  CommandLineIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const gridRef = ref(null)

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
  // Header Animation
  gsap.fromTo('.header-section',
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
  )

  // Grid Animation
  if (gridRef.value) {
    gsap.fromTo(gridRef.value.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      }
    )
  }
})
</script>

<style scoped>
.animate-blob {
  animation: blob 10s infinite;
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
</style>