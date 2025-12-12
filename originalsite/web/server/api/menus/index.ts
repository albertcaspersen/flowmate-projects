import {getQuery} from "h3";
import {useCacheKey} from "~~/server/composables/cacheKey";

export default cachedEventHandler(
    async (e) => {

        const config = useRuntimeConfig();
        const query = getQuery(e);
        const allowed_query_params = [
            'cmv', 'lang', 'locations'
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

        let params = {};
        if (query.lang) {
            params.lang = query.lang;
        }
        if (query.locations) {
            params.locations = query.locations;
        }

        let endpoint = config.private.backendUrl + "/wp-json/cm/v1/menus/";

        const response = await $fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            query: params
        });


        if (response && response[0]) {
            return response;
        }

        return {}

    },
    {
        name: 'menus',
        maxAge: 600, // cache URLs for 0 seconds.
        staleMaxAge: 1, // serve stale cache for 30s
        swr: true,
        getKey: (e: H3Event) => {
            const query = getQuery(e);
            const { generateApiCacheKey } = useCacheKey();
            return generateApiCacheKey('wp-menus', query, ['lang', 'locations']);
        },
        shouldBypassCache: (e) => {
            // Bypass is the env is localhost
            return process.env.NODE_ENV === 'development';
        }
        // shouldBypassCache: (e) => {
        //     return true;
        // }
    }
)