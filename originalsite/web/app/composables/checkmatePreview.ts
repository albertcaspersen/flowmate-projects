/**
 * Composable that can be used to set up page components for Singles.
 */
export function useCheckmatePreview() {

    const route = useRoute();
    const loading = ref(false);

    /**
     * Determines if the current page is a preview page.
     */
    const isPreview = computed (() => {
        const query = route.query;
        return query.hasOwnProperty('preview') && query.hasOwnProperty('post_type') && query.hasOwnProperty('post_id') && query.hasOwnProperty('rev');
    });

    const getCurrentPagePreview = async () => {
        const query = route.query;
        if (isPreview.value) {
            return getPagePreview(query.post_id, query.post_type, query.rev, query.post_status);
        }
        return false;
    }

    /**
     * Get preview data.
     *
     * @param post_id
     * @param post_type
     * @param token
     * @param post_status
     */
    const getPagePreview = async (post_id, post_type, token, post_status) => {

        // console.log("getPagePreview", post_id, post_type, token, post_status);
        // const typePlural = post_type + 's'; // TODO this is not really the best way, but it works for now as the feature only works for post(s) and page(s).

        const q = {
            post_id: post_id,
            post_type: post_type,
            rev: token,
            post_status: post_status,
        }

        // Fetch data from api/preview endpoint
        const res = await useFetch('/api/preview/', {
            method: 'GET',
            query: {
                ... q
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const page = ref();
        page.value = res.data.value;
        return page;

    }

    return {
        isPreview,
        loading,
        getCurrentPagePreview,
        getPagePreview
    }

}
