<template>
  <section class="quote-section w-full min-h-screen relative bg-transparent py-24 flex items-center lg:py-20 md:py-16 sm:py-12">
    <div class="grid-container">
      <div class="quote-content row-start-1 col-start-3 col-span-4 lg:col-start-7 lg:col-span-5 md:col-start-1 md:col-span-12 md:row-start-1 relative z-10">
        <blockquote ref="quoteText" class="quote-text text-[2rem] lg:text-[3rem] md:text-[1.5rem] sm:text-[1.25rem] font-medium leading-[1.4] mb-6 text-white italic mt-52">
          <span v-for="(char, index) in quoteTextChars" :key="index" :data-index="index" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </blockquote>
        <p class="quote-author text-base lg:text-sm md:text-sm sm:text-sm font-medium text-white/80">
          Katrine S. Hansen, Social Media & PR
        </p>
      </div>
      <div class="quote-video row-start-1 col-start-7 col-span-5 lg:col-start-4 lg:col-span-4 md:col-start-1 md:col-span-12 md:row-start-1 md:mt-0">
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
import { ref } from 'vue';

const videoSrc = 'https://flowmate.dk/wp-content/uploads/2025/05/flowmate-moller-rothe.mp4';

// Expose quote text ref så parent kan tilgå den
const quoteText = ref(null);
const quoteVideo = ref(null);

// Opdel teksten i individuelle bogstaver
const quoteTextString = '"Med Flowmate er det blevet nemmere end nogenside at redigere vores website."';
const quoteTextChars = quoteTextString.split('');

// Expose ref til parent
defineExpose({
  quoteText,
  quoteVideo
});
</script>

