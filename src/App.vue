<script setup>
import { RouterLink, RouterView } from 'vue-router'
import SideMenu from '@/components/SideMenu.vue'
import Cursor from '@/components/Cursor.vue'
import {LanguageIcon} from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="flex min-h-screen bg-neutral-950 text-white overflow-x-hidden">
    <!-- Cursor -->
    <Cursor />
    
    <SideMenu class="bg-secondary"/>
    
    
    <transition name="fade">
      <RouterView class="flex-1 p-10 md:pt-10 pt-30 bg-main h-screen overflow-y-auto overflow-x-hidden" />
    </transition>
  </div>
</template>
<style scoped>
/* Modern Mor Scrollbar */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(160, 99, 204, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #a663cc, #6a4c93);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #c77dff, #7209b7);
  box-shadow: 0 2px 10px rgba(166, 99, 204, 0.4);
}

/* Firefox için */
* {
  scrollbar-width: thin;
  scrollbar-color: #a663cc rgba(160, 99, 204, 0.1);
}


.fade-enter-active,
.fade-leave-active {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(15px) scale(0.98);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-15px) scale(1.02);
}


@media (max-width: 768px) {
   
  .fade-enter-from {
    opacity: 0;
    transform: none;
  }

  .fade-leave-to {
    opacity: 0;
    transform: none;
  }
}
</style>
