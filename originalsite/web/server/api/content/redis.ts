import { createClient } from 'redis';
import {getQuery} from "h3";
import md5 from 'md5';
import {useCacheKey} from "~~/server/composables/cacheKey";

export default cachedEventHandler(
    async (e) => {

        const config = useRuntimeConfig();
        const redisConfig = config.private.redis;
        // const redis = require('redis');

        const query = getQuery(e);
        const allowed_query_params = [
            'acf_content', 'acf_format', 'lazy', 'single', 'path', 'cmv', 'id', 'ids', '_fields', 'location', 'lang',
        ];
        const blacklisted_keywords = [
            'wp-config.php', 'wp-admin', 'admin-ajax.php'
        ];

        // Remove any invalid query params.
        Object.keys(query).forEach(key => {
            if (!allowed_query_params.includes(key) || blacklisted_keywords.includes(query[key])) {
                delete query[key];
            }
        });

        const client = await createClient({
            url: 'rediss://'+redisConfig.username+':'+redisConfig.password+'@'+redisConfig.host+':'+redisConfig.port
        }) .on('error', err => console.log('Redis Client Error', err))
        .connect();

        let postKey = false;

        const results = [];

        if (query.hasOwnProperty('path')) {

            let queryPath = query.path;
            // Make sure querypath starts and ends with /
            if (queryPath) {
                if (!queryPath.startsWith('/')) {
                    queryPath = '/' + queryPath;
                }
                if (!queryPath.endsWith('/')) {
                    queryPath = queryPath + '/';
                }
            }

            const pathKey = "cm:path:" + md5("en"+query.path)
            postKey = await client.get(pathKey);
            if (!postKey) {
                // console.log("NO VALUE");
                return [];
            }

            const data = await client.get(postKey);
            if (!data) {
                // console.log("NO DATA");
                return [];
            }
            const json = JSON.parse(data);
            results.push({ ... json });
        } else if (query.hasOwnProperty('id') || query.hasOwnProperty('ids')) {

            const post_ids = [];
            if (query.hasOwnProperty('id')) {
                post_ids.push(query.id);
            } else if (query.hasOwnProperty('ids')) {
                post_ids.push(...query.ids.split(','));
            }

            const ids = post_ids.map(id => "cm:document:"+id);
            const data = await client.mGet(ids);
            if (!data) {
                // console.log("NO DATA");
                return [];
            }
            data.forEach(item => {
                if (item) {
                    const json = JSON.parse(item);
                    results.push({ ... json });
                }
            });

        }

        await client.disconnect();
        return results;

    },
    {
        name: 'cachemate-redis',
        maxAge: 5, // cache URLs for 5 second
        swr: true,
        getKey: (e: H3Event) => {
            const query = getQuery(e);
            const { generateApiCacheKey } = useCacheKey();
            return generateApiCacheKey('content', query, ['path', 'id', 'ids', '_fields', 'lang']);
        },
        // shouldBypassCache: (e) => {
        //     // Bypass is the env is localhost
        //     return process.env.NODE_ENV === 'development';
        // }
        // shouldBypassCache: (e) => {
        //     const query = getQuery(e);
        //     return query.nocache === 'true';
        // },
        // shouldInvalidateCache: (e) => {
        //     const query = getQuery(e);
        //     return query.invalidate === 'true';
        // }

    }
)