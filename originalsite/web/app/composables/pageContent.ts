import {useCoreStore} from "~/stores/core";

/**
 * Composable for page content
 *
 * TODO - Should we include flowmate check for this?
 *
 * @version 1.0.0
 */
export const usePageContent = () => {

    const store = useCoreStore();

    // Current page.
    const currentPage = computed(() => {
        return store.currentPage;
    });

    const pageContent = computed(() => {
        return store.getContent;
    });

    const pagePreviewContent = computed(() => {
        return store.getPreviewContent;
    });

    // Return the computed values.
    return {
        currentPage,
        pageContent,
        pagePreviewContent
    }

}