<script setup>
import {PlusCircleIcon,DocumentDuplicateIcon} from '@heroicons/vue/24/outline'
import { gsap } from "gsap"
import { onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import BackgroundOrbs from '@/components/BackgroundOrbs.vue'

const { t } = useI18n()

useHead({
  title: () => t('seo.home.title'),
  meta: [
    { name: 'description', content: () => t('seo.home.description') },
    { property: 'og:title', content: () => t('seo.home.title') },
    { property: 'og:description', content: () => t('seo.home.description') },
    { name: 'twitter:title', content: () => t('seo.home.title') },
    { name: 'twitter:description', content: () => t('seo.home.description') }
  ]
})

const isHovered = ref(false)
const emailCopied = ref(false)

onMounted(() => {
  // Ana timeline oluştur
  const tl = gsap.timeline()
  
  // Paralel animasyonlar için ayrı timeline'lar
  const textTimeline = gsap.timeline()
  const imageTimeline = gsap.timeline()
  
  // Resim animasyonu - şık dönen halka ve cam çerçeve girişi
  imageTimeline
    .fromTo(
      ".profile-frame-wrapper",
      { 
        opacity: 0, 
        scale: 0.5, 
        rotation: -15,
        filter: "blur(15px)",
        y: 50
      },
      { 
        opacity: 1, 
        scale: 1, 
        rotation: 0,
        filter: "blur(0px)",
        y: 0,
        duration: 1.8, 
        ease: "elastic.out(1, 0.75)" 
      }
    )
  
  // Metin animasyonları - staggered ve smooth
  textTimeline
    .fromTo(
      ".account-infos h1",
      { 
        opacity: 0, 
        y: 40,
        filter: "blur(10px)"
      },
      { 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)",
        duration: 1.2, 
        ease: "power4.out" 
      }
    )
    .fromTo(
      ".account-infos .job-title",
      { 
        opacity: 0, 
        x: -30,
        filter: "blur(5px)"
      },
      { 
        opacity: 1, 
        x: 0,
        filter: "blur(0px)",
        duration: 1, 
        ease: "power3.out" 
      },
      "-=0.8"
    )
    .fromTo(
      ".account-infos .short-about-text p",
      { 
        opacity: 0, 
        y: 20
      },
      { 
        opacity: 1, 
        y: 0,
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.15
      },
      "-=0.6"
    )
    .fromTo(
      ".account-infos .button-container",
      { 
        opacity: 0, 
        y: 20,
        scale: 0.95
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.8, 
        ease: "back.out(1.5)" 
      },
      "-=0.4"
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
  const profileWrapper = document.querySelector('.profile-frame-wrapper')
  const buttons = document.querySelectorAll('.hover-button')
  
  if (profileWrapper) {
    profileWrapper.addEventListener('mouseenter', () => {
      gsap.to(profileWrapper, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      })
    })
    
    profileWrapper.addEventListener('mouseleave', () => {
      gsap.to(profileWrapper, {
        scale: 1,
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
  <div class="relative w-full h-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden">
    <!-- Arkaplan Gezinen Mor Küreler (Figma Layer Blur Background Orbs) -->
    <BackgroundOrbs />
    
    <main class="relative z-10 flex flex-col items-center justify-center w-full">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-0 md:gap-x-10">
      <!-- Profil Fotoğrafı (İnce Derin Mor Dönen Halka & Cam Çerçeve) -->
      <div class="personal-photo flex justify-center items-center">
        <div class="profile-frame-wrapper relative p-[2px] rounded-full flex items-center justify-center cursor-pointer">
          <!-- Dönen Neon Gradient Halka (İnce 2 Koyu Mor Ton) -->
          <div class="rotating-gradient-ring"></div>
          
          <!-- İç Cam Çerçeve -->
          <div class="relative z-10 p-1 md:p-1.5 rounded-full bg-neutral-950/90 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <img
              src="/assets/img/me-min.jpg"
              :alt="$t('home.alt-profile')"
              class="w-72 md:w-96 rounded-full aspect-square object-cover"
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
            @click="$router.push({ name: 'hireme', params: { lang: locale } })"
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
              <span>{{ emailCopied ? $t('home.copied') : $t('home.copy-email') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Başarı bildirimi -->
    <Transition name="notification">
      <div v-if="emailCopied" class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
        {{ $t('home.email_copied') }}
      </div>
    </Transition>
  </main>
</div>
</template>

<style scoped>
/* Profil Çerçevesi ve Dönen Neon Halka */
.profile-frame-wrapper {
  position: relative;
  display: inline-flex;
  will-change: transform;
}

.rotating-gradient-ring {
  position: absolute;
  inset: -1.5px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #7e22ce,
    #3b0764,
    #6b21a8,
    #3b0764,
    #7e22ce
  );
  animation: spinGradient 14s linear infinite;
  filter: drop-shadow(0 0 5px rgba(126, 34, 206, 0.35));
  opacity: 0.85;
  transition: opacity 0.4s ease, filter 0.4s ease;
  will-change: transform;
}

.profile-frame-wrapper:hover .rotating-gradient-ring {
  opacity: 1;
  filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.6));
  animation-duration: 7s;
}

@keyframes spinGradient {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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