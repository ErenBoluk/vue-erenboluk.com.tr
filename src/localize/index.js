import { createI18n } from 'vue-i18n'

import en from './langs/en.json'
import tr from './langs/tr.json'

const messages = {
    en,
    tr
}

// Tarayıcı dilini al
const browserLang = navigator.language.split('-')[0] // örn: "tr-TR" → "tr"

// Desteklenen diller arasında mı kontrol et
const availableLocales = Object.keys(messages)
const localeWebLang = availableLocales.includes(browserLang) ? browserLang : 'en'


const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('user-locale') || localeWebLang, // Başlangıç dili (localStorage'dan veya varsayılan),
    fallbackLocale: 'en',
    messages
})

export default i18n