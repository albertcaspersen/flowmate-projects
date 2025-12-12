/**
 * Composoble for image proxying. Takes a URL and returns a proxied URL.
 *
 * @param image_url
 * @param cacheKey
 */
export function useCheckmateImageProxy(image_url: string, cacheKey?: string) {

    const config = useRuntimeConfig();
    const imageUrl = new URL(image_url);
    let url = image_url;

    const proxyUrl = config.public.siteUrl !== undefined && config.public.siteUrl !== null ? config.public.siteUrl : false;
    if (proxyUrl !== false && !proxyUrl.includes('localhost')) {
        // Creates a full URL for the proxied image.
        // url = proxyUrl + imageUrl.pathname.replace('/wp-content/uploads/', '/');
        url = proxyUrl + imageUrl.pathname;
    }
    // Returns the URL and whether the proxy was used - mostly for debugging.

    if (cacheKey) {
        url = url + '?v=' + cacheKey;
    }

    return {
        url,
        isProxy: proxyUrl !== false
    }

}
