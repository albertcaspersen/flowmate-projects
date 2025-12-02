<template>
  <section class="faq-section w-full min-h-screen relative bg-transparent pt-0 pb-24 flex items-center lg:pb-20 md:pb-16 sm:pb-12 -mt-[5rem] lg:-mt-[5rem] md:-mt-8 sm:-mt-6 max-[480px]:-mt-6">
    <div class="grid-container">
      <!-- Row 1: FAQ Eyebrow -->
      <p class="col-start-1 col-span-5 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-0 row-[1]">
        FAQ
      </p>
      
      <!-- Row 2: FAQ Header -->
      <h2 ref="faqHeader" class="col-start-1 col-span-5 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] font-bold leading-[1.2] mb-8 text-white row-[2]">
        <span v-for="(char, index) in faqHeaderChars" :key="index" :data-index="index" class="char-span">
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
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
            <span class="absolute -top-1 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
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
            <span class="absolute -top-1 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
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
            <span class="absolute -top-1 right-0 text-white text-4xl font-light transition-transform duration-300 leading-none">
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
import { ref } from 'vue';

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

// Opdel teksten i individuelle bogstaver
const faqHeaderString = 'Spørgsmål & svar';
const faqHeaderChars = faqHeaderString.split('');

// Expose ref til parent
defineExpose({
  faqHeader,
  faqImage,
  faqSquares
});

const toggleItem = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};

const faqItems = [
  {
    question: 'Hvad er Flowmate?',
    answer: 'Flowmate er en realtime frontend editor til headless websites, der gør det nemt at redigere og opdatere dit website uden tekniske vanskeligheder.'
  },
  {
    question: 'Hvad består et Flowmate-site af?',
    answer: 'Et Flowmate-site består af moderne headless teknologi, der kombinerer fleksibilitet med nem redigering. Vi håndterer design, udvikling, hosting og sikkerhed.'
  },
  {
    question: 'Hvordan fungerer Flowmate i praksis?',
    answer: 'Med Flowmates realtime editor kan du se ændringer med det samme, mens du redigerer. Det er intuitivt og kræver ingen tekniske færdigheder.'
  },
  {
    question: 'Hvem er Flowmate til?',
    answer: 'Flowmate er perfekt til virksomheder, der vil have et professionelt website uden hovedpiner. Vi klarer alt det tekniske, så du kan fokusere på din forretning.'
  },
  {
    question: 'Hvor hurtigt kan jeg komme i gang?',
    answer: 'Du kan komme i gang hurtigt! Kontakt os, og vi finder en løsning, der passer til dine behov og tidslinje.'
  },
  {
    question: 'Hvordan adskiller Flowmate sig fra andre website builders?',
    answer: 'Flowmate kombinerer fleksibiliteten i headless teknologi med nemheden i en realtime editor. Vi håndterer også hosting, compliance og sikkerhed, så du ikke skal bekymre dig om tekniske detaljer.'
  }
];
</script>

<style scoped>
/* Grid positioning for squares - cannot be done with Tailwind nth-child selectors */
.faq-square {
  height: 280px; /* Fast højde så teksten kan være der */
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
</style>

