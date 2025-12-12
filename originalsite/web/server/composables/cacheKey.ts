import fs from "fs";
import { hash } from "ohash";

/**
 * Composable to fetch the cache key from the core store.
 */
export const useCacheKey = () => {

    const config = useRuntimeConfig();

    const getKey = () => {
        let cacheKey = 'default';
        try {
            let raw = fs.readFileSync('./cache.config.json');
            let cacheConfig = JSON.parse(raw);
            cacheKey = cacheConfig.cache_key + config.public.build.number;
        } catch (e) {
            return 'default' + config.public.build.number;
        }
        return cacheKey;
    }

    /**
     * Generates a cache key for the API request.
     * @param name
     *   The name of the API request route.
     * @param query
     *   The query params for the current URL or API request.
     * @param params
     *   The params to use for the cache key generation.
     */
    const generateApiCacheKey = (name: string, query: object, params: string[]) => {
        // Create new array of the query based on the params.
        let cacheKeyParts = [getKey()];
        params.forEach((param) => {
            if (query[param]) {
                cacheKeyParts.push(query[param]);
            }
        });
        // console.log("newQuery", cacheKeyParts, hash(cacheKeyParts.join('-')));
        return name + '.' + hash(cacheKeyParts.join('-'));
        // return newQuery.join('-');
    }

    const cacheKey = getKey();

    return {
        generateApiCacheKey,
        cacheKey
    }

}
