import './assets/tailwind.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import i18n from './localize'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(i18n)
app.use(router)

app.mount('#app')
