import {useCheckmateCacheKey} from "~/composables/checkmateCacheKey";
import {useCoreStore} from "~/stores/core";

/**
 * Composable that can be used to set up page components for Singles.
 *
 * @version 1.0.0
 *
 * TODO - Error handling.
 *
 * @param ids
 * @param pagePath
 * @param options
 */
export async function useFetchMate(ids: array = [], setYoastMeta: boolean = false, pagePath?: string, options: object = {}) {
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
    const items = ref();

    const loading = ref(true); // TODO not needed anymore as we now use normal async await pattern ...
    // Get the current path.
    let path = pagePath ? pagePath : useRoute().path;
    // Set loading to true.
    loading.value = true;
    const params = {acf_content: acf_content, acf_format: acf_format, lazy: lazy, single: single}; //
    let key = path.replace(/\//g, '-');

    if(ids && ids.length !== 0) {
        params.ids = ids.join(',');
        params.include = ids.join(',');
        if (store.settings.hasOwnProperty('cachemate') && config.public.cachemate.enabled && (config.public.redis.enabled || config.public.db.enabled)) {
            params.orderby = 'ids'; //TODO: This probably doesnt work
        } else {
            params.orderby = 'include';
        }
        params.single = false;
        key += '-' + ids.join('-');
    } else {
        params.path = path;
    }

    const query = {
        cmv: cacheKey.value,
        ...params,
    };

    // console.log("CACHE FLUFFER", store.settings.hasOwnProperty('cachemate'), config.public.cachemate.enabled);
    // Use 'new' /api/pages proxy.

    const { data: responseData, pending, error, refresh} = await useAsyncData(
        key,
        async () => {

            // console.log(query);

            // Default priority: check if db(1) can be used, then try meilisearch(2), then try wp(3).

            // const result = await $fetch('/api/content/', {
            //     query: query
            // });

            // return result;
            // Attempt to load data from searchmate cache.
            if (store.settings.hasOwnProperty('cachemate') && config.public.cachemate.enabled) {

                const result = await $fetch('/api/content/', {
                    query: query
                });

                return result;

            } else {
                // New API (uses /api/pages endpoint).
                // console.log("TRY NEW ENDPOINT");
                const result = await $fetch('/api/pages/', {
                    query: query
                });
                // console.log("WP RESULT", result);
                return result;

            }
        }
    )

    // Sets the page value.
    items.value = responseData.value;

    // Set meta data.
    if (items.value && items.value[0] && setYoastMeta) {
        store.setMeta(items.value[0].yoast_head_json);
    }

    return {
        items,
        loading
    };

}
