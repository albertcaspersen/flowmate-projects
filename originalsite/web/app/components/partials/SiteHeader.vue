<template>
  <header class="site-header px-3 md:px-0 fixed top-0 w-full z-50 duration-300 transition-transform" 
          :class="[hideTop ? '-translate-y-full' : 'translate-y-0']">
    <div class="header-container max-w-[1440px] mx-auto backdrop-blur-md bg-white/30 m-4 rounded-xl px-6 py-3 flex items-center justify-between">
      <!-- Left section: Logo and main menu -->
      <div class="flex items-center gap-8">
        <div class="z-[26]">
          <nuxt-link :to="homePageUrl">
            <Logo class="w-full max-w-[180px] h-auto text-primary"></Logo>
          </nuxt-link>
        </div>
        <ul class="flex items-center gap-6 max-md:hidden">
          <li class="mb-0" v-for="(link, i) in actualMenu" :key="i">
            <nuxt-link class="text-white hover:text-primary transition-colors duration-200" :to="link.url" v-if="link.type === 'internal'">
              <span v-html="link.title"></span>
            </nuxt-link>
            <a class="text-white hover:text-primary transition-colors duration-200" :href="link.url" :target="link.target || '_self'" v-html="link.title" v-else></a>
          </li>
        </ul>
      </div>
      
      <!-- Right section: Login and Get Started buttons -->
      <div class="flex items-center gap-4 z-[22]">
        <div class="max-md:hidden flex items-center gap-4">
          <!-- <nuxt-link to="/login" class="text-white font-medium hover:text-primary transition-colors duration-200 mb-0">
            {{ locale === 'en' ? 'Login' : 'Log ind' }}
          </nuxt-link> -->
          
          <!-- Get Started button with site-wide styling -->
          <nuxt-link :to="getStartedUrl" class="btn btn-solid btn-primary">
            <span class="btn-text">{{ locale === 'en' ? 'Get Started' : 'Kom i gang' }}</span>
            <div class="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          </nuxt-link>
        </div>
        <!-- <div class="flex md:hidden">
          <BurgerIcon />
        </div> -->
        <LanguageSwitcher class="text-white" />
      </div>
    </div>
  </header>
  <!-- <BurgerMenu :main-menu="currentMenu" /> -->

</template>

<script setup>
import { useCoreStore } from '~/stores/core';
import { useI18n } from 'vue-i18n';

const store = useCoreStore();
const { locale } = useI18n();

// Get the homepage URL based on front_pages in settings
const homePageUrl = computed(() => {
  const settings = store.getSettings;
  
  if (locale.value === 'da') {
    return '/';
  }
  
  // Get the English front page slug from settings
  const englishFrontPage = settings?.front_pages?.find(page => page.locale === 'en');
  if (englishFrontPage?.slug) {
    return `/en/${englishFrontPage.slug}/`;
  }
  
  return '/en/';
});

// Get the Get Started URL based on get_started_pages in settings
const getStartedUrl = computed(() => {
  const settings = store.getSettings;
  
  if (locale.value === 'da') {
    // Find the Danish Get Started page
    const danishGetStarted = settings?.get_started_pages?.find(page => page.locale === 'da');
    return danishGetStarted?.slug ? `/${danishGetStarted.slug}/` : '/kom-i-gang/';
  }
  
  // Find the English Get Started page
  const englishGetStarted = settings?.get_started_pages?.find(page => page.locale === 'en');
  return englishGetStarted?.slug ? `/en/${englishGetStarted.slug}/` : '/en/get-started/';
});

const actualMenu = computed(() => {
  return store.getMenu('menu-1', locale.value);
});

const hideTop = ref(false);
const lastScroll = ref(0);
const scrollThreshold = 75;
const isMenuOpen = ref(false);

function handleScroll() {
  let currentScroll = window.scrollY;

  if(currentScroll < 0) {
    currentScroll = 0;
  }

  hideTop.value = currentScroll > lastScroll.value;
  lastScroll.value = currentScroll;
}

function toggleBurger() {
  isMenuOpen.value = !isMenuOpen.value;
}

// prevents scrolling when menu is open
watch(isMenuOpen, (newVal) => {
  if (newVal) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);

});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Border and box shadow removed */
</style>
