<script setup>
import {useSeoHead} from "~/composables/useSeoHead";
const {getSeoHead} = useSeoHead();
const config = useRuntimeConfig();
const props = defineProps({
    error: Object
})
const handleError = () => clearError({ redirect: '/' })

const errorMeta = {
    'title': 'Siden blev ikke fundet...',
    'og_title': 'Siden blev ikke fundet...',
    'robots': {
        'index': 'noindex',
        'follow': 'nofollow',
        'max-image-preview': 'max-image-preview:none',
        'max-snippet': 'max-snippet:-1',
        'max-video-preview': 'max-video-preview:-1'
    }
};

useHead(getSeoHead(errorMeta));
</script>
<template>
    <div id="mainLayout" class="relative min-h-svh flex flex-col justify-between" ref="layout">
        <SiteHeader :text-is-white="false" />
        <main class="pb-32 pt-64">
          <div class="container">
            <div class="default-grid">
              <div class="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                  <h1 class="mb-0" v-html="props.error.statusCode"></h1>
                  <h5 class="mb-4">Vi kunne desværre ikke finde siden...</h5>
                  <p class="mb-0">Gå til forsiden, eller brug navigationen ovenfor.</p>
                  <button class="mt-10 btn btn-large btn-secondary btn-solid" @click="handleError">Gå til forsiden</button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
    </div>
</template>
