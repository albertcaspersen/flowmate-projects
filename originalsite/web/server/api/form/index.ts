import {getQuery, readBody} from 'h3';

export default eventHandler(

    async (e) => {

        const config = useRuntimeConfig();

        const query = getQuery(e);
        const body = await readBody(e);
        const allowed_query_params = [
            'acf_content', 'acf_format', 'lazy', 'single', 'path', 'cmv', 'id', 'ids', '_fields', 'location', 'lang', 'nocache', 'include', 'orderby'
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

        let endpoint = config.private.backendUrl + "/wp-json/cmcf/v1/process-contact-form";
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        return result;
    },
)
