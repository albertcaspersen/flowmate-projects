# Multilanguage Implementation Guide for Nuxt 3

This guide details the exact steps to implement multilanguage support in a Nuxt 3 project, following the structure `project-name/app/app/`.

## 1. Configuration and Setup

### Install Required Dependencies

```bash
npm install @nuxtjs/i18n@next
```

### Configure Nuxt.config.ts

**File:** `app/nuxt.config.ts`

```typescript
// Add to modules array
modules: [
  '@nuxtjs/i18n',
  // other modules...
],

// Add to runtimeConfig
runtimeConfig: {
  public: {
    multilang: {
      enabled: process.env.NUXT_PUBLIC_MULTILANG_ENABLED || false,
    },
    menu: {
      locations: ['main', 'footer-1', 'footer-2'],
    },
    // other public config...
  },
  // other config...
},

// Add i18n configuration
i18n: {
  baseUrl: process.env.NUXT_PUBLIC_SITE_URL,
  defaultLocale: 'en',
  locales: [
    { code: 'en', iso: 'en-US', name: 'English', dir: "ltr", file: 'en.js'},
    { code: 'da', iso: 'da-DK', name: 'Dansk', dir: "ltr", file: 'da.js'},
  ],
  langDir: 'lang',
  strategy: 'prefix_except_default',
  detectBrowserLanguage: false,
  skipSettingLocaleOnNavigate: false,
},
```

### Create Language Files

**Directory:** `app/lang/`

Create two files:

**File:** `app/lang/en.js`
```javascript
export default {
  'site_name': 'Your Site Name',
  'home': 'Home',
  'contact': 'Contact',
  // Other translations...
}
```

**File:** `app/lang/da.js`
```javascript
export default {
  'site_name': 'Dit webstedsnavn',
  'home': 'Hjem',
  'contact': 'Kontakt',
  // Other translations...
}
```

### Update Environment Variables

**File:** `app/.env`

Add:
```
NUXT_PUBLIC_MULTILANG_ENABLED=true
```

## 2. Store Configuration

### Core Store Implementation

**File:** `app/app/stores/core.js`

```javascript
import { defineStore } from 'pinia';

export const useCoreStore = defineStore('CoreStore', {
  state: () => ({
    // Other state...
    menues: {},
    settings: {
      front_pages: [
        { locale: 'en', slug: '' },      // English homepage 
        { locale: 'da', slug: 'forside' } // Danish homepage
      ],
    },
    currentPage: {},
  }),
  
  getters: {
    // Add this getter for localized menus
    getLocaleMenu: (state) => (location, localeCode) => {
      const localeSpecificKey = `${location}_${localeCode}`;
      const localeMenu = state.menues[localeSpecificKey];
      
      if (localeMenu && Array.isArray(localeMenu) && localeMenu.length > 0) {
        return localeMenu;
      }
      
      return state.menues[location] || [];
    },
    
    // Other getters...
  },
  
  actions: {
    setCurrentPage(page) {
      this.currentPage = page;
    },
    // Other actions...
  }
});
```

## 3. Composables for Multilanguage Support

### Locale Menu Composable

**File:** `app/app/composables/useLocaleMenu.js`

```javascript
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCoreStore } from '~/stores/core';

export const useLocaleMenu = () => {
  const { locale } = useI18n();
  const store = useCoreStore();
  
  const getLocaleMenu = (baseMenuKey) => {
    if (store.getLocaleMenu) {
      return store.getLocaleMenu(baseMenuKey, locale.value);
    }
    
    const localeSpecificKey = `${baseMenuKey}_${locale.value}`;
    const localeMenu = store.getMenu ? store.getMenu(localeSpecificKey) : undefined;
    
    if (localeMenu && Array.isArray(localeMenu) && localeMenu.length > 0) {
      return localeMenu;
    }
    
    return store.getMenu ? store.getMenu(baseMenuKey) : [];
  };
  
  const useLocaleMenuComputed = (baseMenuKey) => {
    return computed(() => getLocaleMenu(baseMenuKey));
  };
  
  // Other helper functions...
  
  return {
    getLocaleMenu,
    useLocaleMenuComputed,
  };
};
```

### API Request with Language Support

**File:** `app/app/composables/checkmateSingle.ts`

```typescript
import { useI18n } from 'vue-i18n'
import { useCoreStore } from '~/stores/core'

export async function useCheckmateSingle(pagePath?: string, options: object = {}) {
  const { locale } = useI18n();
  
  const {
    // Other options...
    lang = locale.value // Add this line
  } = options;

  // Your existing code...
  
  // Add language to params
  const params = {
    // Other params...
    lang: lang
  };
  
  // Make API request with language parameter
}
```

### SEO Head Composable

**File:** `app/app/composables/useSeoHead.ts`

