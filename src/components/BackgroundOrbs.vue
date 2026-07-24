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

/* Büyük Mor Küre (Çok Koyu Derin Gece Moru) */
.orb-large {
  top: 5%;
  left: 10%;
  width: 580px;
  height: 580px;
  background: radial-gradient(
    circle at center,
    rgba(76, 29, 149, 0.6) 0%,
    rgba(58, 12, 100, 0.45) 45%,
    rgba(35, 8, 65, 0.25) 70%,
    rgba(15, 3, 30, 0) 100%
  );
  filter: blur(105px);
  opacity: 0.55;
  animation: floatLarge 22s ease-in-out infinite alternate;
}

/* Küçük Mor Küre (Çok Koyu Derin Viyole) */
.orb-small {
  bottom: 10%;
  right: 12%;
  width: 380px;
  height: 380px;
  background: radial-gradient(
    circle at center,
    rgba(88, 28, 135, 0.65) 0%,
    rgba(67, 20, 110, 0.45) 45%,
    rgba(40, 10, 70, 0.25) 70%,
    rgba(18, 4, 32, 0) 100%
  );
  filter: blur(90px);
  opacity: 0.5;
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
