<script setup>
import ProgressiveImage from '@/components/ProgressiveImage.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEditorialMotion } from '@/composables/useEditorialMotion'
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
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



// Skills Categories Grid
const skillCategories = computed(() => [
  {
    title: t('about.skills.backend'),
    icon: CommandLineIcon,
    items: ['Node.js', 'Bun', 'Fastify', 'Koa.js', 'Express.js', 'Prisma ORM', 'REST APIs', 'Security Protocols', 'PostgreSQL', 'MySQL', 'MongoDB', 'Scalable Microservices']
  },
  {
    title: t('about.skills.frontend'),
    icon: CodeBracketIcon,
    items: ['Vue.js 3', 'React', 'JavaScript (ES6+)', 'Vite', 'Tailwind CSS', 'GSAP Motion', 'HTML5 & CSS3', 'Responsive UI']
  },
  {
    title: t('about.skills.mobile'),
    icon: DevicePhoneMobileIcon,
    items: ['Swift', 'Flutter', 'Native iOS Architecture', 'CoreLocation', 'Paywalls & Subscriptions', 'App Store Deployment']
  },
  {
    title: t('about.skills.enterprise'),
    icon: CpuChipIcon,
    items: ['Private File Transfer Systems', 'Data Encryption Protocols', 'BI Analytics Dashboards', 'Git Workflow', 'Docker', 'Cyber Security', 'System Architecture', 'Performance Optimization', 'Linux']
  }
])


const rootRef = ref(null)
useEditorialMotion(rootRef)
</script>
<template>
  <main ref="rootRef" class="editorial-page about-view" aria-labelledby="about-heading">
    <header class="editorial-header about-header" data-aura-reveal>
      <div>
        <p class="editorial-kicker">01 / {{ t('sidebar.about') }}</p>
        <h1 id="about-heading" class="editorial-title">{{ t('about.title') }}</h1>
        <p class="editorial-subtitle">{{ t('about.role') }}</p>
        <p class="editorial-lead">{{ t('about.subtitle') }}</p>
        <div class="about-details"><span class="availability"><i aria-hidden="true"></i>{{ t('about.status') }}</span><span><MapPinIcon aria-hidden="true" />{{ t('about.location') }}</span></div>
        <div class="aura-actions about-actions"><RouterLink class="aura-button aura-button-primary" :to="{ name: 'hireme', params: { lang: locale } }">{{ t('about.contact_me') }}<ArrowRightIcon class="size-4" aria-hidden="true" /></RouterLink><DownloadCvBtn variant="glass" /></div>
      </div>
      <figure class="about-portrait"><ProgressiveImage src="https://erenboluk-com-tr.b-cdn.net/erenbolukcomtr/assets/me-min.jpg" :alt="t('about.alt-profile')" :width="640" :height="640" aspect-ratio="1 / 1.12" /><figcaption>Eren Bölük / {{ t('about.location') }}</figcaption></figure>
    </header>
    <section class="about-stats" :aria-label="t('about.title')" data-aura-reveal>
      <div v-for="(stat, index) in statsData" :key="stat.label"><span class="editorial-index">0{{ index + 1 }}</span><strong>{{ stat.value }}</strong><p>{{ stat.label }}</p></div>
    </section>
    <section class="editorial-section editorial-split">
      <h2 class="editorial-rule-title">{{ t('about.timeline_title') }}</h2>
      <div class="career-list"><article v-for="(paragraph, index) in paragraphs" :key="paragraph.title" class="career-entry" data-aura-reveal><span class="editorial-index">0{{ index + 1 }}</span><div><h3>{{ paragraph.title }}</h3><p>{{ paragraph.text }}</p></div></article></div>
    </section>
    <section class="editorial-section">
      <div class="skills-heading"><h2 class="editorial-rule-title">{{ t('about.skills_title') }}</h2><p>{{ t('about.skills_subtitle') }}</p></div>
      <div class="skills-grid"><article v-for="category in skillCategories" :key="category.title" class="skill-category" data-aura-reveal><h3><component :is="category.icon" aria-hidden="true" />{{ category.title }}</h3><div class="editorial-tags"><span v-for="item in category.items" :key="item">{{ item }}</span></div></article></div>
    </section>
  </main>
</template>
<style scoped>
.about-header { display: grid; align-items: center; gap: 40px; }
.about-details { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 28px; color: var(--aura-muted); font-size: 12px; line-height: 1.7; }
.about-details > span { display: inline-flex; align-items: center; gap: 8px; }
.about-details svg { width: 15px; height: 15px; }
.availability i { width: 5px; height: 5px; border-radius: 50%; background: var(--aura-accent); }
.about-actions { margin-top: 28px; }
.about-portrait { width: min(260px, 100%); border: 1px solid var(--aura-divider); padding: 12px; border-radius: 8px; margin: 0; }
.about-portrait .progressive-image { display: block; width: 100%; height: auto; aspect-ratio: 1 / 1.12; object-fit: cover; border-radius: 3px; filter: grayscale(30%); }
.about-portrait figcaption { padding-top: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: var(--aura-muted); }
.about-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; padding-block: 4px 48px; border-bottom: 1px solid var(--aura-divider); }
.about-stats strong { display: block; font-size: clamp(1.5rem, 2.5vw, 2rem); font-weight: 500; letter-spacing: -.04em; line-height: 1.3; margin-block: 16px 8px; }
.about-stats p { color: var(--aura-muted); font-size: 13px; line-height: 1.6; }
.career-list { margin-top: 32px; }
.career-entry { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 20px; padding-block: 24px; border-top: 1px solid var(--aura-divider); }
.career-entry:first-child { padding-top: 0; border-top: 0; }
.career-entry p { margin-top: 16px; }
.skills-heading p { margin-top: 16px; }
.skills-grid { display: grid; gap: 32px; margin-top: 40px; }
.skill-category { padding-top: 24px; border-top: 1px solid var(--aura-divider); }
.skill-category h3 { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.skill-category svg { width: 20px; height: 20px; color: var(--aura-accent); }
@media (min-width: 768px) { .skills-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px; } }
@media (min-width: 1024px) { .about-header { grid-template-columns: minmax(0, 1fr) 260px; gap: 100px; } .about-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } .career-list { margin-top: 0; } }
</style>
