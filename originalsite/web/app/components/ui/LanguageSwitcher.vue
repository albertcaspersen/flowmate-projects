<template>
    <div class="language-switcher">
      <button 
        @click="handleLanguageSwitch(otherLanguage.code)"
        class="lang-switch-btn"
        aria-label="Switch language"
      >
        {{ otherLanguage.label }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useSwitchLocalePath } from '#i18n';
  import { useRoute, useRouter } from 'vue-router';
  import { useCoreStore } from '~/stores/core';
  
  const { locale } = useI18n();
  const switchLocalePath = useSwitchLocalePath();
  const route = useRoute();
  const router = useRouter();
  const store = useCoreStore();
  
  // Set initial locale based on route
  onMounted(() => {
    if (route.path === '/' || !route.path.startsWith('/en/')) {
      locale.value = 'da';
    } else {
      locale.value = 'en';
    }
  });
  
  // Determine the other language
  const otherLanguage = computed(() => {
    return locale.value === 'da' 
      ? { code: 'en', label: 'English' } 
      : { code: 'da', label: 'Dansk' };
  });
  
  /**
   * Handles language switching and navigates to the appropriate path
   */
  const handleLanguageSwitch = (targetLocale) => {
    if (targetLocale === locale.value) return;
    
    let targetPath;
    
    // Get current page data and settings
    const currentPage = store.getCurrentPage;
    const settings = store.getSettings;
    
    // Get front_pages and get_started_pages from settings
    const frontPages = settings?.front_pages || [];
    const getStartedPages = settings?.get_started_pages || [];
    
    // Find the target locale pages
    const targetFrontPage = frontPages.find(page => page.locale === targetLocale);
    const targetGetStartedPage = getStartedPages.find(page => page.locale === targetLocale);
    
    // Current locale pages
    const currentFrontPage = frontPages.find(page => page.locale === locale.value);
    const currentGetStartedPage = getStartedPages.find(page => page.locale === locale.value);
    
    // Check if current path matches the get started page
    const isOnGetStartedPage = () => {
      if (locale.value === 'da' && currentGetStartedPage) {
        return route.path === `/${currentGetStartedPage.slug}/` || 
               route.path.startsWith(`/${currentGetStartedPage.slug}`);
      } else if (locale.value === 'en' && currentGetStartedPage) {
        return route.path === `/en/${currentGetStartedPage.slug}/` || 
               route.path.startsWith(`/en/${currentGetStartedPage.slug}`);
      }
      return false;
    };
    
    // Check if current path matches the front page
    const isOnFrontPage = () => {
      if (locale.value === 'da') {
        return route.path === '/' || 
              (currentFrontPage && route.path.startsWith(`/${currentFrontPage.slug}`));
      } else if (locale.value === 'en' && currentFrontPage) {
        return route.path === `/en/${currentFrontPage.slug}/` || 
               route.path.startsWith(`/en/${currentFrontPage.slug}`);
      }
      return false;
    };
    
    // Handle specific known pages first
    if (isOnFrontPage()) {
      if (targetLocale === 'en' && targetFrontPage) {
        targetPath = `/en/${targetFrontPage.slug}/`;
      } else if (targetLocale === 'da') {
        targetPath = '/';
      }
    } else if (isOnGetStartedPage()) {
      if (targetLocale === 'en' && targetGetStartedPage) {
        targetPath = `/en/${targetGetStartedPage.slug}/`;
      } else if (targetLocale === 'da' && targetGetStartedPage) {
        targetPath = `/${targetGetStartedPage.slug}/`;
      }
    } else if (currentPage?.cm_translations?.[targetLocale]?.path) {
      // For pages with translations in the CMS, use that path
      targetPath = currentPage.cm_translations[targetLocale].path;
    } else if (targetLocale === 'en') {
      // Default English path handling
      const pathWithoutLeadingSlash = route.path.replace(/^\//, '');
      targetPath = '/en/' + pathWithoutLeadingSlash;
    } else {
      // Default Danish path handling
      targetPath = route.path.replace(/^\/en\//, '/');
    }
    
    // Make sure path starts with a slash
    if (targetPath && !targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }
    
    // Add trailing slash if missing and not a file
    if (targetPath && !targetPath.endsWith('/') && !targetPath.includes('.')) {
      targetPath = targetPath + '/';
    }
    
    // console.log(`Switching from ${locale.value} to ${targetLocale}, navigating to: ${targetPath}`);
    router.push(targetPath);
  };
  </script>