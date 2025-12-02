<template>
  <section class="quote-section w-full min-h-screen relative bg-transparent py-24 flex items-center lg:py-20 md:py-16 sm:py-12">
    <div class="grid-container">
      <div class="quote-content row-start-1 col-start-3 col-span-4 lg:col-start-7 lg:col-span-5 md:col-start-1 md:col-span-12 md:row-start-1 max-sm:col-start-1 max-sm:col-span-6 max-sm:row-start-2 relative z-10">
        <blockquote ref="quoteText" class="quote-text text-[2rem] lg:text-[3rem] md:text-[1.5rem] sm:text-[1.25rem] font-medium leading-[1.4] mb-6 text-white italic mt-52 max-sm:mt-0">
          <template v-for="(char, index) in quoteTextChars" :key="index">
            <span v-if="isRedigereStart(index)" class="no-break">
              <span v-for="(c, i) in getRedigereChars(index)" :key="i" :data-index="index + i" class="char-span">
                {{ c === ' ' ? '\u00A0' : c }}
              </span>
            </span>
            <span v-else-if="!isInRedigere(index)" :data-index="index" class="char-span">
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </template>
        </blockquote>
        <p class="quote-author text-base lg:text-sm md:text-sm sm:text-sm font-medium text-white/80">
          Katrine S. Hansen, Social Media & PR
        </p>
      </div>
      <div class="quote-video row-start-1 col-start-7 col-span-5 lg:col-start-5 lg:col-span-4 md:col-start-1 md:col-span-12 md:row-start-1 md:mt-0 max-sm:col-start-1 max-sm:col-span-6 max-sm:row-start-1">
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
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const videoSrc = 'https://flowmate.dk/wp-content/uploads/2025/05/flowmate-moller-rothe.mp4';

// Expose quote text ref så parent kan tilgå den
const quoteText = ref(null);
const quoteVideo = ref(null);

// Opdel teksten i individuelle bogstaver
const quoteTextString = '"Med Flowmate er det blevet nemmere end nogenside at redigere vores website."';
const quoteTextChars = quoteTextString.split('');

// Find position af "redigere" i teksten (case-insensitive)
const redigereStart = computed(() => {
  const lowerText = quoteTextString.toLowerCase();
  const index = lowerText.indexOf('redigere');
  return index >= 0 ? index : -1;
});

const redigereEnd = computed(() => {
  return redigereStart.value >= 0 ? redigereStart.value + 8 : -1; // "redigere" er 8 tegn
});

// Tjek om index er starten af "redigere"
const isRedigereStart = (index) => {
  return index === redigereStart.value;
};

// Tjek om index er inde i "redigere" ordet
const isInRedigere = (index) => {
  return redigereStart.value >= 0 && index > redigereStart.value && index < redigereEnd.value;
};

// Hent alle karakterer i "redigere" ordet
const getRedigereChars = (startIndex) => {
  return quoteTextChars.slice(startIndex, startIndex + 8);
};

// Expose ref til parent
defineExpose({
  quoteText,
  quoteVideo
});
</script>

<style scoped>
.no-break {
  white-space: nowrap;
  display: inline;
}
</style>

