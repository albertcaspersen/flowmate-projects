<template>
  <section class="domain-check-section w-full min-h-screen relative bg-transparent py-6 flex items-center lg:py-5 md:py-4 sm:py-3">
    <div class="grid-container">
      <!-- Eyebrow -->
      <p ref="eyebrow" class="domain-check-eyebrow row-[1] col-start-1 col-span-5 lg:col-start-1 lg:col-span-6 md:col-start-1 md:col-span-12 max-sm:col-start-1 max-sm:col-span-6 max-sm:row-[1] text-xs sm:text-sm font-medium tracking-wider uppercase text-white/70 mb-0 lg:mb-0 max-sm:mb-6">
        {{ t('domain.eyebrow') }}
      </p>
      
      <!-- Header -->
      <h2 ref="domainCheckHeader" class="domain-check-header row-[2] col-start-1 col-span-5 lg:col-start-1 lg:col-span-6 md:col-start-1 md:col-span-12 max-sm:col-start-1 max-sm:col-span-6 max-sm:row-[2] text-[4.5rem] lg:text-[3rem] md:text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] font-bold leading-[1.2] mb-8 max-sm:mb-0 text-white relative z-10">
          <span v-for="(char, index) in domainCheckHeaderCharsPart1" :key="`part1-${index}`" :data-index="index" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
          <br />
          <span v-for="(char, index) in domainCheckHeaderCharsPart2" :key="`part2-${index}`" :data-index="index + domainCheckHeaderCharsPart1.length" class="char-span">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </h2>

      <!-- Large Domain Input Field -->
      <div ref="domainCheckForm" class="domain-input-container row-[3] col-[1/13] max-sm:col-[1/7] max-sm:row-[3] pb-4">
        <!-- Animated Line -->
        <div ref="animatedLine" class="animated-line h-0.5 bg-white"></div>
        <div class="domain-input-wrapper relative flex items-end gap-4">
          <div class="input-field-wrapper flex-1 relative flex items-end">
            <input
              ref="domainInput"
              type="text"
              v-model="domainName"
              :placeholder="t('domain.placeholder')"
              @keyup.enter="checkDomain"
              @focus="isFocused = true"
              @blur="isFocused = false"
              class="domain-input-large bg-transparent border-none text-white placeholder-white/30 focus:outline-none transition-colors duration-200 w-full"
            />
            <span v-if="domainName" class="domain-suffix text-white/70 text-[7rem] lg:text-[3.5rem] md:text-[2.5rem] sm:text-[2rem] max-sm:text-[1.25rem] font-normal leading-[1.2] ml-2">.dk</span>
            <span 
              v-if="showCursor"
              class="blinking-cursor"
            >|</span>
          </div>
          <button
            ref="searchButtonDesktop"
            @click="checkDomain"
            :disabled="isChecking || !domainName.trim()"
            class="search-button-desktop bg-transparent text-white border-none p-3 cursor-pointer transition-all duration-200 ease hover:opacity-70 focus:outline-none mb-1 flex items-center justify-center"
            :class="isChecking || !domainName.trim() ? 'opacity-30 cursor-not-allowed' : 'opacity-100'"
          >
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Domain Note -->
      <div class="domain-note-container row-[4] col-[1/4] max-sm:col-[1/7] max-sm:row-[4]">
        <p ref="domainNote" class="domain-note text-sm text-gray-400">
          Only .dk domains are currently supported.
        </p>
      </div>

      <!-- Right side: Domain Check Result -->
      <div class="domain-check-right">
        <div v-if="isChecking" class="domain-check-result">
          <div class="flex items-center gap-3">
            <div class="loading-spinner"></div>
            <p class="text-white text-lg">{{ t('domain.checking') }}</p>
          </div>
        </div>
        <div v-else-if="domainResult" class="domain-check-result">
          <div v-if="domainResult.available" class="result-available">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="text-white text-xl font-semibold">{{ t('domain.available') }}</h3>
            </div>
            <p class="text-gray-300 text-sm ml-8">{{ domainResult.domain }} {{ t('domain.availableText') }}</p>
          </div>
          <div v-else class="result-taken">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="text-white text-xl font-semibold">{{ t('domain.taken') }}</h3>
            </div>
            <p class="text-gray-300 text-sm ml-8">{{ domainResult.domain }} {{ t('domain.takenText') }}</p>
          </div>
        </div>
        <div v-if="domainError" class="domain-check-result">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-400 text-sm">{{ domainError }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { injectI18n } from '../composables/useI18n';

