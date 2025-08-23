import { createRouter, createWebHistory } from 'vue-router'

const titlePrefix = "Eren Boluk -";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { title: `${titlePrefix} Home` },
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/hireme',
      name: 'hireme',
      meta: { title: `${titlePrefix} Hire Me` },
      component: () => import('@/views/HireMeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      meta: { title: `${titlePrefix} About` },
      component: () => import('@/views/AboutView.vue'),
    },

    {
      path: '/portfolio',
      name: 'portfolio',
      meta: { title: `${titlePrefix} Portfolio` },
      component: () => import('@/views/PortfolioView.vue'),
    },
  ],
  linkActiveClass: "router-link-active"
})


// **Burada dinamik olarak title'ı değiştiriyoruz**
router.afterEach((to) => {
  document.title = to.meta.title || 'Eren Boluk';
});


export default router
