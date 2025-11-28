<template>
  <div class="contents">
    <!-- Feature Box 1 -->
    <slot name="feature-box-1-content">
      <div class="flex flex-col items-start gap-4 row-[1] col-[1/4] lg:col-[7/10] md:col-[1/7] max-[480px]:col-[1/13]">
        <div ref="icon1" class="icon-container w-12 h-12 bg-[rgba(3,10,20,0.8)] rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[rgba(38,115,179,0.3)]">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <h3 ref="title1" class="text-2xl font-bold text-white m-0 leading-tight lg:text-xl max-[480px]:text-lg font-sans">
          Nemt og uden bøvl
        </h3>
        <p ref="description1" class="text-base leading-relaxed text-white/85 m-0 font-normal font-sans lg:text-[0.95rem] max-[480px]:text-[0.9rem]">
          Med Flowmate tager vi os af design og opdatering af indhold. Du kan læne dig tilbage, slappe af og fokusere på din forretning.
        </p>
      </div>
    </slot>

    <!-- Feature Box 2 -->
    <slot name="feature-box-2-content">
      <div class="flex flex-col items-start gap-4 row-[1] col-[4/7] lg:col-[10/13] md:col-[7/13] max-[480px]:col-[1/13]">
        <div ref="icon2" class="icon-container w-12 h-12 bg-[rgba(3,10,20,0.8)] rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[rgba(38,115,179,0.3)]">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <h3 ref="title2" class="text-2xl font-bold text-white m-0 leading-tight lg:text-xl max-[480px]:text-lg font-sans">
          Hosting og sikkerhed
        </h3>
        <p ref="description2" class="text-base leading-relaxed text-white/85 m-0 font-normal font-sans lg:text-[0.95rem] max-[480px]:text-[0.9rem]">
          Vi håndterer hosting og sikkerhed, så du ikke behøver at bekymre dig om tekniske detaljer. Alt kører sikkert og stabilt i baggrunden.
        </p>
      </div>
    </slot>

    <!-- Feature Box 3 -->
    <slot name="feature-box-3-content">
      <div class="flex flex-col items-start gap-4 row-[2] col-[7/10] lg:col-[7/10] md:col-[1/7] max-[480px]:col-[1/13]">
        <div ref="icon3" class="icon-container w-12 h-12 bg-[rgba(3,10,20,0.8)] rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[rgba(38,115,179,0.3)]">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 ref="title3" class="text-2xl font-bold text-white m-0 leading-tight lg:text-xl max-[480px]:text-lg font-sans">
          Altid klar til at hjælpe
        </h3>
        <p ref="description3" class="text-base leading-relaxed text-white/85 m-0 font-normal font-sans lg:text-[0.95rem] max-[480px]:text-[0.9rem]">
          Vi er her, når du har brug for os med hurtige svar og rigtige mennesker i den anden ende. Dine spørgsmål er vigtige, så vi leverer kreativ teknologi med menneskelig tilgang.
        </p>
      </div>
    </slot>

    <!-- Feature Box 4 -->
    <slot name="feature-box-4-content">
      <div class="flex flex-col items-start gap-4 row-[2] col-[10/13] lg:col-[10/13] md:col-[7/13] max-[480px]:col-[1/13]">
        <div ref="icon4" class="icon-container w-12 h-12 bg-[rgba(3,10,20,0.8)] rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-[rgba(38,115,179,0.3)]">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <h3 ref="title4" class="text-2xl font-bold text-white m-0 leading-tight lg:text-xl max-[480px]:text-lg font-sans">
          Fleksibel redigering
        </h3>
        <p ref="description4" class="text-base leading-relaxed text-white/85 m-0 font-normal font-sans lg:text-[0.95rem] max-[480px]:text-[0.9rem]">
          Opdatér dit indhold, når det passer dig. Vi klarer det gerne for dig, eller du kan selv tage styringen med Flowmates realtime editor.
        </p>
      </div>
    </slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const icon1 = ref(null);
const icon2 = ref(null);
const icon3 = ref(null);
const icon4 = ref(null);
const title1 = ref(null);
const title2 = ref(null);
const title3 = ref(null);
const title4 = ref(null);
const description1 = ref(null);
const description2 = ref(null);
const description3 = ref(null);
const description4 = ref(null);

// Expose refs til parent
defineExpose({
  icon1,
  icon2,
  icon3,
  icon4,
  title1,
  title2,
  title3,
  title4,
  description1,
  description2,
  description3,
  description4
});
</script>

<style scoped>
.icon-container,
h3,
p {
  opacity: 0;
  transform: translateY(50px);
}
</style>

