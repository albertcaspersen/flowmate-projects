<template>
  <main class="z-10 relative pb-global container mx-auto">

    <div class="col-span-12 pt-global">
      <p class="subtitle">Search result for:</p>
      <h2 v-if="instantSearch" v-html="sanitize(formData.q)"></h2>
      <h2 v-if="!instantSearch" v-html="sanitize(searchData.q)"></h2>
    </div>

      <!-- Create serach form -->
      <form class="col-span-12 pt-global" @submit.stop.prevent="updateSearch">

        <h2>Search again:</h2>

        <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input v-model="formData.q" type="search" id="default-search" autocomplete="off" class="block w-full p-6 ps-12 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter search keywords ..." required>
          <button type="submit" class="text-white btn primary absolute end-2.5 bottom-2.5 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2">Search</button>
        </div>
      </form>

      <client-only>
        <div v-if="loading" class="col-span-12 pt-global">
          <div class="flex gap-8 items-center py-8">
            Loading search results ...
            <!-- Loading spinner -->
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"></path>
            </svg>
          </div>
        </div>


        <div class="grid grid-cols-12 gap-4 py-8" v-else-if="!loading && searchData.hits.length > 0">
          <div class="col-span-12">Hits: {{ searchData.total}}</div>

          <!-- TODO implement search result components (meilisearch uses 'default' json structure, wp/relevanssi uses custom data struture -->

          <div v-for="hit in searchData.hits" class="col-span-12 border-b-2 border-gray-100 py-8">
            <div v-if="instantSearch" class="grid grid-cols-12 gap-4 p-4 items-center">

              <div class="col-span-3">
                <lazy-cm-picture  v-if="hit.featured_image_object" :image-object="hit.featured_image_object"  :crops="['default:medium', 'md:large', 'lg:1536x1536']" />
              </div>
              <div class="col-span-9">
                <h3>
                  <nuxt-link :to="hit.post_path">{{hit.title.rendered}}</nuxt-link>
                </h3>
                <p>Lorem ipsum site amet</p>
              </div>
              <!-- <p v-html="hit.excerpt"></p> -->
            </div>
            <div v-else>
              <h3>
                <a :href="hit.url">{{hit.title}}</a>
              </h3>
              <p>Lorem ipsum site amet</p>
              <!-- <p v-html="hit.excerpt"></p> -->
            </div>

          </div>
        </div>
        <div class="col-span-12 pt-global" v-else-if="!loading && searchData.hits.length === 0">
          <h2>No results...</h2>
        </div>
      </client-only>
  </main>
</template>

<script setup>
import {useCoreStore} from "~/stores/core";
import {useCheckmateCacheKey} from "~/composables/checkmateCacheKey";
const { cacheKey } = useCheckmateCacheKey();
const store = useCoreStore();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const meilisearchEnabled = config.public.meilisearch.enabled;
const loading = ref(false);
const instantSearch = ref(!!meilisearchEnabled);

const formData = reactive({
  q: ''
});
const searchData = reactive({
  q: '',
  hits: [],
  total: 0,
  totalPages: 0
});

// Sets initial value(s).
formData.q = route.query.q;
searchData.q = route.query.q;

const sanitize = (value) => {

  if (!value) {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  }

  const reg = /[&<>"']/gi

  return value.replace(reg, (match) => {
    return map[match]
  });
}

const sanitizedQuery = computed(() => {

  if (!formData.q) {
    return '';
  }
  return sanitize(formData.q);

});

const updateSearch = async () => {
  if (!formData.q) {
    return;
  }
  searchData.q = formData.q;
  // Update router.
  await router.push({query: {q: sanitizedQuery.value}});
}

const performSearch = async () => {

  if(!instantSearch.value) {
    loading.value = true;
  }

  const params = {
    cmv: cacheKey.value,
    orderby: 'relevance',
    keyword: sanitizedQuery.value,
    acf_content: true,
    acf_format: 'standard',
    lazy: true,
    page: 1,
    per_page: 10
  }

  const res = await $fetch('/api/search?' + new URLSearchParams(params));
  // Update search values.
  searchData.hits = res.hits;
  searchData.total = res.total;
  searchData.totalPages = res.totalPages;

  loading.value = false;

}

watch(() => route.query.q, async () => {
  formData.q = route.query.q;
  searchData.q = route.query.q;
  await performSearch();
});

// Add watcher for instant search.
if(instantSearch.value) {
  watch(() => formData.q , async () => {
    await performSearch();
  });
}


await performSearch();

definePageMeta({
  pageTransition: {
    name: "page"
  },
});

</script>
