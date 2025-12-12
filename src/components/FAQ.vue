<template>
  <section class="faq-section w-full min-h-screen relative bg-transparent pt-0 pb-12 sm:pb-12 md:pb-16 lg:pb-20 xl:pb-24 flex items-center -mt-6 sm:-mt-6 md:-mt-8 lg:-mt-[5rem]">
    <div class="grid-container">
      <!-- Row 1: FAQ Eyebrow -->
      <p class="col-start-1 col-span-6 md:col-span-3 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6 sm:mb-0 row-[1]">
        {{ t('faq.eyebrow') }}
      </p>
      
      <!-- Row 2: FAQ Header -->
      <h2 ref="faqHeader" class="col-start-1 col-span-6 md:col-span-3 text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[3rem] xl:text-[4.5rem] font-bold leading-[1.2] mb-8 text-white row-[2]">
        <template v-for="(word, wordIndex) in faqHeaderWords" :key="wordIndex">
          <br v-if="word.isLineBreak" />
          <span v-else class="word-wrapper" :data-word-index="wordIndex">
            <span v-for="(char, charIndex) in word.chars" :key="charIndex" :data-index="word.startIndex + charIndex" class="char-span">
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </span>
        </template>
      </h2>
      
      <!-- Row 3: First 2 squares -->
      <div
        v-for="index in [0, 1]"
        :key="index"
        :ref="el => setFaqSquareRef(el, index)"
            class="faq-square bg-[rgba(0,41,26,0.8)] rounded-2xl p-6 cursor-pointer transition-[background-color,transform] duration-500 ease-out flex flex-col justify-start hover:bg-[rgba(0,30,20,0.9)] hover:-translate-y-0.5"
        :class="{ 'is-open bg-[rgba(0,25,16,0.95)]': openIndex === index }"
        @click="toggleItem(index)"
      >
        <div class="w-full h-full flex flex-col">
          <div class="flex-shrink-0 relative">
            <h3 class="font-semibold text-lg mb-3 text-white leading-[1.4] pr-12">
              {{ faqItems[index].question }}
            </h3>
            <span class="faq-toggle-icon absolute -top-2 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
              {{ openIndex === index ? '−' : '+' }}
            </span>
          </div>
          <div 
            class="flex-1 flex items-start transition-[opacity,max-height,margin-top] duration-500 ease-out overflow-hidden mt-4"
            :class="{ 'max-h-0 opacity-0 mt-0': openIndex !== index, 'opacity-100 max-h-[200px]': openIndex === index }"
          >
            <p class="text-white/80 text-base leading-relaxed pb-2">
              {{ faqItems[index].answer }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Row 4: Next 2 squares -->
      <div
        v-for="index in [2, 3]"
        :key="index"
        :ref="el => setFaqSquareRef(el, index)"
            class="faq-square bg-[rgba(0,41,26,0.8)] rounded-2xl p-6 cursor-pointer transition-[background-color,transform] duration-500 ease-out flex flex-col justify-start hover:bg-[rgba(0,30,20,0.9)] hover:-translate-y-0.5"
        :class="{ 'is-open bg-[rgba(0,25,16,0.95)]': openIndex === index }"
        @click="toggleItem(index)"
      >
        <div class="w-full h-full flex flex-col">
          <div class="flex-shrink-0 relative">
            <h3 class="font-semibold text-lg mb-3 text-white leading-[1.4] pr-12">
              {{ faqItems[index].question }}
            </h3>
            <span class="faq-toggle-icon absolute -top-2 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
              {{ openIndex === index ? '−' : '+' }}
            </span>
          </div>
          <div 
            class="flex-1 flex items-start transition-[opacity,max-height,margin-top] duration-500 ease-out overflow-hidden mt-4"
            :class="{ 'max-h-0 opacity-0 mt-0': openIndex !== index, 'opacity-100 max-h-[200px]': openIndex === index }"
          >
            <p class="text-white/80 text-base leading-relaxed pb-2">
              {{ faqItems[index].answer }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Row 5: Last 2 squares -->
      <div
        v-for="index in [4, 5]"
        :key="index"
        :ref="el => setFaqSquareRef(el, index)"
            class="faq-square bg-[rgba(0,41,26,0.8)] rounded-2xl p-6 cursor-pointer transition-[background-color,transform] duration-500 ease-out flex flex-col justify-start hover:bg-[rgba(0,30,20,0.9)] hover:-translate-y-0.5"
        :class="{ 'is-open bg-[rgba(0,25,16,0.95)]': openIndex === index }"
        @click="toggleItem(index)"
      >
        <div class="w-full h-full flex flex-col">
          <div class="flex-shrink-0 relative">
            <h3 class="font-semibold text-lg mb-3 text-white leading-[1.4] pr-12">
              {{ faqItems[index].question }}
            </h3>
            <span class="faq-toggle-icon absolute -top-2 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
              {{ openIndex === index ? '−' : '+' }}
            </span>
          </div>
          <div 
            class="flex-1 flex items-start transition-[opacity,max-height,margin-top] duration-500 ease-out overflow-hidden mt-4"
            :class="{ 'max-h-0 opacity-0 mt-0': openIndex !== index, 'opacity-100 max-h-[200px]': openIndex === index }"
          >
            <p class="text-white/80 text-base leading-relaxed pb-2">
              {{ faqItems[index].answer }}
            </p>
          </div>
        </div>
      </div>


    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { injectI18n } from '../composables/useI18n';

const { t, locale } = injectI18n();

const openIndex = ref(null);

// Expose FAQ header ref så parent kan tilgå den
const faqHeader = ref(null);
const faqImage = ref(null);
const faqSquares = ref([]);

// Funktion til at sætte refs for FAQ kvadrater
const setFaqSquareRef = (el, index) => {
  if (el) {
    faqSquares.value[index] = el;
  }
};

// Opdel teksten i ord og derefter i bogstaver
const faqHeaderString = computed(() => t('faq.title'));
const faqHeaderWords = computed(() => {
  const text = faqHeaderString.value;
  const words = [];
  let currentIndex = 0;
  
  // Split på mellemrum
  const parts = text.split(/\s+/);
  
  parts.forEach((part, index) => {
    if (part.length > 0) {
      // På engelsk: tilføj linjeskift før "Answers"
      if (locale.value === 'en' && part.toLowerCase() === 'answers' && index > 0) {
        words.push({
          isLineBreak: true,
          startIndex: currentIndex
        });
      }
      
      words.push({
        chars: part.split(''),
        startIndex: currentIndex,
        isSpace: false,
        isLineBreak: false
      });
      currentIndex += part.length;
      
      // Tilføj mellemrum efter hvert ord (undtagen det sidste)
      if (index < parts.length - 1) {
        words.push({
          chars: [' '],
          startIndex: currentIndex,
          isSpace: true,
          isLineBreak: false
        });
        currentIndex += 1;
      }
    }
  });
  
  return words;
});
const faqItems = computed(() => t('faq.items'));

// Expose ref til parent
defineExpose({
  faqHeader,
  faqImage,
  faqSquares
});

const toggleItem = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>

<style scoped>
.word-wrapper {
  display: inline-block;
  white-space: nowrap;
}

/* Grid positioning for squares - cannot be done with Tailwind nth-child selectors */
.faq-square {
  height: 17.5rem; /* Fast højde så teksten kan være der */
  transition: background-color 500ms ease-out, transform 500ms ease-out;
}

/* Row 2: First 3 squares - kolonner 7-13 */
.faq-square:nth-child(3) {
  grid-row: 2;
  grid-column: 7 / 9;
}

.faq-square:nth-child(4) {
  grid-row: 2;
  grid-column: 9 / 11;
}

.faq-square:nth-child(8) {
  grid-row: 2;
  grid-column: 11 / 13;
}

/* Row 3: Next 3 squares - kolonner 7-13 */
.faq-square:nth-child(5) {
  grid-row: 3;
  grid-column: 7 / 9;
}

.faq-square:nth-child(6) {
  grid-row: 3;
  grid-column: 9 / 11;
}

.faq-square:nth-child(7) {
  grid-row: 3;
  grid-column: 11 / 13;
}

/* Mobil default: alle squares i fuld bredde, stables vertikalt */
.faq-square:nth-child(3),
.faq-square:nth-child(4),
.faq-square:nth-child(5),
.faq-square:nth-child(6),
.faq-square:nth-child(7),
.faq-square:nth-child(8) {
  grid-column: 1 / -1;
}

.faq-square:nth-child(3) { grid-row: 3; }
.faq-square:nth-child(4) { grid-row: 4; }
.faq-square:nth-child(5) { grid-row: 5; }
.faq-square:nth-child(6) { grid-row: 6; }
.faq-square:nth-child(7) { grid-row: 7; }
.faq-square:nth-child(8) { grid-row: 8; }

/* md: 768px+ - Desktop layout: 3 kort per række, 3 kolonner brede */
@media (min-width: 768px) {
  /* Row 2: Første 3 kort */
  .faq-square:nth-child(3) { grid-row: 2; grid-column: 4 / 7; }
  .faq-square:nth-child(4) { grid-row: 2; grid-column: 7 / 10; }
  .faq-square:nth-child(8) { grid-row: 2; grid-column: 10 / 13; }
  /* Row 3: Næste 3 kort */
  .faq-square:nth-child(5) { grid-row: 3; grid-column: 4 / 7; }
  .faq-square:nth-child(6) { grid-row: 3; grid-column: 7 / 10; }
  .faq-square:nth-child(7) { grid-row: 3; grid-column: 10 / 13; }
}

/* ===========================================
   FLUID RESPONSIVE - FAQ
   =========================================== */

/* Eyebrow - FLUID */
.faq-section p:first-child {
  font-size: clamp(0.6rem, 0.4rem + 0.25vw, 1.2rem) !important;
}

/* H2 - FLUID */
.faq-section h2 {
  font-size: clamp(1.5rem, 0.5rem + 2.5vw, 4.5rem) !important;
}

/* FAQ card title - FLUID */
.faq-square h3 {
  font-size: clamp(0.6rem, 0.3rem + 0.6vw, 1.7rem) !important;
}

/* FAQ card height - FLUID */
.faq-square {
  height: clamp(10rem, 8rem + 5vw, 20rem) !important;
}

/* FAQ card description - FLUID */
.faq-square p {
  font-size: clamp(0.7rem, 0.5rem + 0.2vw, 1rem);
}

/* Toggle icon - FLUID */
.faq-toggle-icon {
  font-size: clamp(1.5rem, 1rem + 1vw, 3rem) !important;
}
</style>

