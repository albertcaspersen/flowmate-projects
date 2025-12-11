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

// Beregn stil for hvert slide baseret på scroll position
const getSlideStyle = (index) => {
  const totalImages = props.images.length;
  if (totalImages === 0) {
    return { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' };
  }
  
  const progress = scrollProgress.value;
  
  // Beregn hvilket billede der skal være aktivt
  const exactIndex = progress * (totalImages - 1);
  const currentImageIndex = Math.floor(exactIndex);
  const transitionProgress = exactIndex - currentImageIndex; // 0-1 mellem to billeder
  
  const distance = index - currentImageIndex;

  // Beregn clip-path baseret på scroll position
  // Beholder alle tidligere billeder fuldt synlige, så baggrunden ikke blottes ved hurtig scroll
  let clipPath = 'inset(0% 0% 100% 0%)'; // Standard: skjult fra bunden
  // Z-index: næste billede skal være højere end det aktuelle når det bliver afsløret
  let zIndex = totalImages - Math.abs(distance);
  if (distance === 1 && transitionProgress > 0) {
    // Næste billede skal være over det aktuelle når det bliver afsløret
    zIndex = totalImages + 1;
  }
  
  if (distance <= 0) {
    // Aktuelt og tidligere billeder - forbliver fuldt synlige (beskytter mod at baggrund blottes)
    clipPath = 'inset(0% 0% 0% 0%)';
  } else if (distance === 1) {
    // Næste billede - bliver afsløret fra bunden med easing
    // Brug en blødere easeInOutSine kurve
    const easedProgress = -(Math.cos(Math.PI * transitionProgress) - 1) / 2;
    const bottomInset = 100 - (easedProgress * 100);
    clipPath = `inset(0% 0% ${bottomInset}% 0%)`;
  } else {
    // Kommende billeder længere fremme - skjul dem
    clipPath = 'inset(0% 0% 100% 0%)';
  }
  
  return {
    clipPath: clipPath,
    opacity: 1, // Altid fuldt synligt når det ikke er clipped
    zIndex: Math.max(0, Math.floor(zIndex)),
    willChange: 'clip-path'
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
    // Beregn end baseret på antal billeder - meget mere scroll per billede
    const scrollPerImage = 900; // viewport højder per billede (meget mere scroll)
    // Ekstra pinned tid efter sidste billede (positiv værdi = længere pin)
    const endPadding = -900;
    const totalScrollHeight = scrollPerImage * props.images.length + endPadding;
    
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: stackContainer.value,
      start: 'top top',
      end: `+=${totalScrollHeight}vh`, // Mere scroll per billede
      scrub: 0.5, // Lavere værdi = mere smooth, men lidt mere lag
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
  transition: clip-path 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  will-change: clip-path;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
</style>

