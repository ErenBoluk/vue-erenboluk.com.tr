<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n' 
import { LanguageIcon } from '@heroicons/vue/24/outline'
import { CheckIcon } from '@heroicons/vue/24/solid'

const { locale, t } = useI18n()

const showLocalizeModal = ref(false)
const modalRef = ref(null)
const buttonRef = ref(null)
const buttonId = 'language-toggle-button' 
const menuId = 'language-menu-dropdown'   

const languages = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' }  
]

// Aktif dilin adını gösterir.
const activeLanguageName = computed(() => {
  const lang = languages.find(lang => lang.code === locale.value)
  return lang ? lang.name : languages[0]?.name || 'English' // Fallback
})

// Dili değiştiren fonksiyon
const changeLanguage = (langCode) => {
  if (locale.value !== langCode) {
    console.log(`Dil değiştiriliyor: ${locale.value} -> ${langCode}`);
    locale.value = langCode // vue-i18n locale'ini güncelle
    localStorage.setItem('user-locale', langCode) // Seçimi tarayıcı hafızasına kaydet
    console.log(`Dil değiştirildi. Yeni locale: ${locale.value}`);
    
    
  }
  showLocalizeModal.value = false // Modalı kapat
}

// Modal dışına tıklandığında modalı kapatır
const handleClickOutside = (event) => {
  if (
    modalRef.value && !modalRef.value.contains(event.target) &&
    buttonRef.value && !buttonRef.value.contains(event.target)
  ) {
    showLocalizeModal.value = false
  }
}

// ESC tuşuna basıldığında modalı kapatır
const handleEscKey = (event) => {
  if (event.key === 'Escape' && showLocalizeModal.value) {
    showLocalizeModal.value = false
  }
}

// Modalın görünürlüğünü değiştirir
const toggleModal = () => {
  showLocalizeModal.value = !showLocalizeModal.value
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleEscKey)

  const savedLocale = localStorage.getItem('user-locale')
  if (savedLocale && languages.some(lang => lang.code === savedLocale)) {
    // Eğer kaydedilmiş dil, mevcut i18n locale'inden farklıysa güncelle
    if (locale.value !== savedLocale) {
        locale.value = savedLocale
        console.log(`localStorage'dan dil yüklendi: ${savedLocale}`);
    }
  } else if (!languages.some(lang => lang.code === locale.value)) {
    const fallbackLocale = languages[0]?.code || 'en';
    console.warn(`Mevcut i18n locali (${locale.value}) desteklenmiyor veya tanımsız. Varsayılan olarak '${fallbackLocale}' ayarlanıyor.`);
    locale.value = fallbackLocale;
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEscKey)
})
</script>

<template>
  <div class="relative">
    <button
      :id="buttonId"
      ref="buttonRef"
      class="flex items-center text-neutral-400  p-3 border border-transparent bg-secondary rounded-lg cursor-pointer shadow-sm hover:bg-opacity-90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
      @click="toggleModal"
      aria-haspopup="true"
      :aria-expanded="showLocalizeModal.toString()"
      :aria-controls="menuId"
      type="button"
    >
      <LanguageIcon class="size-5 mr-2" aria-hidden="true" />
      <span class="text-sm font-medium">{{ activeLanguageName }}</span>
      </button>

    <div
      v-show="showLocalizeModal"
      :id="menuId"
      class="absolute right-0 mt-2 z-10 min-w-[140px]"
    >
      <div
        ref="modalRef"
        class="bg-secondary rounded-lg shadow-lg py-1 transform transition-all duration-200 ease-out origin-top-right"
        role="menu"
        aria-orientation="vertical"
        :aria-labelledby="buttonId"
      >
        <ul>
          <li
            v-for="language in languages"
            :key="language.code"
            class="w-full hover:bg-neutral-800 transition-colors"
            role="presentation" >
            <button
              @click="changeLanguage(language.code)"
              class="flex items-center justify-between w-full px-4 py-2 text-left focus-visible:bg-neutral-700 focus-visible:outline-none"
              :class="{ 'text-purple-400 font-medium': locale === language.code }"
              role="menuitem"
              :aria-current="locale === language.code ? 'true' : 'false'"
              type="button"
            >
              <span>{{ language.name }}</span>
              <CheckIcon
                v-if="locale === language.code"
                class="size-4 text-purple-400"
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
      </div>
    </div>

    </div>
</template>

<style scoped>
/* TailwindCSS  */
</style>