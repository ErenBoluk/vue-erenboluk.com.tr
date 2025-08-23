<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { HomeIcon, ClipboardDocumentListIcon, Bars3Icon, XMarkIcon, PlusCircleIcon, BriefcaseIcon } from '@heroicons/vue/24/outline';

import DownloadCvBtn from '@/components/DownloadCvBtn.vue'
import LocalizeBtn from '@/components/LocalizeBtn.vue'

const { t } = useI18n()

const sidebarShow = ref(false)

const menuItems = computed(() => [
    { name: t('sidebar.home'), route: 'home', icon: HomeIcon },
    { name: t('sidebar.about'), route: 'about', icon: ClipboardDocumentListIcon },
    { name: t('sidebar.portfolio'), route: 'portfolio', icon: BriefcaseIcon },
    { name: t('sidebar.hireme'), route: 'hireme', icon: PlusCircleIcon },
])

const toggleSidebar = () => {
    sidebarShow.value = !sidebarShow.value
}

const closeSidebar = () => {
    sidebarShow.value = false
}
</script>

<template>
    <div class="fixed top-10 right-5 flex items-center gap-x-2 z-20">
        <DownloadCvBtn class="transition duration-500 hover:scale-105"/>
        <LocalizeBtn />
    </div>

    <!-- Sidebar Aç/Kapat Butonu -->
    <button
        class="fixed top-10 left-5 p-4 bg-secondary rounded-lg shadow-lg md:hidden z-40"
        @click="toggleSidebar">
        <Bars3Icon class="size-6" />
    </button>

    <!-- Sidebar -->
    <header 
        class="
        bg-secondary p-6 flex flex-col justify-center 
        items-center
        inset-y-0 
        absolute 
        w-full 
        z-40 
        inset-x-0
        transition-all duration-300 ease-in-out md:relative md:w-1/5 md:translate-x-0"
        :class="{ '-translate-x-full': !sidebarShow, 'translate-x-0': sidebarShow }">
        
        <!-- Kapatma Butonu -->
        <button
            class="absolute top-10 right-5 p-4 bg-main rounded-lg shadow-lg md:hidden"
            @click="closeSidebar"
            v-show="sidebarShow"> 
            <XMarkIcon class="size-6" />
        </button>

        <!-- Menü -->
        <nav class="flex flex-col space-y-3 px-5 text-neutral-300 w-fit text-2xl md:text-lg font-light">
            <RouterLink 
                v-for="item in menuItems"
                :key="item.route"
                :to="{ name: item.route }"
                class="inline-flex items-center gap-x-2.5 transition-colors duration-700"
                active-class="text-purple-400"
                @click="closeSidebar">
                <component :is="item.icon" class="size-5" />
                {{ item.name }}
            </RouterLink>
        </nav>

        <!-- Sosyal Medya Butonları -->
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-x-3">
            <a :href="$t('social.github')" class="bg-main p-2 rounded-md">
                <img src="@/assets/brands/github.svg" alt="Github Icon" class="w-8 md:w-6">
            </a>
            <a :href="$t('social.linkedin')" class="bg-main p-2 rounded-md">
                <img src="@/assets/brands/linkedin.svg" alt="LinkedIn Icon" class="w-8 md:w-6">
            </a>
        </div>
    </header>
</template>