import { ref } from 'vue';
import fs from "fs";
import {useCoreStore} from "~/stores/core";

/**
 * Composable to fetch the cache key from the core store.
 */
export function useCheckmateCacheKey () {
    const cacheKey = ref('default');

    const { getCacheKey } = useCoreStore();
    if (getCacheKey) {
        setCacheKey(getCacheKey);
    }

    function setCacheKey (key: string) {
        return cacheKey.value = key;
    }

    return { cacheKey }
}
