<template>
  <div class="orbs-container" aria-hidden="true">
    <!-- Büyük Mor Küre (Large Blurred Purple Orb) -->
    <div class="orb orb-large"></div>
    <!-- Küçük Mor Küre (Small Blurred Purple Orb) -->
    <div class="orb orb-small"></div>
  </div>
</template>

<script setup>
// High-performance GPU hardware-accelerated floating purple layer blur orbs
</script>

<style scoped>
.orbs-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

/* Büyük Mor/İndigo Küre (Yumuşak İndigo-Viyole Işıltı) */
.orb-large {
  top: 5%;
  left: 8%;
  width: 560px;
  height: 560px;
  background: radial-gradient(
    circle at center,
    rgba(124, 58, 237, 0.45) 0%,
    rgba(79, 70, 229, 0.3) 45%,
    rgba(49, 46, 129, 0.12) 70%,
    rgba(15, 23, 42, 0) 100%
  );
  filter: blur(95px);
  opacity: 0.4;
  animation: floatLarge 22s ease-in-out infinite alternate;
}

/* Küçük Ametist/Eflatun Küre (Yumuşak Ametist Işıltı) */
.orb-small {
  bottom: 8%;
  right: 10%;
  width: 360px;
  height: 360px;
  background: radial-gradient(
    circle at center,
    rgba(168, 85, 247, 0.5) 0%,
    rgba(147, 51, 234, 0.3) 45%,
    rgba(88, 28, 135, 0.12) 70%,
    rgba(24, 9, 38, 0) 100%
  );
  filter: blur(80px);
  opacity: 0.38;
  animation: floatSmall 16s ease-in-out infinite alternate;
}

/* Gezinen Hareket Animasyonları (GPU Compositor translate3d) */
@keyframes floatLarge {
  0% {
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate3d(140px, 90px, 0) scale(1.08) rotate(35deg);
  }
  50% {
    transform: translate3d(-70px, 170px, 0) scale(0.92) rotate(75deg);
  }
  75% {
    transform: translate3d(190px, 50px, 0) scale(1.05) rotate(120deg);
  }
  100% {
    transform: translate3d(-110px, -70px, 0) scale(1) rotate(160deg);
  }
}

@keyframes floatSmall {
  0% {
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
  }
  30% {
    transform: translate3d(-150px, -100px, 0) scale(1.15) rotate(-50deg);
  }
  60% {
    transform: translate3d(90px, -160px, 0) scale(0.88) rotate(-110deg);
  }
  100% {
    transform: translate3d(-100px, 120px, 0) scale(1.05) rotate(-160deg);
  }
}

/* Responsive (Mobil / Tablet) */
@media (max-width: 768px) {
  .orb-large {
    width: 320px;
    height: 320px;
    filter: blur(65px);
    opacity: 0.6;
  }

  .orb-small {
    width: 210px;
    height: 210px;
    filter: blur(50px);
    opacity: 0.55;
  }
}
</style>
