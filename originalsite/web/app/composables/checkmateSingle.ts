import {useCheckmateCacheKey} from "~/composables/checkmateCacheKey";
import {useCoreStore} from "~/stores/core";


/**
 * Composable that can be used to set up page components for Singles.
 *
 * @version 1.0.0
 *
 * TODO - Error handling.
 *
 * @param pagePath
 * @param options
 */
export async function useCheckmateSingle(pagePath?: string, options: object = {}) {
    const {
        acf_content = true,
        acf_format = 'standard',
        lazy = true,
        single = true
    } = options;

    const config = useRuntimeConfig();
    const store = useCoreStore();
    const { cacheKey } = useCheckmateCacheKey();

    // Set up some reactive variables.
    const page = ref();
    const loading = ref(true); // TODO not needed anymore as we now use normal async await pattern ...

    // Get the current path.
    const path = pagePath ? pagePath : useRoute().path;
    // Set loading to true.
    loading.value = true;
    const params = {acf_content: acf_content, acf_format: acf_format, lazy: lazy, single: single}; //
    const key = path.replace(/\//g, '-');

    // Default behavior.
    const { data: responseData, pending, error, refresh} = await useAsyncData(
        key,
        async () => {

            // Default priority: check if db(1) can be used, then try meilisearch(2), then try wp(3).

            // Attempt to load data from searchmate cache.
            if (store.settings.hasOwnProperty('cachemate') && store.settings.cachemate.enabled && config.public.cachemate.enabled) {

                const result = await $fetch('/api/content/', {
                    query: {
                        path: path,
                        cmv: cacheKey.value,
                        ...params,
                    }
                });

                return result;

            } else {
                // New API (uses /api/pages endpoint).
                // console.log("TRY NEW ENDPOINT");

                const result = await $fetch('/api/pages/', {
                    query: {
                        path: path,
                        cmv: cacheKey.value,
                        ...params,
                    }
                });
                // console.log("WP RESULT", result);
                return result;

            }
        }
    )

    // Sets the page value.
    page.value = responseData.value;

    // Set meta data.
    if (page.value && page.value[0]) {
        store.setMeta(page.value[0].yoast_head_json);
    }

    return {
        page,
        loading
    };

}
