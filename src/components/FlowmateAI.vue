<template>
  <section class="next-section w-full min-h-screen relative bg-transparent py-24 flex items-center lg:py-20 md:py-16 sm:py-12 max-sm:-mt-96 z-20">
    <div class="grid-container">
      <p class="row-start-1 col-start-3 col-span-8 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:col-start-1 max-sm:col-span-6 text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6 max-sm:mb-6">FLOWMATE MED AI</p>
      <h2 ref="headerText" class="row-start-2 col-start-3 col-span-8 lg:col-start-1 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:col-[1/6] text-[2rem] lg:text-[1.75rem] md:text-[1.5rem] sm:text-[1.25rem] max-sm:text-[1.5rem] font-bold leading-[1.2] mb-0 text-white">
        <span v-for="(char, index) in headerTextChars" :key="index" :data-index="index" class="char-span">
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
      </h2>
      <p ref="descriptionText" class="row-start-2 col-start-3 col-span-8 lg:col-start-7 lg:col-span-5 md:col-start-1 md:col-span-12 max-sm:row-start-3 max-sm:col-start-1 max-sm:col-span-6 text-[1.3rem] max-sm:text-[1rem] leading-[1.7] text-white/90">
        Ved hånden har du altid vores AI, som assisterer dig med at skabe lige netop dét, som du ønsker. Om du skal
        skrive tekster, gentænke sidens brugerrejse eller bare få kreative inputs, så hjælper Flowmates AI dig hurtigt
        og effektivt.
      </p>
      <button class="row-start-3 col-start-8 col-span-1 bg-[rgb(115,102,87)] text-[#ffffff] border-none rounded-lg p-[10px] max-sm:px-0 max-sm:py-[10px] text-[0.95rem] font-medium cursor-pointer transition-all duration-200 ease hover:bg-[rgb(199,179,153)] focus:outline-none focus:ring-2 focus:ring-[rgb(199,179,153)]/50 font-sans lg:col-start-7 lg:col-span-1 md:col-start-1 md:col-span-12 max-sm:row-start-4 max-sm:col-[5/7] h-[3rem] max-sm:h-[2.5rem] self-end relative z-20 pointer-events-auto">Prøv i dag</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

// Expose header text ref så parent kan tilgå den
const headerText = ref(null);
const descriptionText = ref(null);

// Opdel teksten i individuelle bogstaver
const headerTextString = 'Med Flowmates AI bliver du endnu mere effektiv.';
const headerTextChars = headerTextString.split('');

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
</style>

