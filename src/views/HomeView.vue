<script setup>
import {PlusCircleIcon,DocumentDuplicateIcon} from '@heroicons/vue/24/outline'
import { gsap } from "gsap"
import { onMounted, ref } from 'vue'

const isHovered = ref(false)
const emailCopied = ref(false)

onMounted(() => {
  // Ana timeline oluştur
  const tl = gsap.timeline()
  
  // Paralel animasyonlar için ayrı timeline'lar
  const textTimeline = gsap.timeline()
  const imageTimeline = gsap.timeline()
  
  // Resim animasyonu - daha dramatik entrance
  imageTimeline
    .fromTo(
      ".personal-photo img",
      { 
        opacity: 0, 
        scale: 0.3, 
        rotation: -10,
        filter: "blur(10px)"
      },
      { 
        opacity: 1, 
        scale: 1, 
        rotation: 0,
        filter: "blur(0px)",
        duration: 1.8, 
        ease: "back.out(1.7)" 
      }
    )
    .to(
      ".personal-photo img",
      {
        boxShadow: "0 20px 50px rgba(168, 85, 247, 0.4)",
        duration: 0.8,
        ease: "power2.out"
      },
      "-=0.5"
    )
  
  // Metin animasyonları - staggered ve smooth
  textTimeline
    .fromTo(
      ".account-infos h1",
      { 
        opacity: 0, 
        y: 50,
        filter: "blur(5px)"
      },
      { 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)",
        duration: 1.2, 
        ease: "power3.out" 
      }
    )
    .fromTo(
      ".account-infos .job-title",
      { 
        opacity: 0, 
        x: -50,
        scale: 0.8
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration: 1, 
        ease: "power2.out" 
      },
      "-=0.8"
    )
    .fromTo(
      ".account-infos .short-about-text p",
      { 
        opacity: 0, 
        y: 30,
        filter: "blur(3px)"
      },
      { 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)",
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.2
      },
      "-=0.5"
    )
    .fromTo(
      ".account-infos .button-container",
      { 
        opacity: 0, 
        y: 40,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 1, 
        ease: "back.out(1.7)" 
      },
      "-=0.3"
    )
    .fromTo(
      ".account-infos button",
      { 
        opacity: 0, 
        scale: 0.8,
        rotationY: 90
      },
      { 
        opacity: 1, 
        scale: 1,
        rotationY: 0,
        duration: 0.6, 
        ease: "power2.out",
        stagger: 0.1
      },
      "-=0.5"
    )
  
  // Timeline'ları paralel çalıştır
  tl.add(imageTimeline, 0)
    .add(textTimeline, 0.3)
  
  // Hover efektleri
  const profileImage = document.querySelector('.personal-photo img')
  const buttons = document.querySelectorAll('.hover-button')
  
  if (profileImage) {
    profileImage.addEventListener('mouseenter', () => {
      gsap.to(profileImage, {
        scale: 1.05,
        rotation: 2,
        duration: 0.3,
        ease: "power2.out"
      })
    })
    
    profileImage.addEventListener('mouseleave', () => {
      gsap.to(profileImage, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    })
  }
  
  // Buton hover efektleri
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        y: -2,
        duration: 0.2,
        ease: "power2.out"
      })
    })
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out"
      })
    })
  })
});

// Email kopyalama fonksiyonu
const copyEmail = () => {
  navigator.clipboard.writeText('erenboluk.dev@gmail.com').then(() => {
    emailCopied.value = true
    setTimeout(() => {
      emailCopied.value = false
    }, 2000)
  })
}
</script>

<template>
  <main class="flex flex-col items-center justify-center">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-0 md:gap-x-10">
      <!-- Profil Fotoğrafı -->
      <div class="personal-photo">
        <div class="flex justify-center">
          <div class="relative">
            <img
              src="/assets/img/me3.png"
              alt="Eren Bölük"
              class="w-75 md:w-100 p-2 rounded-full ring-2 ring-purple-400 aspect-square"
            />
          </div>
        </div>
      </div>
      
      <!-- Hesap Bilgileri -->
      <div class="text-center md:text-left flex flex-col justify-center account-infos">
        <h1 class="text-5xl font-bold">EREN BÖLÜK</h1>
        
        <div class="text-purple-400 text-2xl my-3 job-title">Web Developer</div>
        
        <div class="space-y-5 short-about-text">
          <p class="font-light text-lg">
            {{ $t('home.about-text-1') }}
          </p>
          <p class="font-light text-lg">
            {{ $t('home.about-text-2') }}
          </p>
        </div>
        
        <div class="flex gap-x-2 mt-1 button-container">
          <button
            class="hover-button rounded-lg border-1 bg-white text-black cursor-pointer mt-3 py-1 px-3 inline-block w-fit fs-sm ml-auto me-auto md:ml-0 md:me-0 hover:underline"
            @click="$router.push({ name: 'hireme' })"
            id="hire-me-button"
          >
            <div class="flex justify-center items-center gap-1">
              <PlusCircleIcon class="size-5" />
              <span>{{ $t('home.hireme') }}</span>
            </div>
          </button>
          
          <button
            class="hover-button border-neutral-700 rounded-lg border-1 cursor-pointer mt-3 py-1 px-3 inline-block w-fit fs-sm ml-auto me-auto md:ml-0 md:me-0 hover:underline"
            @click="copyEmail"
            id="copy-email-button"
          >
            <div class="flex justify-center items-center gap-1">
              <DocumentDuplicateIcon class="size-5" />
              <span>{{ emailCopied ? 'Kopyalandı!' : $t('home.copy-email') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Başarı bildirimi -->
    <Transition name="notification">
      <div v-if="emailCopied" class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
        E-posta adresi kopyalandı!
      </div>
    </Transition>
  </main>
</template>

<style scoped>
/* Notification animasyonu */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>