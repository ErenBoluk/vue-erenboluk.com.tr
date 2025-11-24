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
    <!-- Top Right Controls -->
    <div class="fixed top-6 right-6 flex items-center gap-x-3 z-50">
        <DownloadCvBtn class="transition-transform duration-300 hover:scale-105 shadow-lg shadow-purple-900/20"/>
        <LocalizeBtn />
    </div>

    <!-- Mobile Toggle Button -->
    <button
        class="fixed top-6 left-6 p-2.5 bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-lg md:hidden z-50 transition-transform active:scale-95"
        @click="toggleSidebar">
        <Bars3Icon class="size-5" />
    </button>

    <!-- Sidebar Overlay (Mobile) -->
    <div 
        v-if="sidebarShow"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
        class="fixed inset-y-0 left-0 w-64 bg-neutral-900/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-500 ease-out z-50 md:translate-x-0 md:static md:w-56 md:bg-transparent md:border-r-0 md:block"
        :class="sidebarShow ? 'translate-x-0' : '-translate-x-full'"
    >
        <div class="h-full flex flex-col p-4">
            <!-- Mobile Close Button -->
            <div class="flex justify-end md:hidden mb-6">
                <button
                    class="p-2 text-neutral-400 hover:text-white transition-colors"
                    @click="closeSidebar"> 
                    <XMarkIcon class="size-5" />
                </button>
            </div>

            <!-- Logo / Brand -->
            <div class="hidden md:flex justify-center mb-8">
                <img src="@/assets/logo.svg" alt="Logo" class="w-8 h-8" />
            </div>

            <!-- Navigation -->
            <nav class="flex-1 flex flex-col justify-center items-center space-y-2">
                <RouterLink 
                    v-for="item in menuItems"
                    :key="item.route"
                    :to="{ name: item.route }"
                    class="flex w-40 items-center justify-start gap-x-3 px-3 py-2.5 rounded-lg text-sm font-light text-neutral-400 transition-all duration-300 group hover:bg-white/5 hover:text-white border border-transparent"
                    active-class="!bg-purple-500/10 !text-purple-400 !border-purple-500/20 shadow-lg shadow-purple-900/10"
                    @click="closeSidebar">
                    <component 
                        :is="item.icon" 
                        class="size-5 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" 
                    />
                    <span>{{ item.name }}</span>
                </RouterLink>
            </nav>

            <!-- Social Links -->
            <div class="mt-auto pt-6 border-t border-white/5">
                <div class="flex gap-x-3 justify-center">
                    <a 
                        :href="$t('social.github')" 
                        target="_blank"
                        class="p-2 rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white hover:-translate-y-1 transition-all duration-300 border border-white/5"
                    >
                        <img src="@/assets/brands/github.svg" alt="Github" class="w-4 h-4 opacity-70 group-hover:opacity-100 invert">
                    </a>
                    <a 
                        :href="$t('social.linkedin')" 
                        target="_blank"
                        class="p-2 rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white hover:-translate-y-1 transition-all duration-300 border border-white/5"
                    >
                        <img src="@/assets/brands/linkedin.svg" alt="LinkedIn" class="w-4 h-4 opacity-70 group-hover:opacity-100">
                    </a>
                </div>
                <p class="text-[10px] text-center text-neutral-600 mt-4">
                    © {{ new Date().getFullYear() }} Eren Bölük
                </p>
            </div>
        </div>
    </aside>
</template>