<template>
  <section class="next-section w-full min-h-screen relative bg-transparent py-12 sm:py-12 md:py-16 lg:py-20 xl:py-24 flex items-center -mt-96 sm:mt-0 z-20">
    <div class="grid-container">
      <p class="row-start-1 col-start-1 col-span-6 sm:col-start-3 sm:col-span-8 md:col-start-1 md:col-span-12 lg:col-start-1 lg:col-span-5 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6 sm:mb-0 lg:mb-0">{{ t('ai.eyebrow') }}</p>
      <h2 ref="headerText" class="row-start-2 col-start-1 col-span-5 sm:col-span-8 md:col-span-12 lg:col-span-5 text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[3rem] xl:text-[4.5rem] font-bold leading-[1.2] mb-0 text-white">
        <span v-for="(word, wordIndex) in headerTextWords" :key="wordIndex" class="word-wrapper" :class="{ 'space-wrapper': word.isSpace }" :data-word-index="wordIndex">
          <span v-for="(char, charIndex) in word.chars" :key="charIndex" :data-index="word.startIndex + charIndex" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </span>
      </h2>
      <p ref="descriptionText" class="row-start-3 sm:row-start-2 col-start-1 col-span-6 sm:col-start-3 sm:col-span-8 md:col-start-1 md:col-span-12 lg:col-start-7 lg:col-span-5 text-[1rem] sm:text-[1.3rem] leading-[1.7] text-white/90">
        {{ t('ai.description') }}
      </p>
      <button class="ai-button-responsive row-start-4 sm:row-start-3 col-[5/7] sm:col-start-8 sm:col-span-1 md:col-start-1 md:col-span-12 lg:col-start-7 lg:col-span-1 bg-[#00291A] text-[#ffffff] border-none rounded-lg font-medium cursor-pointer transition-all duration-200 ease hover:bg-[#006644] focus:outline-none focus:ring-2 focus:ring-[#006644]/50 font-sans self-end relative z-20 pointer-events-auto">{{ t('ai.button') }}</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { injectI18n } from '../composables/useI18n';

const { t, locale } = injectI18n();

// Expose header text ref så parent kan tilgå den
const headerText = ref(null);
const descriptionText = ref(null);

// Opdel teksten i ord og derefter i bogstaver - bruger oversættelse
const headerTextString = computed(() => t('ai.title'));
const headerTextWords = computed(() => {
  const text = headerTextString.value;
  const words = [];
  let currentIndex = 0;
  
  // Split på mellemrum
  const parts = text.split(/\s+/);
  
  parts.forEach((part, index) => {
    if (part.length > 0) {
      words.push({
        chars: part.split(''),
        startIndex: currentIndex,
        isSpace: false
      });
      currentIndex += part.length;
      
      // Tilføj mellemrum efter hvert ord (undtagen det sidste)
      if (index < parts.length - 1) {
        words.push({
          chars: [' '],
          startIndex: currentIndex,
          isSpace: true
        });
        currentIndex += 1;
      }
    }
  });
  
  return words;
});

// Expose ref til parent
defineExpose({
  headerText,
  descriptionText
});
</script>

<style scoped>
.char-span {
  display: inline-block;
  transition: color 0.1s ease-out;
}

.word-wrapper {
  display: inline-block;
  white-space: nowrap;
}

/* Responsive tekststørrelse for AI knappen - Mobile first */
.ai-button-responsive {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: fit-content;
  max-width: 100%;
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  word-break: keep-all;
  hyphens: none;
  box-sizing: border-box;
  /* Mobil default */
  font-size: 0.6rem;
  padding: 0.5rem 0.625rem;
  min-height: 2.25rem;
}

/* sm: 640px+ */
@media (min-width: 640px) {
  .ai-button-responsive {
    font-size: 0.65rem;
    padding: 0.5rem 0.75rem;
    min-height: 2.5rem;
  }
}

/* md: 768px+ */
@media (min-width: 768px) {
  .ai-button-responsive {
    font-size: 0.7rem;
    padding: 0.5rem 0.875rem;
    min-height: 2.5rem;
  }
}

/* ===========================================
   FLUID RESPONSIVE - FlowmateAI
   =========================================== */

/* Eyebrow - FLUID */
.next-section p:first-child {
  font-size: clamp(0.6rem, 0.4rem + 0.25vw, 1.2rem) !important;
}

/* H2 - FLUID */
.next-section h2 {
  font-size: clamp(1.5rem, 0.5rem + 2.5vw, 4.5rem) !important;
}

/* Description - FLUID */
.next-section p:nth-of-type(2) {
  font-size: clamp(1rem, 0.7rem + 0.5vw, 2rem) !important;
}

/* Button - FLUID */
.ai-button-responsive {
  font-size: clamp(0.7rem, 0.5rem + 0.25vw, 1rem) !important;
  min-height: clamp(2rem, 1.5rem + 0.75vw, 3.5rem) !important;
  padding: clamp(0.4rem, 0.3rem + 0.2vw, 0.75rem) clamp(0.875rem, 0.5rem + 0.4vw, 1.5rem) !important;
}

/* xl: 1280px+ - Layout kun */
@media (min-width: 1280px) {
  .next-section h2 .word-wrapper:not(.space-wrapper) {
    margin-right: 0.3em;
  }
  .next-section h2 .word-wrapper.space-wrapper {
    display: none;
  }
}
</style>

