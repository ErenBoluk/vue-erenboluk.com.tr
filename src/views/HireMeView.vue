<script setup>
import { ref, onMounted, reactive } from 'vue'
import { BriefcaseIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { gsap } from 'gsap'

const formRef = ref(null)
const leftColRef = ref(null)
const rightColRef = ref(null)
const successRef = ref(null)
const inputsRef = ref([])
const buttonRef = ref(null)

const isSubmitting = ref(false)
const isSuccess = ref(false)

// Form data
const formData = reactive({
  name: '',
  email: '',
  message: ''
})

onMounted(() => {
  // Initial setup
  const tl = gsap.timeline()
  
  // Set initial states
  gsap.set([leftColRef.value, rightColRef.value], {
    opacity: 0,
    y: 30
  })

  // Entrance animation
  tl.to(leftColRef.value, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out"
  })
  .to(rightColRef.value, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out"
  }, "-=0.6")
  
  // Input focus animations
  inputsRef.value.forEach(input => {
    if (input) {
      input.addEventListener('focus', () => {
        gsap.to(input.parentElement, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        })
      })
      
      input.addEventListener('blur', () => {
        gsap.to(input.parentElement, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        })
      })
    }
  })
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  // Button loading animation
  gsap.to(buttonRef.value, {
    scale: 0.95,
    duration: 0.2,
    yoyo: true,
    repeat: 1
  })
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Success transition
  const tl = gsap.timeline()
  
  tl.to(formRef.value, {
    opacity: 0,
    scale: 0.9,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      isSuccess.value = true
      isSubmitting.value = false
    }
  })
  .fromTo(successRef.value, 
    { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    { 
      opacity: 1, 
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }
  )
}
</script>

<template>
  <main class="hireme min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden relative isolate">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div class="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
      
      <!-- Left Column: Context & Info -->
      <div ref="leftColRef" class="space-y-8 text-center lg:text-left">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span class="text-sm font-medium text-neutral-300">{{ $t('hireme.open-work') }}</span>
        </div>

        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          {{ $t('hireme.headline') }}
        </h1>

        <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6 pt-4">
          <div class="flex gap-4">
            <a :href="$t('social.github')" target="_blank" class="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20 group">
              <img src="@/assets/brands/github.svg" alt="Github" class="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity">
            </a>
            <a :href="$t('social.linkedin')" target="_blank" class="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20 group">
              <img src="@/assets/brands/linkedin.svg" alt="LinkedIn" class="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity">
            </a>
          </div>
          
          <div class="h-px w-20 bg-white/10 lg:hidden"></div>
          
          <div class="text-neutral-400">
            <p class="text-sm uppercase tracking-wider mb-1 text-neutral-500">Email</p>
            <a href="mailto:erenboluk.dev@gmail.com" class="text-lg hover:text-purple-400 transition-colors">erenboluk.dev@gmail.com</a>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div ref="rightColRef" class="relative">
        <!-- Solid Background Form -->
        <div class="relative bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-8 md:p-10 shadow-2xl">
          
          <!-- Success Message -->
          <div v-if="isSuccess" ref="successRef" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20 bg-neutral-900/95 rounded-2xl">
            <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon class="w-10 h-10 text-green-500" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">{{ $t('hireme.success_title') }}</h3>
            <p class="text-neutral-400">{{ $t('hireme.success_message') }}</p>
            <button @click="isSuccess = false" class="mt-8 text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Send another message
            </button>
          </div>

          <!-- Form -->
          <form v-else ref="formRef" @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2 group">
              <label class="text-sm font-medium text-neutral-400 ml-1 transition-colors group-focus-within:text-purple-400">{{ $t('hireme.name') }}</label>
              <div class="relative transition-transform origin-left">
                <input 
                  v-model="formData.name"
                  ref="el => inputsRef.push(el)"
                  type="text" 
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                  placeholder="John Doe"
                >
              </div>
            </div>

            <div class="space-y-2 group">
              <label class="text-sm font-medium text-neutral-400 ml-1 transition-colors group-focus-within:text-purple-400">{{ $t('hireme.email') }}</label>
              <div class="relative transition-transform origin-left">
                <input 
                  v-model="formData.email"
                  ref="el => inputsRef.push(el)"
                  type="email" 
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                  placeholder="john@example.com"
                >
              </div>
            </div>

            <div class="space-y-2 group">
              <label class="text-sm font-medium text-neutral-400 ml-1 transition-colors group-focus-within:text-purple-400">{{ $t('hireme.message') }}</label>
              <div class="relative transition-transform origin-left">
                <textarea 
                  v-model="formData.message"
                  ref="el => inputsRef.push(el)"
                  rows="4"
                  required
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>
            </div>

            <button 
              ref="buttonRef"
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-white hover:bg-neutral-300 text-neutral-950 font-semibold py-4 rounded-xl shadow-lg shadow-white/5 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
                {{ $t('hireme.send') }}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ $t('hireme.sending') }}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
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