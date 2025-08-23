<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { BriefcaseIcon } from '@heroicons/vue/24/outline'
import { gsap } from 'gsap'

const formRef = ref(null)
const headerRef = ref(null)
const badgeRef = ref(null)
const inputsRef = ref([])
const buttonRef = ref(null)

const isSubmitting = ref(false)

// Animation timeline
let tl = gsap.timeline()

onMounted(() => {
  // Initial setup - hide elements
  gsap.set([headerRef.value, badgeRef.value, ...inputsRef.value, buttonRef.value], {
    opacity: 0,
    y: 20
  })

  // Main animation timeline
  tl.to(headerRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out"
  })
  .to(badgeRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.4")
  .to(inputsRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: "power2.out"
  }, "-=0.3")
  .to(buttonRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.2")

  // Add hover animations to inputs
  inputsRef.value.forEach(input => {
    if (input) {
      input.addEventListener('focus', () => {
        gsap.to(input, {
          scale: 1.01,
          duration: 0.2,
          ease: "power2.out"
        })
      })
      
      input.addEventListener('blur', () => {
        gsap.to(input, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        })
      })
    }
  })

  // Button hover animation
  if (buttonRef.value) {
    buttonRef.value.addEventListener('mouseenter', () => {
      gsap.to(buttonRef.value, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      })
    })
    
    buttonRef.value.addEventListener('mouseleave', () => {
      gsap.to(buttonRef.value, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    })
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  // Button loading animation
  gsap.to(buttonRef.value, {
    scale: 0.98,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  })
  
  // Simulate form submission
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Success animation
  gsap.to(formRef.value, {
    scale: 1.01,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
    onComplete: () => {
      isSubmitting.value = false
    }
  })
}

// Badge pulse animation
const startBadgePulse = () => {
  gsap.to(badgeRef.value, {
    scale: 1.05,
    duration: 1.5,
    yoyo: true,
    repeat: -1,
    ease: "power2.inOut"
  })
}

// Start badge pulse after initial animation
setTimeout(startBadgePulse, 2000)
</script>

<template>
  <main class="hireme grid content-center min-h-screen px-4 overflow-hidden">
    <div ref="formRef" class="max-w-2xl mx-auto w-full">
      <!-- Header Section -->
      <div class="flex justify-between items-center md:mt-20 mb-10">

        <h1
            ref="headerRef"
          class="inline-block text-white py-3 px-4 rounded-2xl mb-8 text-xl md:text-2xl font-medium shadow-2xl border border-white/10"
        >

          {{ $t('hireme.title') }}
        </h1>
        <span 
          ref="badgeRef"
          class="text-xs bg-purple-950 text-purple-400 border border-purple-900 py-2 px-3 rounded-lg flex justify-center items-center shadow-lg shadow-purple-900/20 backdrop-blur-sm"
        >
          <BriefcaseIcon class="size-5 me-2 animate-pulse"/>
          {{ $t("hireme.open-work") }}
        </span>
      </div>

      <!-- Form Section -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Name Input -->
          <div class="input-group">
            <label for="name" class="block text-sm font-medium text-neutral-400 mb-2 ps-1">
              {{ $t('hireme.name') }}
            </label>
            <input 
              ref="el => inputsRef.push(el)"
              type="text" 
              name="name" 
              id="name" 
              class="input-field placeholder:text-neutral-600 text-lg w-full appearance-none focus:outline-none bg-neutral-900 px-5 py-4 rounded-lg focus:text-white border border-neutral-800 focus:border-purple-500 transition-all duration-300 hover:border-neutral-700"
              placeholder="Full Name"
              required
            >
          </div>

          <!-- Email Input -->
          <div class="input-group">
            <label for="email" class="block text-sm font-medium text-neutral-400 mb-2 ps-1">
              {{ $t('hireme.email') }}
            </label>
            <input 
              ref="el => inputsRef.push(el)"
              type="email" 
              name="email"  
              id="email" 
              class="input-field placeholder:text-neutral-600 text-lg w-full appearance-none focus:outline-none bg-neutral-900 px-5 py-4 rounded-lg focus:text-white border border-neutral-800 focus:border-purple-500 transition-all duration-300 hover:border-neutral-700"
              placeholder="example@mail.com"
              required
            >
          </div>
        </div>

        <!-- Message Textarea -->
        <div class="input-group">
          <label for="description" class="block text-sm font-medium text-neutral-400 mb-2 ps-1">
            {{ $t('hireme.message') }}
          </label>
          <textarea 
            ref="el => inputsRef.push(el)"
            name="description" 
            id="description" 
            rows="6" 
            class="input-field placeholder:text-neutral-600 text-lg w-full appearance-none focus:outline-none bg-neutral-900 px-5 py-4 rounded-lg focus:text-white resize-none border border-neutral-800 focus:border-purple-500 transition-all duration-300 hover:border-neutral-700"
            placeholder="Your Message"
            required
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button 
          ref="buttonRef"
          type="submit"
          :disabled="isSubmitting"
          class="submit-btn w-full cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 mt-6 py-4 px-6 rounded-lg font-semibold text-white shadow-lg shadow-purple-900/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-600 hover:border-purple-500"
        >
          <span v-if="!isSubmitting" class="flex items-center justify-center">
            {{ $t('hireme.send') }}
            <svg class="w-5 h-5 ml-2 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.input-field {
  position: relative;
}

.input-field::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
  pointer-events: none;
  border-radius: 0.5rem;
}

.input-field:focus::before {
  transform: translateX(100%);
}

.submit-btn {
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.submit-btn:hover::before {
  left: 100%;
}

.input-group {
  position: relative;
}

.input-group::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #a855f7, transparent);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.input-group:focus-within::after {
  transform: scaleX(1);
}

/* Floating particles effect */
.hireme {
  position: relative;
}

.hireme::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
  animation: float 15s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(5px, -5px) scale(1.02); }
  66% { transform: translate(-5px, 5px) scale(0.98); }
}
</style>  