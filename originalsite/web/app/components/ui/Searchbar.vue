<template>
<!-- Create serach form -->
  <form class="col-span-12 pt-global" @submit.stop.prevent="updateSearch">
    <label for="default-searchbar" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
    <div class="relative">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
      </div>
      <input v-model="formData.q" type="search" id="default-searchbar"
             class="block w-full p-6 ps-12 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
             placeholder="Enter search keywords ..." required>
      <button type="submit"
              class="text-white btn primary absolute end-2.5 bottom-2.5 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2">
        Search
      </button>
    </div>
  </form>
</template>

<script setup>
import {useCoreStore} from "~/stores/core";
import {useCheckmateCacheKey} from "~/composables/checkmateCacheKey";

const store = useCoreStore();
const route = useRoute();
const router = useRouter();
const { cacheKey } = useCheckmateCacheKey();
const loading = ref(false);
const formData = reactive({
  q: ''
});

// Sets initial value(s).

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

  // Update router.
  await router.push({path: "/search", query: {q: sanitizedQuery.value}});
  formData.q = '';

  setTimeout(() => {
    store.toggleShowSearchbar();
  }, 50);

}

// Focus search input on open
watch(() => store.getShowSearchbar, () => {
  if (store.getShowSearchbar) {
    setTimeout(() => {
      document.querySelector('input[id="default-searchbar"]').focus();
      // document.querySelector('input[id="default-searchbar"]').value = '';
      // document.querySelector('input[id="default-searchbar"]').value = val;
    }, 100);
  }
});

// Bind escape to toggle searchbar
onMounted(() => {
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      if (store.getShowSearchbar) {
        store.toggleShowSearchbar();
      }
    }
  });
});

// Remove event listener for escape on unMounted?


</script>