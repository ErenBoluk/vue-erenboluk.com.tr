<template>
  <main class="min-h-full p-10 md:pt-10 pt-30">
    <div class="about">
      <h1
          ref="title"
          class="inline-block text-white py-3 px-4 rounded-2xl mb-8 text-xl md:text-2xl font-medium shadow-2xl border border-white/10"
      >

        {{ $t('about.title') }}
      </h1>

      <div class="space-y-15 mx-6">
        <div 
          ref="section1"
          class="opacity-0 transform translate-y-8"
        >
          <h2 class="text-xl transition-colors duration-300 hover:text-white">
            {{ $t('about.paragraphs.0.title') }}
          </h2>
          <p class="text-neutral-400 mt-2 text-lg/7">
            {{ $t('about.paragraphs.0.text') }}
          </p>
        </div>
        
        <div 
          ref="section2"
          class="opacity-0 transform translate-y-8"
        >
          <h2 class="text-xl transition-colors duration-300 hover:text-white">
            {{ $t('about.paragraphs.1.title') }}
          </h2>
          <p class="text-neutral-400 mt-2 text-lg/7">
            {{ $t('about.paragraphs.1.text') }}
          </p>
        </div>
        
        <div 
          ref="section3"
          class="opacity-0 transform translate-y-8"
        >
          <h2 class="text-xl transition-colors duration-300 hover:text-white">
            {{ $t('about.paragraphs.2.title') }}
          </h2>
          <p class="text-neutral-400 mt-2 text-lg/7">
            {{ $t('about.paragraphs.2.text') }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default {
  setup() {
    const title = ref(null)
    const section1 = ref(null)
    const section2 = ref(null)
    const section3 = ref(null)

    onMounted(() => {
      // GSAP ScrollTrigger plugin'ini register et
      gsap.registerPlugin(ScrollTrigger)

      // Timeline oluştur
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Başlık animasyonu
      tl.to(title.value, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      })

      // Bölümlerin sıralı animasyonu
      tl.to([section1.value, section2.value, section3.value], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
      }, "-=0.3")

      // Hover animasyonları
      const sections = [section1.value, section2.value, section3.value]
      sections.forEach(section => {
        const h2 = section.querySelector('h2')
        
        section.addEventListener('mouseenter', () => {
          gsap.to(section, {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        section.addEventListener('mouseleave', () => {
          gsap.to(section, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          })
        })
      })

      // Başlık hover animasyonu
      title.value.addEventListener('mouseenter', () => {
        gsap.to(title.value, {
          y: -5,
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
          duration: 0.3,
          ease: "power2.out"
        })
      })

      title.value.addEventListener('mouseleave', () => {
        gsap.to(title.value, {
          y: 0,
          boxShadow: "0 0px 0px rgba(0, 0, 0, 0)",
          duration: 0.3,
          ease: "power2.out"
        })
      })
    })

    return {
      title,
      section1,
      section2,
      section3
    }
  }
}
</script>

<style scoped>
/* Responsive Typography */
@media (min-width: 768px) {
  .about h1 {
    font-size: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .about h1 {
    font-size: 1.75rem;
  }
  
  .about h2 {
    font-size: 1.5rem;
  }
}

/* Initial states for GSAP animations */
.opacity-0 {
  opacity: 0;
}

.transform {
  transform: translateY(20px);
}
</style>