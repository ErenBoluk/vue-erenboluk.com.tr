<template>
  <main class="min-h-screen p-6 md:p-12 pt-24 md:pt-32 relative flex flex-col items-center">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div class="max-w-3xl w-full mx-auto relative z-10 flex flex-col items-center">
      
      <!-- Header Section: Image (Left) + Title (Right) -->
      <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 w-full">
        
        <!-- Profile Image (Square) -->
        <div class="relative w-40 h-40 md:w-48 md:h-48 shrink-0 group">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl rotate-6 group-hover:rotate-3 transition-transform duration-500 opacity-30 blur-lg"></div>
          <div class="absolute inset-0 bg-neutral-900 rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-1">
            <img 
              src="/assets/img/me.png" 
              alt="Eren Boluk" 
              class="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
          </div>
        </div>

        <!-- Title & Intro -->
        <div class="text-center md:text-left flex-1">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 relative inline-block md:block">
            {{ $t('about.title') }}
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 h-1 w-16 bg-purple-500/30 rounded-full"></div>
          </h1>
          <p class="text-neutral-400 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
            Passionate developer crafting digital experiences with code and creativity.
          </p>
        </div>
      </div>

      <!-- Timeline Content -->
      <div class="w-full space-y-8 pb-12">
        
        <!-- Card 1: Intro -->
        <div ref="card1" class="group relative bg-neutral-900/60 backdrop-blur-md border border-white/5 p-8 md:p-10 rounded-3xl hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1">
          <div class="absolute -left-3 top-10 w-6 h-6 bg-neutral-900 border border-purple-500/50 rounded-full flex items-center justify-center hidden md:flex">
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span class="text-3xl">👋</span>
            {{ $t('about.paragraphs.0.title') }}
          </h2>
          <p class="text-neutral-300 leading-relaxed text-lg">
            {{ $t('about.paragraphs.0.text') }}
          </p>
        </div>

        <!-- Card 2: Career -->
        <div ref="card2" class="group relative bg-neutral-900/60 backdrop-blur-md border border-white/5 p-8 md:p-10 rounded-3xl hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/10 hover:-translate-y-1">
          <div class="absolute -left-3 top-10 w-6 h-6 bg-neutral-900 border border-indigo-500/50 rounded-full flex items-center justify-center hidden md:flex">
            <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span class="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </span>
            {{ $t('about.paragraphs.1.title') }}
          </h2>
          <p class="text-neutral-300 leading-relaxed text-lg">
            {{ $t('about.paragraphs.1.text') }}
          </p>
        </div>

        <!-- Card 3: Experience -->
        <div ref="card3" class="group relative bg-neutral-900/60 backdrop-blur-md border border-white/5 p-8 md:p-10 rounded-3xl hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1">
          <div class="absolute -left-3 top-10 w-6 h-6 bg-neutral-900 border border-blue-500/50 rounded-full flex items-center justify-center hidden md:flex">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span class="p-2 bg-blue-500/20 rounded-lg text-blue-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </span>
            {{ $t('about.paragraphs.2.title') }}
          </h2>
          <p class="text-neutral-300 leading-relaxed text-lg">
            {{ $t('about.paragraphs.2.text') }}
          </p>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const card1 = ref(null)
const card2 = ref(null)
const card3 = ref(null)

onMounted(() => {
  // Initial Animation
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

  // Animate Cards
  tl.fromTo([card1.value, card2.value, card3.value],
    { 
      opacity: 0, 
      x: 50 
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      stagger: 0.2,
      delay: 0.2
    }
  )
})
</script>

<style scoped>
.animate-blob {
  animation: blob 10s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>