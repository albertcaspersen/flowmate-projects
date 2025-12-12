import {useCacheKey} from "~~/server/composables/cacheKey";

export default cachedEventHandler(
    async (e) => {

        const config = useRuntimeConfig();
        const backendUrl = config.private.backendUrl;
        const themeInitUrl = backendUrl + '/wp-json/cm/v1/theme/init';

        // Get query params, so we can pass them to the init function properly.
        const query = getQuery(e);

        const allowed_query_params = [
            'cmv', 'locations', 'structured', 'depth',
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

        // The init params are passed to the backend, based on the config and not the query args.
        const backendQuery = {
            depth: 3,
            locations: config.public.menu.locations.join(','),
            structured: true,
        }

        // console.log("QUERY", themeInitUrl);
        // console.log("backendQuery", backendQuery);
        //
        // useFetch(baseUrl, { method: 'GET'})
        return await $fetch(themeInitUrl, {
            method: 'GET',
            params: backendQuery
        }).then((res) => {
            // console.log("RES", res)
            return res;
        }).catch((err) => {
            console.error('INIT ERROR: ', err);
            return {
                ... err
            }
        });

    },
    {
        name: 'theme-init',
        maxAge: 1200, // cache URLs for 600 second
        swr: true,
        getKey: (e: H3Event) => {
            const query = getQuery(e);
            const { generateApiCacheKey } = useCacheKey();
            return generateApiCacheKey('theme-init', query, ['cmv']);
        },
        shouldBypassCache: (e) => {
            // Bypass is the env is localhost
            return process.env.NODE_ENV === 'development';
        }
    }
)
