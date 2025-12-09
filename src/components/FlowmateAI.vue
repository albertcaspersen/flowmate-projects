<template>
  <section class="next-section w-full min-h-screen relative bg-transparent py-24 flex items-center lg:py-20 md:py-16 sm:py-12 max-sm:-mt-96 z-20">
    <div class="grid-container">
      <p class="row-start-1 col-start-3 col-span-8 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:col-start-1 max-sm:col-span-6 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-0 lg:mb-0 max-sm:mb-6">{{ t('ai.eyebrow') }}</p>
      <h2 ref="headerText" class="row-start-2 col-start-3 col-span-8 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:col-[1/6] text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] font-bold leading-[1.2] mb-0 text-white">
        <span v-for="(word, wordIndex) in headerTextWords" :key="wordIndex" class="word-wrapper" :class="{ 'space-wrapper': word.isSpace }" :data-word-index="wordIndex">
          <span v-for="(char, charIndex) in word.chars" :key="charIndex" :data-index="word.startIndex + charIndex" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </span>
      </h2>
      <p ref="descriptionText" class="row-start-2 col-start-3 col-span-8 lg:col-start-7 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:row-start-3 max-sm:col-start-1 max-sm:col-span-6 text-[1.3rem] max-sm:text-[1rem] leading-[1.7] text-white/90">
        {{ t('ai.description') }}
      </p>
      <button class="row-start-3 col-start-8 col-span-1 bg-[rgb(115,102,87)] text-[#ffffff] border-none rounded-lg p-[10px] max-sm:px-0 max-sm:py-[10px] text-[0.95rem] font-medium cursor-pointer transition-all duration-200 ease hover:bg-[rgb(199,179,153)] focus:outline-none focus:ring-2 focus:ring-[rgb(199,179,153)]/50 font-sans lg:col-start-7 lg:col-span-1 md:col-start-1 md:col-span-12 max-sm:row-start-4 max-sm:col-[5/7] h-[3rem] max-sm:h-[2.5rem] self-end relative z-20 pointer-events-auto">{{ t('ai.button') }}</button>
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

/* Reducer font-størrelse og grid-placering på overskrift til MacBook Pro 14" */
@media (min-width: 1024px) and (max-width: 1700px) {
  .next-section h2 {
    font-size: 2.5rem !important;
    grid-column: 1 / 5;
    margin-right: 0rem;
  }
  /* Skjul space-wrappers helt og brug margin til mellemrum */
  .next-section h2 .word-wrapper:not(.space-wrapper) {
    margin-right: 0.3em;
  }
  .next-section h2 .word-wrapper.space-wrapper {
    display: none;
  }
}
</style>

