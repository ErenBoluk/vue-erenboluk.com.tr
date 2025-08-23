<template>
  <div class="cursor-container">
    <div ref="cursorDotRef" class="cursor-dot" :class="{ 'active': isActive, 'hidden': isHidden }"></div>
    <div ref="cursorOutlineRef" class="cursor-outline" :class="{ 'active': isActive, 'hidden': isHidden }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';

// Referanslar ve durumlar
const cursorDotRef = ref(null);
const cursorOutlineRef = ref(null);
const isActive = ref(false);
const isHidden = ref(false);

// Pozisyon değerleri
const mousePosition = reactive({ x: 0, y: 0 });
const dotPosition = reactive({ x: 0, y: 0 });
const outlinePosition = reactive({ x: 0, y: 0 });

// Animasyon için değişkenler
const animationFrameId = ref(null);

// Fare pozisyonunu akıcı şekilde güncelleme
const updateCursorPosition = (e) => {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
  
  if (!animationFrameId.value) {
    animationFrameId.value = requestAnimationFrame(animateCursor);
  }
};

// Akıcı animasyon için
const animateCursor = () => {
  // Smoothing effect - lerp (linear interpolation)
  dotPosition.x += (mousePosition.x - dotPosition.x) * 0.2;
  dotPosition.y += (mousePosition.y - dotPosition.y) * 0.2;
  
  // Outline için daha yavaş takip için farklı smoothing
  outlinePosition.x += (mousePosition.x - outlinePosition.x) * 0.12;
  outlinePosition.y += (mousePosition.y - outlinePosition.y) * 0.12;

  // CSS değişkenlerini güncelleme
  if (cursorDotRef.value) {
    cursorDotRef.value.style.setProperty('--x', `${dotPosition.x}px`);
    cursorDotRef.value.style.setProperty('--y', `${dotPosition.y}px`);
  }

  if (cursorOutlineRef.value) {
    cursorOutlineRef.value.style.setProperty('--x', `${outlinePosition.x}px`);
    cursorOutlineRef.value.style.setProperty('--y', `${outlinePosition.y}px`);
  }

  // Eğer hala hareket varsa animasyonu devam ettir
  const isMoving = 
    Math.abs(mousePosition.x - dotPosition.x) > 0.1 || 
    Math.abs(mousePosition.y - dotPosition.y) > 0.1 ||
    Math.abs(mousePosition.x - outlinePosition.x) > 0.1 || 
    Math.abs(mousePosition.y - outlinePosition.y) > 0.1;

  if (isMoving) {
    animationFrameId.value = requestAnimationFrame(animateCursor);
  } else {
    animationFrameId.value = null;
  }
};

// Fare düğmesi basıldığında aktifleştirme
const activateCursor = () => {
  isActive.value = true;
};

// Fare düğmesi bırakıldığında deaktifleştirme
const deactivateCursor = () => {
  isActive.value = false;
};

// Fare sayfadan çıktığında gizleme
const hideCursor = () => {
  isHidden.value = true;
};

// Fare sayfaya girdiğinde gösterme
const showCursor = () => {
  isHidden.value = false;
};

// Tıklanabilir elementler için hover efektleri
const setupHoverEffects = () => {
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', activateCursor);
    el.addEventListener('mouseleave', deactivateCursor);
  });
};

// Event listener temizleme
const cleanupHoverEffects = () => {
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
  
  interactiveElements.forEach(el => {
    el.removeEventListener('mouseenter', activateCursor);
    el.removeEventListener('mouseleave', deactivateCursor);
  });
};

onMounted(() => {
  // Başlangıç pozisyonlarını ayarla
  mousePosition.x = window.innerWidth / 2;
  mousePosition.y = window.innerHeight / 2;
  dotPosition.x = mousePosition.x;
  dotPosition.y = mousePosition.y;
  outlinePosition.x = mousePosition.x;
  outlinePosition.y = mousePosition.y;

  // Event listener'ları ekle
  document.addEventListener('mousemove', updateCursorPosition);
  document.addEventListener('mousedown', activateCursor);
  document.addEventListener('mouseup', deactivateCursor);
  document.addEventListener('mouseleave', hideCursor);
  document.addEventListener('mouseenter', showCursor);
  
  // Hover efektlerini ayarla
  setupHoverEffects();
  
  // İlk animasyonu başlat
  animationFrameId.value = requestAnimationFrame(animateCursor);
});

onUnmounted(() => {
  // Event listener'ları temizle
  document.removeEventListener('mousemove', updateCursorPosition);
  document.removeEventListener('mousedown', activateCursor);
  document.removeEventListener('mouseup', deactivateCursor);
  document.removeEventListener('mouseleave', hideCursor);
  document.removeEventListener('mouseenter', showCursor);
  
  // Hover efektlerini temizle
  cleanupHoverEffects();
  
  // Animasyonu durdur
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});
</script>

<style scoped>
.cursor-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  pointer-events: none;
  overflow: hidden;
}

.cursor-dot {
  position: fixed;
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
  transform: translate(calc(var(--x, 0) - 50%), calc(var(--y, 0) - 50%));
  pointer-events: none;
  z-index: 10002;
  will-change: transform;
  transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
              background-color 0.3s ease,
              box-shadow 0.3s ease;
  box-shadow: 0 0 0 rgba(255, 255, 255, 0);
}

.cursor-outline {
  position: fixed;
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(128, 0, 255, 0.3) 0%,
    rgba(138, 43, 226, 0.2) 40%, 
    rgba(148, 87, 235, 0) 100%
  );
  transform: translate(calc(var(--x, 0) - 50%), calc(var(--y, 0) - 50%));
  pointer-events: none;
  z-index: 10001;
  will-change: transform;
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              border-color 0.3s ease,
              background 0.3s ease,
              width 0.3s ease,
              height 0.3s ease;
}

/* Aktif durum stilleri */
.cursor-dot.active {
  transform: translate(calc(var(--x, 0) - 50%), calc(var(--y, 0) - 50%)) scale(1.5);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
}

.cursor-outline.active {
  transform: translate(calc(var(--x, 0) - 50%), calc(var(--y, 0) - 50%)) scale(1.8);
  border-color: rgba(255, 255, 255, 0.8);
  background: radial-gradient(
    circle,
    rgba(138, 43, 226, 0.4) 0%,
    rgba(148, 87, 235, 0.3) 40%,
    rgba(158, 130, 245, 0) 100%
  );
}

/* Gizleme durumu */
.hidden {
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Mobil cihazlarda imleci gizle */
@media (max-width: 768px) {
  .cursor-dot,
  .cursor-outline {
    cursor: default;
    display: none;
  }
}
</style>