const { t } = injectI18n();

const domainName = ref('');
const isFocused = ref(false);
const isChecking = ref(false);
const domainResult = ref(null);
const domainError = ref(null);

// Vis cursor kun når feltet er tomt og ikke har fokus
const showCursor = computed(() => {
  return !isFocused.value && domainName.value === '';
});

// Expose domain check header ref så parent kan tilgå den
const domainCheckHeader = ref(null);
const eyebrow = ref(null);
const checkTitle = eyebrow; // Use eyebrow as checkTitle
const domainCheckForm = ref(null);
const domainInput = ref(null);
const searchButton = ref(null);
const domainNote = ref(null);
const animatedLine = ref(null);

// Opdel teksten i individuelle bogstaver - bruger oversættelse
const domainCheckHeaderStringPart1 = computed(() => t('domain.title.part1'));
const domainCheckHeaderStringPart2 = computed(() => t('domain.title.part2'));
const domainCheckHeaderCharsPart1 = computed(() => domainCheckHeaderStringPart1.value.split(''));
const domainCheckHeaderCharsPart2 = computed(() => domainCheckHeaderStringPart2.value.split(''));

// Expose ref til parent
defineExpose({
  domainCheckHeader,
  eyebrow,
  checkTitle,
  domainCheckForm,
  domainInput,
  searchButton,
  domainNote,
  animatedLine
});

const checkDomain = async () => {
  // Reset previous results
  domainResult.value = null;
  domainError.value = null;
  
  // Get domain name and ensure it has .dk extension
  let domain = domainName.value.trim().toLowerCase();
  
  // Remove .dk if user included it
  if (domain.endsWith('.dk')) {
    domain = domain.replace('.dk', '');
  }
  
  // Validate domain name
  if (!domain || domain.length === 0) {
    domainError.value = t('domain.error');
    return;
  }
  
  // Validate domain format (only letters, numbers, and hyphens)
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!domainRegex.test(domain)) {
    domainError.value = t('domain.errorInvalid');
    return;
  }
  
  const fullDomain = `${domain}.dk`;
  isChecking.value = true;
  
  try {
    // Use a CORS proxy to check domain via DNS lookup
    // This checks if the domain resolves (which indicates it's registered)
    // Note: For production, you should use a proper backend API with WHOIS
    
    // Try to fetch the domain (this will fail if domain doesn't exist)
    // We use a simple method: try to load a resource from the domain
    // If it fails with CORS or network error, domain might be available
    // If it succeeds or gives DNS error, domain is likely registered
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Try to fetch from domain (this will trigger DNS lookup)
      // We use a non-existent path to avoid loading actual content
      const response = await fetch(`https://${fullDomain}/.well-known/non-existent-path-12345`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      // If we get here, domain exists (even if request failed, DNS resolved)
      domainResult.value = {
        domain: fullDomain,
        available: false
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Check error type
      if (fetchError.name === 'AbortError') {
        // Timeout - domain might not exist
        // But we can't be sure, so we'll try another method
        await checkViaAlternativeMethod(fullDomain);
      } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
        // Network error - could mean domain doesn't exist
        // But could also be CORS or other issues
        // Try alternative method
        await checkViaAlternativeMethod(fullDomain);
      } else {
        // Other error - assume domain might be registered
        domainResult.value = {
          domain: fullDomain,
          available: false
        };
      }
    }
  } catch (error) {
    console.error('Error checking domain:', error);
    domainError.value = t('domain.errorCheck');
  } finally {
    isChecking.value = false;
  }
};

