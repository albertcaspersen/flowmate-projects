# Multi-Language Menu Implementation Guide

## Overview

This guide outlines the architecture and implementation details for creating language-specific menus in a Nuxt 3 application. The solution leverages Vue 3 Composition API, Nuxt i18n module, and a Pinia store for state management.

## Table of Contents

1. [Project Setup](#project-setup)
2. [i18n Configuration](#i18n-configuration)
3. [Menu Structure](#menu-structure)
4. [Language Switcher Component](#language-switcher-component)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)

## Project Setup

### Dependencies

- Nuxt 3
- Pinia for state management
- @nuxtjs/i18n module

### Installation

```bash
npm install @nuxtjs/i18n pinia
```

## i18n Configuration

Configure i18n in your `nuxt.config.ts` file:

```typescript
export default defineNuxtConfig({
  // Other configuration
  modules: [
    '@nuxtjs/i18n',
    // Other modules
  ],
  
  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL,
    defaultLocale: 'en', 
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', dir: "ltr", file: 'en.js'},
      { code: 'da', iso: 'da-DK', name: 'Dansk', dir: "ltr", file: 'da.js'},
      // Add more languages as needed
    ],
    langDir: 'lang',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    skipSettingLocaleOnNavigate: false,
  },

  runtimeConfig: {
    public: {
      menu: {
        locations: [
          'main',
          'footer-1',
          'footer-2',
          // Other menu locations
        ],
      },
      multilang: {
        enabled: process.env.NUXT_PUBLIC_MULTILANG_ENABLED || false,
      },
    }
  }
})
```

## Menu Structure

### Language Files

Create language files in the specified `langDir` (e.g., `lang/en.js`, `lang/da.js`):

```javascript
// lang/en.js
export default {
  'site_name': 'Your Site Name',
  'home': 'Home',
  'contact': 'Contact',
  // Add more translations as needed
}

// lang/da.js
export default {
  'site_name': 'Dit webstedsnavn',
  'home': 'Hjem',
  'contact': 'Kontakt',
  // Add more translations as needed
}
```

### Menu Naming Convention

To support multi-language menus, use a naming convention for your menu locations:

1. Base menu: `'main'`, `'footer-1'`, etc.
2. Language-specific menus: `'main_en'`, `'main_da'`, `'footer-1_en'`, `'footer-1_da'`, etc.

## Implementation Details

### Store Setup (Pinia)

Create a Pinia store to manage menus and language settings:

```javascript
// stores/core.js
import { defineStore } from 'pinia';

export const useCoreStore = defineStore('CoreStore', {
  state: () => ({
    showMenu: false,
    menues: {},
    settings: {
      front_pages: [
        { locale: 'en', slug: '' },      // English homepage 
        { locale: 'da', slug: 'forside' } // Danish homepage
      ],
    },
    currentPage: {},
    // Other state properties
  }),
  
  getters: {
    getMenu: (state) => (location) => {
      return state.menues[location];
    },
    
    /**
     * Get a menu for a specific locale
     * @param {string} location - Base menu location (e.g., 'main')
     * @param {string} localeCode - Locale code (e.g., 'en', 'da')
     * @returns {Array} Menu items for the specified locale
     */
    getLocaleMenu: (state) => (location, localeCode) => {
      // First try the locale-specific menu (e.g., 'main_en')
      const localeSpecificKey = `${location}_${localeCode}`;
      const localeMenu = state.menues[localeSpecificKey];
      
      if (localeMenu && Array.isArray(localeMenu) && localeMenu.length > 0) {
        return localeMenu;
      }
      
      // Fallback to the base menu
      return state.menues[location] || [];
    },
    
    // Other getters
  },
  
  actions: {
    /**
     * Fetches project initialization data.
     */
    async fetchProjectInitData() {
      const config = useRuntimeConfig();
      const locations = config.public.menu.locations;

      const { data } = await useFetch('/api/init', {
        query: {
          cmv: this.cacheKey
        }
      });

      // If success
      if (data) {
        // Sets settings.
        this.settings = data.value.settings;
        
        // Sets menu data.
        locations.forEach((location) => {
          this.menues[location] = data.value.menus[location];
        });
      }
    },
    
    // Fetch menus specifically (optional)
    async fetchMenus() {
      try {
        const config = useRuntimeConfig();
        const locations = config.public.menu.locations;
        
        // API call to fetch menu data
        const response = await $fetch('/api/menus', {
          method: 'GET',
          params: {
            locations: locations.join(','),
            structured: true,
            depth: 3
          }
        });
        
        // Store menus in state
        if (typeof response === 'object') {
          Object.keys(response).forEach((locationKey) => {
            this.menues[locationKey] = response[locationKey];
          });
        }
      } catch (err) {
        console.error('MENU ERROR:', err);
      }
    }
  }
});
```

### Locale Menu Composable

Create a composable to handle locale-specific menus:

```javascript
// composables/useLocaleMenu.js
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCoreStore } from '~/stores/core';

/**
 * A composable for handling locale-specific menus
 * @returns {Object} An object containing helper functions for locale-specific menus
 */
export const useLocaleMenu = () => {
  const { locale } = useI18n();
  const store = useCoreStore();
  
  /**
   * Get a menu for the current locale
   * @param {string} baseMenuKey - The base menu key without locale suffix
   * @returns {Array} The menu items for the current locale
   */
  const getLocaleMenu = (baseMenuKey) => {
    // Use the store's getLocaleMenu getter if available
    if (store.getLocaleMenu) {
      return store.getLocaleMenu(baseMenuKey, locale.value);
    }
    
    // Fallback to manual implementation if the getter is not available
    const localeSpecificKey = `${baseMenuKey}_${locale.value}`;
    const localeMenu = store.getMenu ? store.getMenu(localeSpecificKey) : undefined;
    
    if (localeMenu && Array.isArray(localeMenu) && localeMenu.length > 0) {
      return localeMenu;
    }
    
    // Fallback to base menu
    return store.getMenu ? store.getMenu(baseMenuKey) : [];
  };
  
  /**
   * Create a computed property that returns a menu for the current locale
   * @param {string} baseMenuKey - The base menu key without locale suffix
   * @returns {ComputedRef<Array>} Computed property that returns menu items for the current locale
   */
  const useLocaleMenuComputed = (baseMenuKey) => {
    return computed(() => getLocaleMenu(baseMenuKey));
  };
  
  /**
   * Watch for locale changes and reactively update menu data
   * @param {string} baseMenuKey - The base menu key without locale suffix
   * @param {Function} callback - Callback function to execute when menu changes
   */
  const watchLocaleMenu = (baseMenuKey, callback) => {
    watch(
      () => [locale.value, store.$state.menues],
      () => {
        const menu = getLocaleMenu(baseMenuKey);
        callback(menu, locale.value);
      },
      { immediate: true }
    );
  };
  
  return {
    getLocaleMenu,
    useLocaleMenuComputed,
    watchLocaleMenu
  };
};
```

## Language Switcher Component

Implement a language switcher component:

```vue
<!-- components/LanguageSwitcher.vue -->
<template>
  <div class="relative z-[26] flex items-center">
    <NuxtLink 
      class="!mb-0"
      to="/"
      :class="[
        'text-sm transition-all duration-300',
        locale === 'en' 
          ? 'text-white font-medium'
          : 'text-white/60 hover:text-white/80'
      ]"
      @click.prevent="handleLanguageSwitch('en')"
    >
      EN
    </NuxtLink>
    <span class="text-white/40 mx-1">/</span>
    <NuxtLink 
      class="!mb-0"
      to="/da/forside/"
      :class="[
        'text-sm transition-all duration-300',
        locale === 'da' 
          ? 'text-white font-medium'
          : 'text-white/60 hover:text-white/80'
      ]"
      @click.prevent="handleLanguageSwitch('da')"
    >
      DA
    </NuxtLink>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchLocalePath } from '#i18n';
import { useRoute, useRouter } from 'vue-router';
import { useCoreStore } from '~/stores/core';

const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const route = useRoute();
const router = useRouter();
const store = useCoreStore();

/**
 * Handles language switching and navigates to the appropriate path
 * @param {string} targetLocale - The locale to switch to ('en' or 'da')
 */
const handleLanguageSwitch = (targetLocale) => {
  if (targetLocale === locale.value) return; // Don't switch if already on this language
  
  let targetPath;
  
  // Special case for homepage
  if (route.path === '/' && targetLocale === 'da') {
    targetPath = '/da/forside/';
  } 
  else if ((route.path === '/da/' || route.path === '/da/forside/') && targetLocale === 'en') {
    targetPath = '/';
  }
  else {
    // For regular pages
    const currentPage = store.getCurrentPage;
    if (currentPage && currentPage.cm_translations && currentPage.cm_translations[targetLocale]) {
      targetPath = currentPage.cm_translations[targetLocale].path;
    } else {
      // Fallback to constructed path
      if (targetLocale === 'en') {
        // Get the Danish path without /da/ prefix
        let slug = route.path.replace('/da/', '');
        if (slug.endsWith('/')) {
          slug = slug.slice(0, -1);
        }
        targetPath = `/${slug}/`;
      } else {
        // Construct Danish path
        let slug = route.path.replace('/', '');
        if (slug.endsWith('/')) {
          slug = slug.slice(0, -1);
        }
        targetPath = `/da/${slug}/`;
      }
    }
  }
  
  // Last resort fallback
  if (!targetPath) {
    targetPath = switchLocalePath(targetLocale);
  }
  
  router.push(targetPath);
};
</script>
```

## Usage Examples

### Using Localized Menus in Components

```vue
<!-- Example component using the localized menu -->
<template>
  <nav>
    <ul>
      <li v-for="item in mainMenu" :key="item.ID">
        <nuxt-link :to="item.url">{{ item.title }}</nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useLocaleMenu } from '~/composables/useLocaleMenu';

// Use the composable to get the menu for the current locale
const { useLocaleMenuComputed } = useLocaleMenu();
const mainMenu = useLocaleMenuComputed('main');
</script>
```

### API Backend Considerations

The backend API should support:

1. Returning menus for specific locations:
   - Base menus: `main`, `footer-1`, etc.
   - Language-specific menus: `main_en`, `main_da`, etc.

2. Translation support for content items:
   - Provide `cm_translations` object with paths to translated versions

Example backend response structure:

```json
{
  "menus": {
    "main": [...],
    "main_en": [...],
    "main_da": [...],
    "footer-1": [...],
    "footer-1_en": [...],
    "footer-1_da": [...]
  },
  "settings": {
    "front_pages": [
      { "locale": "en", "slug": "" },
      { "locale": "da", "slug": "forside" }
    ],
    "company_info": {...},
    "logos": {...}
  }
}
```

## Best Practices

1. **Menu Fallbacks**: Always implement fallbacks to use the base menu if a language-specific menu isn't available.

2. **Language Detection**: Consider user preferences when determining the initial language.

3. **URL Structure**: Use a consistent pattern for translated URLs (e.g., `/da/kontakt/` for the Danish version of `/contact/`).

4. **Content Translation**: Ensure all menu items and their linked content are available in all supported languages.

5. **Special Cases**: Handle special cases like homepages explicitly in the language switcher logic.

6. **Responsive Design**: Ensure the language switcher is accessible on all device sizes.
