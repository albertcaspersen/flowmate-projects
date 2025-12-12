import {getQuery, getRequestHeader, setHeader} from 'h3';

export default defineEventHandler(async (e) => {

    const config = useRuntimeConfig();
    const backendUrl = config.private.backendUrl;

    const query = getQuery(e);

    const post_id = query.post_id;
    const token = query.rev;
    const post_type = query.post_type;
    const post_status = query.post_status;

    const typePlural = post_type + 's'; // TODO this is not really the best way, but it works for now as the feature only works for post(s) and page(s).
    // Use the admin URL:
    // const apiPath = '/wp-json/wp/v2/' + typePlural + '/' + post_id + '/revisions';
    let apiPath = '/wp-json/wp/v2/' + typePlural + '/' + post_id + '/autosaves/'; // Should we have a feature to choose between autosave/revisions endpoint?
    if(post_status === 'draft') {
        apiPath = '/wp-json/wp/v2/' + typePlural + '/' + post_id + '/revisions/';
    }

    const key = apiPath.replace(/\//g, '-');

    const params = {
        per_page: 1,
        orderby: 'id',
        order: 'desc',
        acf_format: 'standard',
        acf_content: true,
        lazy: true,
        single: true,
    }


    const apiUrl = backendUrl + apiPath + '?' + new URLSearchParams(params).toString();

    // console.log("fetching preview data", apiUrl);
    const response = await $fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    })

    // TODO Fix error handling.

    if (response.length > 0) {
        response[0].isPreview = true;
        response[0].post_type = post_type;
    }

    return response;

})