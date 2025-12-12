import {getQuery, getRequestHeader, setHeader} from 'h3';
import {useCacheKey} from "~~/server/composables/cacheKey";

/**
 * Testing API with caching.
 */
export default cachedEventHandler(

    async (e) => {

        const config = useRuntimeConfig();

        const query = getQuery(e);
        const allowed_query_params = [
            'acf_content', 'acf_format', 'lazy', 'single', 'path', 'cmv', 'id', 'ids', '_fields', 'location', 'lang', 'nocache',
        ];
        const blacklisted_keywords = [
            'wp-config.php', 'wp-admin', 'admin-ajax.php', 'config.php', 'wp-cron.php', 'index.php', 'composer.json', 'package.json', 'style.css', 'functions.php', 'wp-include', 'wp-login', 'wp-login.php'
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

        let endpoint = config.private.backendUrl + "/wp-json/wp/v2/posts?" + new URLSearchParams(query).toString();

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });


        const results = await response.json();
        setHeader(e, 'x-wp-total', parseInt(response.headers.get("x-wp-total")));
        setHeader(e, 'x-wp-totalpages', parseInt(response.headers.get('x-wp-totalpages')));
        setHeader(e, 'alt-svc', 'h3-27=":443"; ma=86400, h3-28=":443"; ma=86400, h3-29=":443"; ma=86400, h3=":443"; ma=86400;');

        return {
            results: results,
            total: parseInt(response.headers.get("x-wp-total")),
            totalPages: parseInt(response.headers.get('x-wp-totalpages')),
        }

    },
    {
        name: 'wp-posts',
        maxAge: 3600, // cache URLs for 1 hours.
        getKey: (e: H3Event) => {
            const query = getQuery(e);
            const { generateApiCacheKey } = useCacheKey();
            return generateApiCacheKey('wp-posts', query, ['path', 'id', 'ids', '_fields', 'lang']);
        },
        shouldBypassCache: (e) => {
            // Bypass is the env is localhost
            return process.env.NODE_ENV === 'development';
        }
    }
)