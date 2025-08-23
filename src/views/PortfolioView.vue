<template>
  <main ref="root" class="hireme grid content-center min-h-screen px-4 overflow-hidden">
    <div class="portfolio px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="header-section mb-16">
        <h1
            class="portfolio-title inline-block text-white py-3 px-4 rounded-2xl mb-8 text-xl md:text-2xl font-medium shadow-2xl border border-white/10"
        >
          {{ $t('portfolio.title') }}
        </h1>

        <p class="text-slate-300 text-lg max-w-2xl leading-relaxed opacity-90">
          Crafting exceptional digital experiences with modern technology and innovative design solutions.
        </p>
      </div>

      <!-- Grid -->
      <div ref="grid" class="portfolio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <article
            v-for="project in projects"
            :key="project.id"
            class="project-card group relative bg-neutral-900/60 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/10 transition-all duration-300"
        >
          <!-- Image -->
          <div class="image-container aspect-video overflow-hidden relative">
            <img
                :src="project.img"
                :alt="project.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
                class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <div
                class="absolute top-4 left-4 px-3 py-1 bg-purple-600/90 rounded-full text-xs font-semibold text-white border border-purple-400/50 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              Premium
            </div>
          </div>

          <!-- Body -->
          <div class="card-content p-6 flex flex-col gap-4">
            <h3
                class="card-title text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300"
            >
              {{ project.title }}
            </h3>

            <p class="card-description text-neutral-300 leading-relaxed text-sm line-clamp-3">
              {{ project.desc }}
            </p>

            <!-- Tech badges -->
            <div class="tech-stack flex flex-wrap gap-2 mt-2">
              <span
                  class="tech-badge px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30"
              >
                Modern
              </span>
<!--              <span-->
<!--                  class="tech-badge px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30"-->
<!--              >-->
<!--                Php-->
<!--              </span>-->
            </div>

            <!-- Link / Coming Soon -->
            <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                rel="noopener"
                class="project-link self-start flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold mt-4 pt-4 border-t border-white/10"
            >
              <span class="underline decoration-2 underline-offset-4">
                {{ $t('portfolio.visit') }}
              </span>
              <svg
                  ref="arrow"
                  class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <div
                v-else
                class="coming-soon self-start flex items-center gap-2 text-slate-500 font-medium mt-4 pt-4 border-t border-white/10"
            >
              <span>Not open to the public</span>
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
import gsap from 'gsap'

const { t } = useI18n()
const root = ref(null)
const grid = ref(null)

const projects = [
  {
    id: 1,
    title: computed(() => t('portfolio.projects.0.title')),
    desc: computed(() => t('portfolio.projects.0.desc')),
    img: new URL('/assets/img/portfolio/teknosa.png', import.meta.url).href,
  },
  {
    id: 2,
    title: computed(() => t('portfolio.projects.1.title')),
    desc: computed(() => t('portfolio.projects.1.desc')),
    img: new URL('/assets/img/portfolio/manas.png', import.meta.url).href,
  },
  {
    id: 3,
    title: computed(() => t('portfolio.projects.2.title')),
    desc: computed(() => t('portfolio.projects.2.desc')),
    img: new URL('/assets/img/portfolio/gappze.png', import.meta.url).href,
  },
  {
    id: 4,
    title: computed(() => t('portfolio.projects.3.title')),
    desc: computed(() => t('portfolio.projects.3.desc')),
    img: new URL('/assets/img/portfolio/ardraw.png', import.meta.url).href,
  },
  {
    id: 5,
    title: computed(() => t('portfolio.projects.4.title')),
    desc: computed(() => t('portfolio.projects.4.desc')),
    img: new URL('/assets/img/portfolio/speedometer.png', import.meta.url).href,
    url: 'https://apps.apple.com/us/app/speedometer-gps-tracker-mph/id6478858110',
  },
  {
    id: 6,
    title: computed(() => t('portfolio.projects.5.title')),
    desc: computed(() => t('portfolio.projects.5.desc')),
    img: new URL('/assets/img/portfolio/fortunely.png', import.meta.url).href,
    url: 'https://apps.apple.com/us/app/ar-drawing-draw-projector-app/id6473737662',
  },
  {
    id: 7,
    title: computed(() => t('portfolio.projects.6.title')),
    desc: computed(() => t('portfolio.projects.6.desc')),
    img: new URL('/assets/img/portfolio/temsa.png', import.meta.url).href,
  },
]

onMounted(() => {
  // Header fade-in
  gsap.fromTo(
      '.header-section',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
  )

  // Grid stagger
  gsap.fromTo(
      grid.value.children,
      { y: 20, opacity: 0, scale: 1 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.2
      }
  )

  // Gentle hover
  const cards = grid.value.querySelectorAll('article')
  cards.forEach(card => {
    const img = card.querySelector('img')
    const arrow = card.querySelector('.link-arrow')

    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -4, scale: 1.01, boxShadow: '0 12px 24px -4px rgba(0,0,0,.25)', duration: 0.35, ease: 'power1.out' })
      gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power1.out' })
      arrow && gsap.to(arrow, { x: 4, duration: 0.25, ease: 'power1.out' })
    })

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, scale: 1, boxShadow: '0 4px 12px rgba(0,0,0,.15)', duration: 0.35, ease: 'power1.out' })
      gsap.to(img, { scale: 1, duration: 0.5, ease: 'power1.out' })
      arrow && gsap.to(arrow, { x: 0, duration: 0.25, ease: 'power1.out' })
    })
  })
})
</script>

<style scoped>
.portfolio {
  min-height: calc(100vh - 80px);
}

.portfolio-grid {
  gap: 1.5rem;
}

.project-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.06);
  will-change: transform;
  transition: box-shadow 0.35s ease, border-color 0.35s ease;
}

.project-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.portfolio-title {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

.tech-badge {
  transition: transform 0.2s ease;
}
.tech-badge:hover {
  transform: scale(1.05);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>