const checkViaAlternativeMethod = async (fullDomain) => {
  try {
    // Alternative: Use a public DNS lookup API
    // Using a free service like cloudflare-dns.com
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${fullDomain}&type=A`, {
      method: 'GET',
      headers: {
        'Accept': 'application/dns-json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // If we get answers, domain is registered
      const isAvailable = !data.Answer || data.Answer.length === 0;
      
      domainResult.value = {
        domain: fullDomain,
        available: isAvailable
      };
    } else {
      // If API fails, show error
      domainError.value = t('domain.errorAlternative');
    }
  } catch (error) {
    console.error('Alternative check failed:', error);
    domainError.value = 'Kunne ikke tjekke domænet. Prøv igen eller kontakt os direkte.';
  }
};
</script>

<style scoped>
.domain-check-section {
  background-color: transparent;
  position: relative;
  overflow: hidden;
}

.domain-check-section .grid-container {
  margin-top: -10rem;
  position: relative;
  z-index: 1;
}


.domain-input-container {
  grid-row: 3;
  position: relative;
  z-index: 1;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .domain-input-container {
    grid-row: 3;
  }
}

.animated-line {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  transform: scaleX(0);
  transform-origin: left;
}

.domain-note-container {
  grid-row: 4;
  position: relative;
  z-index: 1;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .domain-note-container {
    grid-column: 1 / 13;
  }
}

@media (max-width: 640px) {
  .domain-note-container {
    grid-column: 1 / 7;
    grid-row: 4;
  }
}

.domain-input-wrapper {
  width: 100%;
  display: flex;
  align-items: end;
}

.domain-suffix {
  letter-spacing: -0.02em;
  pointer-events: none;
}

.input-field-wrapper {
  flex: 1;
}

.search-button-desktop {
  display: flex;
}

@media (max-width: 640px) {
  .search-button-desktop {
    display: none;
  }
}

@media (max-width: 768px) {
  .domain-input-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .domain-input-wrapper .search-button {
    width: 100%;
    margin-bottom: 0 !important;
  }
}


.domain-input-large {
  font-size: 7rem;
  line-height: 1.2;
  font-weight: 400;
  caret-color: rgb(255, 255, 255);
  letter-spacing: -0.02em;
}

.blinking-cursor {
  position: absolute;
  left: -0.9rem;
  top: 0;
  font-size: 7rem;
  line-height: 1.2;
  color: white;
  font-weight: 100;
  transform: scaleX(0.3);
  animation: blink 1s infinite;
  pointer-events: none;
  letter-spacing: -0.02em;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.domain-input-large::placeholder {
  opacity: 0.3;
}

@media (max-width: 1024px) {
  .domain-input-large {
    font-size: 3.5rem;
  }
  .blinking-cursor {
    font-size: 3.5rem;
  }
}

@media (max-width: 768px) {
  .domain-input-large {
    font-size: 2.5rem;
  }
  .blinking-cursor {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .domain-input-large {
    font-size: 2rem;
  }
  .blinking-cursor {
    font-size: 2rem;
  }
}

.domain-check-right {
  flex-direction: column;
  grid-row: 2;
  grid-column: 9 / 13;/* Spænder fra kolonne 7 til 11 (12 er eksklusiv) */
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

@media (max-width: 640px) {
  .domain-check-right {
    grid-column: 1 / 7 !important; /* 6 column grid på mobil */
    grid-row: 5 !important; /* Row 5 på mobil */
    margin-top: 0 !important; /* Fjern margin-top på mobil */
  }
}

.domain-check-form {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.search-button {
  min-height: 3rem;
  min-width: 3rem;
}

.search-button svg {
  width: 4rem;
  height: 4rem;
}

@media (max-width: 1024px) {
  .search-button svg {
    width: 3.5rem;
    height: 3.5rem;
  }
}

@media (max-width: 768px) {
  .search-button {
    min-width: auto;
    width: 100%;
  }
  
.search-button svg {
  width: 3rem;
  height: 3rem;
}
}

.domain-check-result {
  margin-top: 2rem;
  min-height: 60px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-available,
.result-taken {
  padding: 1rem;
  border-radius: 8px;
}

.result-available {
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.result-taken {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* MacBook 13" - eyebrow tekst, overskrift og input */
@media (min-width: 1280px) and (max-width: 1440px) {
  .domain-check-eyebrow {
    font-size: 0.6rem !important;
  }
  .domain-check-header {
    font-size: 2rem !important;
  }
  .domain-input-large {
    font-size: 5rem !important;
  }
  .blinking-cursor {
    font-size: 5rem !important;
  }
}

/* Reducer font-størrelse på domain check overskrift til MacBook Pro 14" */
@media (min-width: 1445px) and (max-width: 1700px) {
  .domain-check-header {
    font-size: 2.5rem;
  }
}

/* 27" skærmstørrelse (ca. 2560px bred) - gør eyebrow og overskrift større */
@media (min-width: 2500px) and (max-width: 2700px) {
  .domain-check-eyebrow {
    font-size: 1.2rem !important; /* Matcher features eyebrow - justér denne værdi efter behov */
  }
  .domain-check-header {
    font-size: 4.5rem !important; /* Matcher andre overskrifter - justér denne værdi efter behov */
  }
}
</style>

