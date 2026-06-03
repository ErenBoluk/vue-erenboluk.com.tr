import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/localize'

const routes = [
  {
    path: '/:lang(en|tr)?',
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue')
      },
      {
        path: 'hireme',
        name: 'hireme',
        component: () => import('@/views/HireMeView.vue')
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
      },
      {
        path: 'portfolio',
        name: 'portfolio',
        component: () => import('@/views/PortfolioView.vue'),
      },
    ]
  },
  // Fallback for routes without lang prefix
  {
    path: '/:pathMatch(.*)*',
    redirect: to => {
      const lang = localStorage.getItem('user-locale') || 'en'
      return `/${lang}${to.fullPath}`
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: "router-link-active"
})

// Sync i18n with route lang parameter
router.beforeEach((to, from, next) => {
  const lang = to.params.lang

  if (lang && ['en', 'tr'].includes(lang)) {
    if (i18n.global.locale.value !== lang) {
      i18n.global.locale.value = lang
    }
    return next()
  }

  // If no lang, redirect to default or saved lang
  const savedLang = localStorage.getItem('user-locale') || 'en'
  return next({ name: to.name || 'home', params: { ...to.params, lang: savedLang } })
})

export default router
