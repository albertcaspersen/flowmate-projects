<template>
  <section class="domain-check-section w-full min-h-screen relative bg-transparent py-6 flex items-center lg:py-5 md:py-4 sm:py-3">
    <div class="grid-container">
      <!-- Left side: Eyebrow and Header -->
      <div class="domain-check-left row-[1] col-start-1 col-span-5 lg:col-start-1 lg:col-span-6 md:col-start-1 md:col-span-12">
        <p ref="eyebrow" class="domain-check-eyebrow text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-6">
          DOMAIN CHECKER
        </p>
        <h2 ref="domainCheckHeader" class="domain-check-header text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] font-bold leading-[1.2] mb-8 text-white relative z-10">
          <span v-for="(char, index) in domainCheckHeaderCharsPart1" :key="`part1-${index}`" :data-index="index" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
          <br />
          <span v-for="(char, index) in domainCheckHeaderCharsPart2" :key="`part2-${index}`" :data-index="index + domainCheckHeaderCharsPart1.length" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </h2>
      </div>

      <!-- Right side: Domain Check Form -->
      <div class="domain-check-right">
        <h3 ref="checkTitle" class="check-title text-white text-xl font-semibold mb-8">
          Check Domain Availability
        </h3>
        <div ref="domainCheckForm" class="domain-check-form mb-6">
          <input
            ref="domainInput"
            type="text"
            v-model="domainName"
            placeholder="Enter domain name"
            class="domain-input bg-white rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[rgb(255,100,255)]/50"
          />
          <button
            ref="searchButton"
            @click="checkDomain"
            class="search-button bg-[rgb(38,115,179)] text-[#ffffff] border-none rounded-lg px-6 py-3 text-base font-medium cursor-pointer transition-all duration-200 ease hover:bg-[rgb(13,51,89)] focus:outline-none focus:ring-2 focus:ring-[rgb(255,100,255)]/50 whitespace-nowrap"
          >
            Search
          </button>
        </div>
        <p ref="domainNote" class="domain-note text-sm text-gray-400">
          Only .dk domains are currently supported.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const domainName = ref('');

// Expose domain check header ref så parent kan tilgå den
const domainCheckHeader = ref(null);
const eyebrow = ref(null);
const checkTitle = ref(null);
const domainCheckForm = ref(null);
const domainInput = ref(null);
const searchButton = ref(null);
const domainNote = ref(null);

// Opdel teksten i individuelle bogstaver
// Opdel i to dele med linjeskift efter "Lad os komme i gang -"
const domainCheckHeaderStringPart1 = 'Lad os komme i gang -';
const domainCheckHeaderStringPart2 = 'hvad er dit domæne?';
const domainCheckHeaderCharsPart1 = domainCheckHeaderStringPart1.split('');
const domainCheckHeaderCharsPart2 = domainCheckHeaderStringPart2.split('');

// Expose ref til parent
defineExpose({
  domainCheckHeader,
  eyebrow,
  checkTitle,
  domainCheckForm,
  domainInput,
  searchButton,
  domainNote
});

const checkDomain = () => {
  // Domain check logic will go here
  console.log('Checking domain:', domainName.value);
};
</script>

<style scoped>
.domain-check-section {
  background-color: transparent;
  position: relative;
  overflow: hidden;
}

.domain-check-section .grid-container {
  margin-top: -30rem;
  position: relative;
  z-index: 1;
}

.domain-check-left {
  display: flex;
  flex-direction: column;
  grid-row: 1;
  position: relative;
  z-index: 1;
}

.domain-check-right {
  display: flex;
  flex-direction: column;
  grid-row: 1 !important;
  grid-column: 7 / 12;/* Spænder fra kolonne 7 til 11 (12 er eksklusiv) */
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .domain-check-right {
    grid-column: 6 / 11 !important; /* Behold samme spænd på tablet */
  }
}

@media (max-width: 768px) {
  .domain-check-right {
    grid-column: 1 / 13 !important; /* Fuld bredde på mobile */
    margin-top: 3rem;
  }
}

.domain-check-form {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  align-items: stretch;
}

.domain-input {
  grid-column: 1 / 5; /* Spænder over de første 4 kolonner (7-10) */
  min-height: 3rem;
}

.search-button {
  grid-column: 5 / 6; /* Spænder over kolonne 5 (11) */
  min-height: 3rem;
}

@media (max-width: 768px) {
  .domain-check-form {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .domain-input {
    grid-column: 1 / -1;
  }
  
  .search-button {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>

