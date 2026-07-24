<template>
  <main class="about-view min-h-screen p-4 sm:p-6 md:p-12 relative overflow-x-hidden isolate">
    <!-- Ambient Floating Orbs Background -->
    <BackgroundOrbs />

    <div class="max-w-[1280px] mx-auto relative z-10 space-y-12 md:space-y-16">
      <!-- Section 1: Profile Hero Header -->
      <section ref="heroRef" class="hero-section flex flex-col lg:flex-row items-center gap-8 md:gap-12 pt-6">
        <!-- Left: Profile Frame with Rotating Gradient Ring -->
        <div class="profile-avatar-container relative flex items-center justify-center shrink-0">
          <div class="profile-frame-wrapper relative p-[3px] rounded-full flex items-center justify-center cursor-pointer">
            <div class="rotating-gradient-ring"></div>
            
            <div class="relative z-10 p-1.5 md:p-2 rounded-full bg-neutral-950/90 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <img
                src="/assets/img/me-min.jpg"
                :alt="$t('about.alt-profile')"
                class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full object-cover object-top shadow-2xl"
              />
            </div>
          </div>
        </div>

        <!-- Right: Bio Info & Action Controls -->
        <div class="hero-content text-center lg:text-left flex-1 space-y-5">
          <!-- Status & Location Pill Badges -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{{ $t('about.status') }}</span>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium backdrop-blur-md">
              <MapPinIcon class="w-4 h-4 text-purple-400" />
              <span>{{ $t('about.location') }}</span>
            </div>
          </div>

          <!-- Main Title & Role -->
          <div class="space-y-2">
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {{ $t('about.title') }}
            </h1>
            <div class="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500">
              {{ $t('about.role') }}
            </div>
          </div>

          <p class="text-neutral-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
            {{ $t('about.subtitle') }}
          </p>

          <!-- Hero Action CTAs -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              @click="$router.push({ name: 'hireme', params: { lang: locale } })"
              class="px-6 py-3 rounded-xl bg-white/5 border border-purple-500/30 hover:bg-purple-600/20 hover:border-purple-500/60 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all duration-300 backdrop-blur-xl cursor-pointer flex items-center gap-2.5 group"
            >
              <ChatBubbleLeftRightIcon class="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>{{ $t('about.contact_me') }}</span>
            </button>

            <DownloadCvBtn variant="glass" />
          </div>
        </div>
      </section>

      <!-- Section 2: Key Stats Impact Grid -->
      <section ref="statsRef" class="stats-section grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="(stat, idx) in statsData"
          :key="idx"
          class="stat-card group relative bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-5 sm:p-6 rounded-3xl hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.25)] flex flex-col justify-between"
        >
          <div class="flex items-center justify-between mb-4">
            <span class="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <component :is="stat.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span class="text-xs font-mono font-bold text-neutral-500">0{{ idx + 1 }}</span>
          </div>

          <div class="space-y-1">
            <div class="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
              {{ stat.value }}
            </div>
            <div class="text-xs sm:text-sm text-neutral-400 font-light">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Career Journey Connected Timeline -->
      <section ref="timelineRef" class="timeline-section space-y-8">
        <div class="space-y-2 text-center md:text-left">
          <h2 class="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {{ $t('about.timeline_title') }}
          </h2>
          <div class="h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto md:mx-0"></div>
        </div>

        <div class="relative border-l-2 border-purple-500/20 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-8">
          <div
            v-for="(para, index) in paragraphs"
            :key="index"
            class="timeline-item group relative bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]"
          >
            <!-- Timeline Node Indicator -->
            <div class="absolute -left-[31px] sm:-left-[47px] top-8 w-6 h-6 rounded-full bg-neutral-950 border-2 border-purple-500 flex items-center justify-center group-hover:scale-125 group-hover:border-purple-400 transition-transform">
              <div class="w-2 h-2 rounded-full bg-purple-400"></div>
            </div>

            <div class="space-y-3">
              <h3 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-3 group-hover:text-purple-300 transition-colors">
                <div class="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <component :is="timelineIcons[index]" class="w-5 h-5 text-purple-400" />
                </div>
                <span>{{ para.title }}</span>
              </h3>

              <p class="text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
                {{ para.text }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Skills & Tech Spectrum Grid -->
      <section ref="skillsRef" class="skills-section space-y-8">
        <div class="space-y-2 text-center md:text-left">
          <h2 class="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {{ $t('about.skills_title') }}
          </h2>
          <p class="text-neutral-400 text-sm sm:text-base font-light">
            {{ $t('about.skills_subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="skillCat in skillCategories"
            :key="skillCat.title"
            class="skill-card group bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl hover:border-purple-500/40 transition-all duration-500 space-y-4"
          >
            <div class="flex items-center gap-3">
              <div class="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <component :is="skillCat.icon" class="w-6 h-6" />
              </div>
              <h3 class="text-lg sm:text-xl font-bold text-white">
                {{ skillCat.title }}
              </h3>
            </div>

            <div class="flex flex-wrap gap-2 pt-2">
              <span
                v-for="item in skillCat.items"
                :key="item"
                class="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs font-semibold hover:border-purple-500/40 hover:text-purple-300 transition-all duration-300 cursor-default"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { useHead } from '@unhead/vue'
import BackgroundOrbs from '@/components/BackgroundOrbs.vue'
import DownloadCvBtn from '@/components/DownloadCvBtn.vue'
import {
  MapPinIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()

useHead({
  title: () => t('seo.about.title'),
  meta: [
    { name: 'description', content: () => t('seo.about.description') },
    { property: 'og:title', content: () => t('seo.about.title') },
    { property: 'og:description', content: () => t('seo.about.description') },
    { name: 'twitter:title', content: () => t('seo.about.title') },
    { name: 'twitter:description', content: () => t('seo.about.description') }
  ]
})

// Stats Grid Data
const statsData = computed(() => [
  {
    icon: BriefcaseIcon,
    value: t('about.stats.exp'),
    label: t('about.stats.exp_label')
  },
  {
    icon: SparklesIcon,
    value: t('about.stats.projects'),
    label: t('about.stats.projects_label')
  },
  {
    icon: ShieldCheckIcon,
    value: t('about.stats.enterprise'),
    label: t('about.stats.enterprise_label')
  },
  {
    icon: CodeBracketIcon,
    value: t('about.stats.tech'),
    label: t('about.stats.tech_label')
  }
])

// Paragraphs from i18n
const paragraphs = computed(() => {
  return [
    {
      title: t('about.paragraphs.0.title'),
      text: t('about.paragraphs.0.text')
    },
    {
      title: t('about.paragraphs.1.title'),
      text: t('about.paragraphs.1.text')
    },
    {
      title: t('about.paragraphs.2.title'),
      text: t('about.paragraphs.2.text')
    }
  ]
})

const timelineIcons = [RocketLaunchIcon, ChartBarIcon, ShieldCheckIcon]

// Skills Categories Grid
const skillCategories = computed(() => [
  {
    title: locale.value === 'tr' ? 'Backend & API Mimarı' : 'Backend & API Architecture',
    icon: CommandLineIcon,
    items: ['Node.js', 'Express.js', 'REST APIs', 'Security Protocols', 'PostgreSQL', 'MongoDB', 'Scalable Microservices']
  },
  {
    title: locale.value === 'tr' ? 'Ön Yüz & Web Teknolojileri' : 'Frontend & Web Stack',
    icon: CodeBracketIcon,
    items: ['Vue.js 3', 'JavaScript (ES6+)', 'Vite', 'Tailwind CSS', 'GSAP Motion', 'HTML5 & CSS3', 'Responsive UI']
  },
  {
    title: locale.value === 'tr' ? 'Mobil & Native iOS' : 'Mobile & Native iOS',
    icon: DevicePhoneMobileIcon,
    items: ['Swift', 'Native iOS Architecture', 'CoreLocation', 'Paywalls & Subscriptions', 'App Store Deployment']
  },
  {
    title: locale.value === 'tr' ? 'Kurumsal & Güvenlik Sistemleri' : 'Enterprise & Security Systems',
    icon: CpuChipIcon,
    items: ['Private File Transfer Systems', 'Data Encryption Protocols', 'BI Analytics Dashboards', 'Git Workflow', 'Docker']
  }
])

// Refs for GSAP
const heroRef = ref(null)
const statsRef = ref(null)
const timelineRef = ref(null)
const skillsRef = ref(null)

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.fromTo(
    '.hero-section > *',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }
  )
  .fromTo(
    '.stat-card',
    { opacity: 0, y: 25, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
    '-=0.4'
  )
  .fromTo(
    '.timeline-item',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.7, stagger: 0.15 },
    '-=0.3'
  )
  .fromTo(
    '.skill-card',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
    '-=0.3'
  )
})
</script>

<style scoped>
.profile-avatar-container {
  position: relative;
}

.profile-frame-wrapper {
  position: relative;
  display: inline-flex;
  will-change: transform;
}

.rotating-gradient-ring {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #7e22ce,
    #3b0764,
    #6b21a8,
    #3b0764,
    #7e22ce
  );
  animation: spinGradient 14s linear infinite;
  filter: drop-shadow(0 0 8px rgba(126, 34, 206, 0.4));
  opacity: 0.9;
  will-change: transform;
}

.profile-frame-wrapper:hover .rotating-gradient-ring {
  opacity: 1;
  filter: drop-shadow(0 0 14px rgba(168, 85, 247, 0.7));
  animation-duration: 7s;
}

@keyframes spinGradient {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>