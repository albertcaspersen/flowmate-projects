import {getQuery, getRequestHeader, setHeader} from 'h3';
import {joinURL} from "ufo";

export default defineEventHandler(async (e) => {

    const config = useRuntimeConfig();
    const backendUrl = config.private.backendUrl;

    const query = getQuery(e);
    const allowed_query_params = [
        'acf_content', 'acf_format', 'lazy', 'single', 'path', 'cmv', 'id', 'ids', '_fields', 'location', 'lang', 'nocache', 'include', 'types', 'per_page', 'page'
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

    // If the slug doesn't start with wp-json, we can assume it's invalid.
    const slug = e.context.params.slug;
    if (!slug.startsWith('wp-json')) {
        invalidRequest = true
    }

    if (invalidRequest) {
        return [];
    }

    const targetUrl = joinURL(backendUrl, slug) + '?' + new URLSearchParams(query).toString();

    return proxyRequest(e, targetUrl);

});
