<template>
  <div ref="stackContainer" class="mobile-image-stack">
    <div class="images-container">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :ref="el => { if (el) imageRefs[index] = el }"
        class="image-slide"
        :style="getSlideStyle(index)"
      >
        <div class="image-content">
          <img
            :src="image.src"
            :alt="image.alt"
            class="slide-image"
            :class="{ 'loaded': loadedImages[index] }"
            @load="handleImageLoad(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
});

const stackContainer = ref(null);
const imageRefs = ref([]);
const loadedImages = ref({});
const scrollProgress = ref(0);
let scrollTriggerInstance = null;

// Beregn stil for hvert slide baseret på scroll position (uden clipPath)
const getSlideStyle = (index) => {
  const totalImages = props.images.length;
  if (totalImages === 0) {
    return { opacity: 0 };
  }
  
  const progress = scrollProgress.value;
  const exactIndex = progress * (totalImages - 1);
  const currentImageIndex = Math.floor(exactIndex);
  const transitionProgress = exactIndex - currentImageIndex; // 0-1 mellem to billeder
  const distance = index - currentImageIndex;

  // Basis værdier
  let opacity = 0;
  let scale = 0.9;
  let translateY = 40; // vh baseret offset
  let zIndex = totalImages - index;

  // Glat easing
  const eased = -(Math.cos(Math.PI * transitionProgress) - 1) / 2; // easeInOutSine

  if (distance === 0) {
    // Aktivt billede: glid let op og zoom en smule ind
    opacity = 1 - (eased * 0.4);
    scale = 1 - eased * 0.05;
    translateY = -eased * 10;
    zIndex = totalImages + 2;
  } else if (distance === 1) {
    // Næste billede fade/scale ind nedefra
    opacity = eased;
    scale = 0.92 + eased * 0.08;
    translateY = (1 - eased) * 30;
    zIndex = totalImages + 1;
  } else if (distance < 0) {
    // Tidligere billeder: dæmp en smule
    opacity = 0.35;
    scale = 0.95;
    translateY = -10;
  } else if (distance > 1) {
    // Kommende billeder længere fremme
    opacity = 0;
    scale = 0.9;
    translateY = 50;
  }
  
  return {
    opacity,
    transform: `translate3d(0, ${translateY}vh, 0) scale(${scale})`,
    zIndex: Math.max(0, Math.floor(zIndex)),
    willChange: 'transform, opacity'
  };
};

const handleImageLoad = (index) => {
  loadedImages.value[index] = true;
  
  // Animer fade-in for første billede
  if (index === 0 && imageRefs.value[index]) {
    nextTick(() => {
      gsap.fromTo(
        imageRefs.value[index],
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    });
  }
};

onMounted(() => {
  if (!stackContainer.value || props.images.length === 0) return;
  
  // Vent lidt så DOM er klar
  nextTick(() => {
    // Opret ScrollTrigger for scroll-baseret animation
    const scrollPerImage = 900; // viewport højder per billede
    const totalScrollHeight = scrollPerImage * props.images.length;
    
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: stackContainer.value,
      start: 'top top',
      end: `+=${totalScrollHeight}vh`,
      scrub: 0.5,
      onUpdate: (self) => {
        scrollProgress.value = self.progress;
      }
    });
    
    // Initial setup
    scrollProgress.value = 0;
  });
});

onUnmounted(() => {
  // Kill scroll trigger instance
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
  
  // Cleanup alle ScrollTriggers relateret til denne komponent
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars.trigger === stackContainer.value) {
      trigger.kill();
    }
  });
});
</script>

<style scoped>
.mobile-image-stack {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.images-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-slide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s ease-out;
}

.image-content {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  position: relative;
}

.slide-image {
  width: 100vw;
  height: 100vh;
  object-fit: cover; /* Fyld hele viewporten */
  display: block;
  opacity: 0;
  transition: opacity 0.4s ease-in;
}

.slide-image.loaded {
  opacity: 1;
}

/* Progress indicator */
/* Performance optimering */
.image-slide,
.image-content,
.slide-image {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
</style>

