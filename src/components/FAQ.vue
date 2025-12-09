<template>
  <section class="faq-section w-full min-h-screen relative bg-transparent pt-0 pb-24 flex items-center lg:pb-20 md:pb-16 sm:pb-12 -mt-[5rem] lg:-mt-[5rem] md:-mt-8 sm:-mt-6 max-[480px]:-mt-6">
    <div class="grid-container">
      <!-- Row 1: FAQ Eyebrow -->
      <p class="col-start-1 col-span-5 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-0 max-sm:mb-6 row-[1]">
        {{ t('faq.eyebrow') }}
      </p>
      
      <!-- Row 2: FAQ Header -->
      <h2 ref="faqHeader" class="col-start-1 col-span-5 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] font-bold leading-[1.2] mb-8 text-white row-[2]">
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
            class="faq-square bg-[rgba(115,102,87,0.8)] rounded-2xl p-6 cursor-pointer transition-[background-color,transform] duration-500 ease-out flex flex-col justify-start hover:bg-[rgba(199,179,153,0.6)] hover:-translate-y-0.5"
        :class="{ 'is-open bg-[rgba(199,179,153,0.7)]': openIndex === index }"
        @click="toggleItem(index)"
      >
        <div class="w-full h-full flex flex-col">
          <div class="flex-shrink-0 relative">
            <h3 class="font-semibold text-lg mb-3 text-white leading-[1.4] pr-12">
              {{ faqItems[index].question }}
            </h3>
            <span class="absolute -top-2 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
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
            class="faq-square bg-[rgba(115,102,87,0.8)] rounded-2xl p-6 cursor-pointer transition-[background-color,transform] duration-500 ease-out flex flex-col justify-start hover:bg-[rgba(199,179,153,0.6)] hover:-translate-y-0.5"
        :class="{ 'is-open bg-[rgba(199,179,153,0.7)]': openIndex === index }"
        @click="toggleItem(index)"
      >
        <div class="w-full h-full flex flex-col">
          <div class="flex-shrink-0 relative">
            <h3 class="font-semibold text-lg mb-3 text-white leading-[1.4] pr-12">
              {{ faqItems[index].question }}
            </h3>
            <span class="absolute -top-2 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
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
            class="faq-square bg-[rgba(115,102,87,0.8)] rounded-2xl p-6 cursor-pointer transition-[background-color,transform] duration-500 ease-out flex flex-col justify-start hover:bg-[rgba(199,179,153,0.6)] hover:-translate-y-0.5"
        :class="{ 'is-open bg-[rgba(199,179,153,0.7)]': openIndex === index }"
        @click="toggleItem(index)"
      >
        <div class="w-full h-full flex flex-col">
          <div class="flex-shrink-0 relative">
            <h3 class="font-semibold text-lg mb-3 text-white leading-[1.4] pr-12">
              {{ faqItems[index].question }}
            </h3>
            <span class="absolute -top-2 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
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

.faq-square:nth-child(3) {
  grid-row: 2;
  grid-column: 4 / 7;
}

.faq-square:nth-child(4) {
  grid-row: 2;
  grid-column: 7 / 10;
}

.faq-square:nth-child(5) {
  grid-row: 3;
  grid-column: 4 / 7;
}

.faq-square:nth-child(6) {
  grid-row: 3;
  grid-column: 7 / 10;
}

.faq-square:nth-child(7) {
  grid-row: 3;
  grid-column: 10 / 13;
}

.faq-square:nth-child(8) {
  grid-row: 2;
  grid-column: 10 / 13;
}

@media (max-width: 768px) {
  .faq-square:nth-child(3),
  .faq-square:nth-child(4),
  .faq-square:nth-child(5),
  .faq-square:nth-child(6),
  .faq-square:nth-child(7),
  .faq-square:nth-child(8) {
    grid-column: 1 / -1;
  }
  
  .faq-square:nth-child(3) {
    grid-row: 3;
  }
  
  .faq-square:nth-child(4) {
    grid-row: 4;
  }
  
  .faq-square:nth-child(5) {
    grid-row: 5;
  }
  
  .faq-square:nth-child(6) {
    grid-row: 6;
  }
  
  .faq-square:nth-child(7) {
    grid-row: 7;
  }
  
  .faq-square:nth-child(8) {
    grid-row: 8;
  }
}

/* Reducer font-størrelse på overskrifter og tekst i FAQ kort til MacBook Pro 14" */
@media (min-width: 1024px) and (max-width: 1700px) {
  .faq-section h2 {
    font-size: 2.5rem;
  }
  .faq-square h3 {
    font-size: 0.9rem;
  }
  .faq-square p {
    font-size: 0.8rem;
  }
}
</style>

