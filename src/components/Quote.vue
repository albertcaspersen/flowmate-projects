<template>
  <section ref="quoteSection" class="quote-section w-full min-h-screen relative bg-transparent py-12 sm:py-12 md:py-16 lg:py-20 xl:py-24 flex items-center">
    <div class="grid-container">
      <div class="quote-content row-start-2 sm:row-start-1 col-start-1 col-span-6 sm:col-start-3 sm:col-span-4 md:col-start-1 md:col-span-12 lg:col-start-7 lg:col-span-5 relative z-10">
        <blockquote ref="quoteText" class="quote-text text-[1.25rem] sm:text-[1.25rem] md:text-[1.5rem] lg:text-[3rem] xl:text-[2rem] font-medium leading-[1.4] mb-6 text-white italic mt-0 sm:mt-52">
          <span v-for="(word, wordIndex) in quoteTextWords" :key="wordIndex" class="word-wrapper" :class="{ 'no-break': word.isHighlight }" :data-word-index="wordIndex">
            <span v-for="(char, charIndex) in word.chars" :key="charIndex" :data-index="word.startIndex + charIndex" class="char-span">
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </span>
        </blockquote>
        <p class="quote-author text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base font-medium text-white/80">
          {{ t('quote.author') }}
        </p>
      </div>
      <div class="quote-video row-start-1 col-start-1 col-span-6 sm:col-start-7 sm:col-span-5 md:col-start-1 md:col-span-12 lg:col-start-4 lg:col-span-4">
        <div ref="videoWrapper" class="video-wrapper">
          <video 
            ref="quoteVideo"
            class="w-full h-auto rounded-lg"
            :src="videoSrc"
            autoplay
            loop
            muted
            playsinline
          ></video>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { injectI18n } from '../composables/useI18n';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const { t, locale } = injectI18n();

const videoSrc = 'https://flowmate.dk/wp-content/uploads/2025/05/flowmate-moller-rothe.mp4';

// Expose quote text ref så parent kan tilgå den
const quoteText = ref(null);
const quoteVideo = ref(null);
const videoWrapper = ref(null);
const quoteSection = ref(null);
let scrollTriggerInstance = null;

// Opdel teksten i ord og derefter i bogstaver - bruger oversættelse
const quoteTextString = computed(() => t('quote.text'));
const quoteTextChars = computed(() => quoteTextString.value.split(''));

// Find position af "redigere"/"edit" i teksten (case-insensitive)
const highlightWord = computed(() => locale.value === 'da' ? 'redigere' : 'edit');
const highlightWordLength = computed(() => highlightWord.value.length);

const highlightStart = computed(() => {
  const lowerText = quoteTextString.value.toLowerCase();
  const index = lowerText.indexOf(highlightWord.value);
  return index >= 0 ? index : -1;
});

const highlightEnd = computed(() => {
  return highlightStart.value >= 0 ? highlightStart.value + highlightWordLength.value : -1;
});

// Opdel teksten i ord og markér highlight ordet
const quoteTextWords = computed(() => {
  const text = quoteTextString.value;
  const words = [];
  let currentIndex = 0;
  
  // Split på mellemrum
  const parts = text.split(/\s+/);
  
  parts.forEach((part, index) => {
    if (part.length > 0) {
      const wordStartIndex = currentIndex;
      const wordEndIndex = currentIndex + part.length;
      
      // Tjek om dette ord indeholder eller er highlight ordet
      const isHighlight = highlightStart.value >= 0 && 
                          wordStartIndex <= highlightStart.value && 
                          highlightEnd.value <= wordEndIndex;
      
      words.push({
        chars: part.split(''),
        startIndex: currentIndex,
        isSpace: false,
        isHighlight: isHighlight
      });
      currentIndex += part.length;
      
      // Tilføj mellemrum efter hvert ord (undtagen det sidste)
      if (index < parts.length - 1) {
        words.push({
          chars: [' '],
          startIndex: currentIndex,
          isSpace: true,
          isHighlight: false
        });
        currentIndex += 1;
      }
    }
  });
  
  return words;
});

// Setup scroll animation for video height
onMounted(() => {
  if (!videoWrapper.value || !quoteSection.value) return;

  // Vent på at videoen er loadet for at få korrekt højde
  const setupAnimation = () => {
    // Start med clip-path der skjuler videoen fra bunden (100% inset fra top)
    gsap.set(videoWrapper.value, { 
      clipPath: 'inset(100% 0% 0% 0%)'
    });

    // Opret ScrollTrigger animation
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: quoteSection.value,
      start: 'top 30%',
      once: true,
      onEnter: () => {
        gsap.to(videoWrapper.value, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          ease: 'power3.out',
          onComplete: () => {
            // Fjern inline clip-path efter animation
            gsap.set(videoWrapper.value, { clearProps: 'clipPath' });
          }
        });
      }
    });
  };

  // Hvis videoen allerede er loadet
  if (quoteVideo.value && quoteVideo.value.readyState >= 2) {
    setupAnimation();
  } else {
    // Vent på at videoen loader
    if (quoteVideo.value) {
      quoteVideo.value.addEventListener('loadeddata', setupAnimation, { once: true });
    } else {
      // Fallback hvis video ref ikke er klar endnu
      setTimeout(setupAnimation, 100);
    }
  }
});

// Cleanup ScrollTrigger når komponenten unmountes
onUnmounted(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
});

// Expose ref til parent
defineExpose({
  quoteText,
  quoteVideo
});
</script>

<style scoped>
.word-wrapper {
  display: inline-block;
  white-space: nowrap;
}

.no-break {
  white-space: nowrap;
  display: inline-block;
}

/* ===========================================
   FLUID RESPONSIVE - Quote
   =========================================== */

/* Quote text - FLUID */
.quote-text {
  font-size: clamp(1.5rem, 0.5rem + 2vw, 4rem) !important;
  margin-top: clamp(5rem, 3rem + 8vw, 21rem);
}

/* Quote author - FLUID */
.quote-author {
  font-size: clamp(0.7rem, 0.5rem + 0.3vw, 1.1rem) !important;
  margin-top: clamp(0.5rem, 0.3rem + 0.4vw, 1.5rem);
}
</style>
