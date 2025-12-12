import {getQuery, setHeader} from 'h3';
import {useCacheKey} from "~~/server/composables/cacheKey";

/**
 * Testing API with caching.
 */
export default cachedEventHandler(

    async (e) => {

        const config = useRuntimeConfig();
        const query = getQuery(e);

        // Log the query to console for debugging

        const allowed_query_params = [
            'acf_content', 'acf_format', 'lazy', 'single', 'path', 'cmv', 'id', 'ids', '_fields', 'lang', 'nocache', 'invalidate'
        ];
        const blacklisted_keywords = [
            'wp-config.php', 'wp-admin', 'admin-ajax.php', 'wp-cron.php', 'index.php', 'composer.json', 'package.json', 'style.css', 'functions.php', 'wp-include', 'wp-login', 'wp-login.php'
        ];


        let invalidRequest = false;

        // Remove any invalid query params.
        Object.keys(query).forEach(key => {
            if (!allowed_query_params.includes(key) || blacklisted_keywords.includes(query[key]) || blacklisted_keywords.includes(query[key])) {
                delete query[key];
            }
            for (const keyword of blacklisted_keywords) {
                if (query[key] && query[key].includes(keyword)) {
                    invalidRequest = true;
                    delete query[key];
                }
            }
        });

        if (invalidRequest) {
            return [];
        }

        // Check if cachemate is enabled.
        if (config.public.cachemate.enabled) {
            if (config.public.redis.enabled) {
                const result = await $fetch('/api/content/redis/', {
                    query: query
                });

                if (result && result[0]) {
                    return result;
                }
            }

            // Check DB second if enabled.
            if (config.public.db.enabled) {
                const result = await $fetch('/api/content/db/', {
                    query: query
                });
                // console.log("GOT STUFF db", result);
                if (result && result[0]) {
                    return result;
                }
            }
        }

        if (query.hasOwnProperty('id') || query.hasOwnProperty('ids')) {
            // Add include query if id or ids are specified.
            query.include = query.id || query.ids;
        }

        const result = await $fetch('/api/pages/', {
            query: query
        });

        return result.length > 0 ? result : [];
    },
    {
        name: 'content',
        maxAge: 1, // cache URLs for 0 seconds.
        // staleMaxAge: 5, // serve stale cache for 30s
        swr: false,
        getKey: (e: H3Event) => {
            const query = getQuery(e);
            const { generateApiCacheKey } = useCacheKey();
            return generateApiCacheKey('content', query, ['path', 'id', 'ids', '_fields', 'lang']);
        },
        shouldBypassCache: (e) => {
            // Bypass is the env is localhost
            return process.env.NODE_ENV === 'development';
        }
    }
)