```typescript
import { useRuntimeConfig } from '#app';
import { useLocaleHead } from '#i18n';

export const useSeoHead = () => {
  const config = useRuntimeConfig();
  
  const getSeoHead = (options) => {
    // Basic SEO setup...
    
    // Add this conditional for multilanguage
    if (config.public.multilang.enabled) {
      const i18nHead = useLocaleHead({
        addSeoAttributes: true,
        addDirAttribute: true
      })

      return {
        htmlAttrs: {
          lang: i18nHead.value.htmlAttrs.lang,
          dir: i18nHead.value.htmlAttrs.dir,
        },
        title: metaTitle,
        meta: [...metaData, ...(i18nHead.value.meta || [])],
        link: [...links, ...(i18nHead.value.link || [])],
      };
    }
    
    // Default return...
  };
  
  return { getSeoHead };
};
```

## 4. Component Implementation

### Header with Language Switcher

**File:** `app/app/components/partials/SiteHeader.vue`

Key parts to include:

```vue
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchLocalePath } from '#i18n';
import { useRoute, useRouter } from 'vue-router';
import { useCoreStore } from '~/stores/core';
import { useLocaleMenu } from '~/composables/useLocaleMenu';

const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const route = useRoute();
const router = useRouter();
const store = useCoreStore();
const { useLocaleMenuComputed } = useLocaleMenu();

// Use localized menu
const mainMenu = useLocaleMenuComputed('main');

// Determine other language
const otherLanguage = computed(() => {
  return locale.value === 'en' 
    ? { code: 'da', label: 'Dansk' } 
    : { code: 'en', label: 'English' };
});

// Language switch handler function
const handleLanguageSwitch = (targetLocale) => {
  if (targetLocale === locale.value) return;
  
  let targetPath;
  
  // Special case for homepage
  if (route.path === '/' && targetLocale === 'da') {
    targetPath = '/da/forside/';
  } 
  else if ((route.path === '/da/' || route.path === '/da/forside/') && targetLocale === 'en') {
    targetPath = '/';
  }
  else {
    // Handle regular pages with translations
    const currentPage = store.currentPage;
    if (currentPage?.cm_translations?.[targetLocale]) {
      targetPath = currentPage.cm_translations[targetLocale].path;
    } else {
      // Fallback logic for constructing paths
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

<template>
  <!-- Add language switcher button -->
  <button @click="handleLanguageSwitch(otherLanguage.code)">
    {{ otherLanguage.label }}
  </button>
</template>
```

### Footer Component

**File:** `app/app/components/partials/SiteFooter.vue`

Similar to header, implement the same `handleLanguageSwitch` function and use localized menus:

```javascript
const { useLocaleMenuComputed } = useLocaleMenu();
const footerMenu1 = useLocaleMenuComputed('footer-1');
const footerMenu2 = useLocaleMenuComputed('footer-2');
```

## 5. Page Routing and Translation Handling

### Dynamic Page Component

**File:** `app/app/pages/[...slug]/index.vue`

```javascript
// In setup script
import { useI18n } from 'vue-i18n';
import { useCoreStore } from '~/stores/core';

const { locale, locales, setI18nParams } = useI18n();
const store = useCoreStore();

// After fetching page data:
if(page.value?.[0]?.cm_translations) {
  let translations = {};
  
  locales.value.forEach((loc) => {
    const translation = page.value[0].cm_translations[loc.code];
    if (translation) {
      // Extract slug from path
      let slug = translation.path === '/' 
        ? '' 
        : translation.path.replace(`/${loc.code}/`, '');
      
      // Clean up slug
      if (slug.startsWith('/')) slug = slug.substring(1);
      
      // Handle homepage special case
      store.settings.front_pages.forEach((frontPage) => {
        if (`/${frontPage.locale}/${frontPage.slug}/` === translation.path) {
          slug = '';
        }
      });
      
      translations[loc.code] = { slug: [slug] };
    }
  });
  
  // Set translations for routing
  setI18nParams(translations);
}
```

## 6. Key Integration Points with Backend

### API Integration

1. Your API requests should include the current language parameter
2. Backend should return translated content and metadata based on this parameter
3. Ensure your backend returns translation information in the `cm_translations` object

Example structure of `cm_translations`:
```javascript
cm_translations: {
  en: { 
    path: '/about-us/',
    title: 'About Us'
  },
  da: {
    path: '/da/om-os/',
    title: 'Om Os'
  }
}
```

## 7. Important Implementation Details

1. **Homepage Handling**: Special logic is needed for homepages
   - English homepage: path is `/` 
   - Danish homepage: path is `/da/forside/`

2. **Menu Localization**: 
   - Store menus with locale suffix (e.g., `main_en`, `main_da`)
   - Use `useLocaleMenuComputed` to automatically get the correct menu

3. **Translation Path Construction**:
   - Primary: Use `cm_translations[locale].path` when available
   - Fallback: Construct path based on current URL and language code
   - Last resort: Use `switchLocalePath` from Nuxt i18n

4. **SEO Integration**:
   - Enable multilanguage SEO with `useLocaleHead` from Nuxt i18n
   - Include appropriate HTML attributes and meta tags

## Final Notes

- Ensure the `NUXT_PUBLIC_MULTILANG_ENABLED` environment variable is set to `true`
- Consider adding language-specific redirects for common paths
- Test language switching thoroughly, especially homepage and nested routes
- For CMS integration, ensure your CMS provides properly structured `cm_translations` data

This implementation creates a robust multilanguage solution that handles URL routing, page content, menu localization, and SEO considerations for your Nuxt 3 project. 