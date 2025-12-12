<template>
  <div>
    <SiteHeader v-if="currentPage && currentPage.type !== 'demo-page'" :text-is-white="headerIsTransparent" />

    <main id="main" class="custom-font" :style="fontFamily ? '--custom-font-family:'+fontFamily+';' : ''">
      <div class="flex p-20 h-[80vh]" v-if="preview && hasError">
        <div class="m-auto">
          <div class="col-span-12">
            <h1>Error fetching preview ...</h1>
            <p>The preview link probably expired. Please try opening it again from the backend.</p>
          </div>
        </div>
      </div>

      <DemoHeader v-if="currentPage && currentPage.type === 'demo-page'" :demo-settings="currentPage.acf" />
      <FlexContent :content="pageContent" :page="currentPage" />
    </main>

    <SiteFooter v-if="currentPage && currentPage.type !== 'demo-page'" />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {usePageCacheHeaders} from "~/composables/pageCacheHeaders";
import {useFlowmate} from "~/composables/flowmate";
import { useCoreStore } from "~/stores/core";
import {useCheckmateSingle} from "~/composables/checkmateSingle";
import {useCheckmatePreview} from "~/composables/checkmatePreview";
import {useSeoHead} from "~/composables/useSeoHead";
import { useI18n } from 'vue-i18n';
import { useLocalePath } from '#i18n';

const {getSeoHead} = useSeoHead();
const route = useRoute();
const flowmate = useFlowmate();
const store = useCoreStore();
const { $readSession } = useNuxtApp();

// Initialize i18n
const { t, locale, locales } = useI18n();
const localePath = useLocalePath();


// Define page transition
definePageMeta({
  pageTransition: {
    name: 'page'
  }
})

const headerTextColor = computed(() => {
  return store.getHeaderTextColor;
})
const headerIsTransparent = ref(false);
onMounted(() => {
  headerIsTransparent.value = headerTextColor.value === 'white';
})
watch(headerTextColor, (newVal, oldVal) => {
  headerIsTransparent.value = newVal === 'white';
})

// Make sure store settings have front_pages configuration
onBeforeMount(() => {
  if (!store.settings.front_pages) {
    store.settings.front_pages = [
      { locale: 'en', slug: '' },      // English homepage 
      { locale: 'da', slug: '' }       // Danish homepage
    ];
  }
  if (!store.settings.get_started_pages) {
    store.settings.get_started_pages = [
      { locale: 'en', slug: 'get-started' },      // English Get Started page
      { locale: 'da', slug: 'kom-i-gang' }        // Danish Get Started page
    ];
  }
});

const content = ref(null);
const pageObject = ref(null);
const preview = ref(false);
const hasError = ref(false);

const handleTranslations = (pageData) => {
  if (!pageData.cm_translations) return;
  
  
  // Instead of trying to use setI18nParams directly,
  // we'll store the translation data in the page object
  // so our language switcher can access it
  
  // Make sure the currentPage has a cm_translations property
  if (!pageData.cm_translations) {
    pageData.cm_translations = {};
  }
  
  // We don't need to manipulate the translations here since
  // they should already be properly formatted in the API response
  
  // Our language switcher will use this data directly from the store
  // when deciding which URL to navigate to
  
};

// Skip processing for well-known and devtools requests
const skipPaths = [
  '.well-known',
  'chrome-devtools',
  'devtools',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml'
];

const shouldSkipRequest = skipPaths.some(path => route.fullPath.includes(path));

if (!shouldSkipRequest && !flowmate.isEnabled()) {
  // IF preview - do this stuff
  const { isPreview, getCurrentPagePreview } = useCheckmatePreview();
  preview.value = isPreview.value;
  if (isPreview.value) {
    const page =  await getCurrentPagePreview();
    useHead({
      "meta": [
        {
          "hid": "robots",
          "name": "robots",
          "content": "noindex, nofollow"
        }
      ]
    });

    if (page.value.hasOwnProperty('code') && page.value.hasOwnProperty('message')) {
      hasError.value = true;
    } else {
      store.setCurrentPage(page.value[0]);
      pageObject.value = page.value[0];
      content.value = page.value[0].preview_acf ? store.getPreviewContent : store.getContent;
      
      // HANDLE TRANSLATIONS for preview
      if (page.value[0].cm_translations) {
        handleTranslations(page.value[0]);
      }
    }

  } else {
    // else do normal stuff.

    const { page } = await useCheckmateSingle();

    if (page.value && page.value[0]) {
      // Set page content in the store.
      store.setCurrentPage(page.value[0]);
      // Set flex content.
      content.value = store.getContent;
      pageObject.value = page.value[0];

      // HANDLE TRANSLATIONS
      if (page.value[0].cm_translations) {
        handleTranslations(page.value[0]);
      }

      if(content.value && content.value.length > 0) {
        if(content.value[0].acf_fc_layout === 'block_hero') {
          store.setHeaderTextColor('white');
        } else {
          store.setHeaderTextColor('black');
        }
      } else {
        store.setHeaderTextColor('black');
      }
      // Set headers
      useHead(getSeoHead(store.meta));
      usePageCacheHeaders(page);
    } else {
      //If not found, throw 404 error.
      throw createError({
        statusCode: 404,
        statusMessage: "Page Not Found: " + route.fullPath,
        fatal: true,
      });
    }
  }
}

// Rest of your code remains the same...



const flowmateContext = ref({});
const flowmateActiveBlockIndex = ref(-1);

const pageContent = computed(() => {
  if (flowmate.isEnabled()) {
    if(flowmateContext.value.acf === undefined) {
      return [];
    } else {
      return flowmateContext.value.acf.content;
    }
  } else {
    return content.value;
  }
});

const currentPage = computed(() => {
  if (flowmate.isEnabled()) {
    return flowmateContext.value;
  } else {
    return pageObject.value;
  }
});

if (flowmate.isEnabled()) {
  // Set watcher for liveSessionBlockIndex
  watch(() => flowmateActiveBlockIndex.value, (newVal, oldVal) => {
    // Find the flex content section with the index and scorll to it
    if (newVal > -1) {
      const block = document.querySelector(`main [data-index="${newVal}"]`);

      if (block) {

        document.querySelectorAll('.flex-section').forEach((section) => {
          section.classList.remove('fm-active');
        });

        // Add active class to the block
        block.classList.add('fm-active');

        window.scrollTo({
          top: block.offsetTop - 100,
          behavior: 'smooth',
        })
      }
    }
  });
}

const fontFamily = ref('');

onMounted(() => {
  // Check if the route query contains fmcid and fmsid.
  if (flowmate.isEnabled()) {
    // Get the live session id from the route query.
    const liveSessionId = route.query.fmsid;
    // this will update the data.
    $readSession(liveSessionId, flowmateContext, flowmateActiveBlockIndex);
  }

  if (currentPage.value && currentPage.value.type === 'demo-page') {
    setCustomFont();
  }
});

const setCustomFont = () => {
  if (currentPage.value && currentPage.value.acf && currentPage.value.acf.font_selector) {
    const googleFontsUrl = currentPage.value.acf.font_selector.font_embed_code;
    const googleFontsLink = document.createElement('link');
    googleFontsLink.rel = 'stylesheet';
    googleFontsLink.href = googleFontsUrl;
    document.head.appendChild(googleFontsLink);
    fontFamily.value = currentPage.value.acf.font_selector.font_css;
  }
}

watch(() => currentPage.value, (newVal, oldVal) => {
  if (flowmate.isEnabled() && newVal && newVal.type === 'demo-page' && currentPage.value && currentPage.value.id) {
    setCustomFont();
  }
});
</script>