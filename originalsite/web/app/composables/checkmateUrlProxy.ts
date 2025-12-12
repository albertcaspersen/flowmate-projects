/**
 * Composoble for asset proxying. Takes a URL and returns a proxied URL.
 *
 * @param image_url
 * @param options
 */
export function useCheckmateUrlProxy(asset_url: string) {

    const config = useRuntimeConfig();
    const assetUrl = new URL(asset_url);
    let url = asset_url;
    const proxyUrl = config.public.siteUrl !== undefined && config.public.siteUrl !== null ? config.public.siteUrl : false;
    if (proxyUrl) {
        // Creates a full URL for the proxied image.
        url = proxyUrl + assetUrl.pathname;
    }
    // Returns the URL and whether the proxy was used - mostly for debugging.
    return {
        url,
        isProxy: proxyUrl !== false
    }

}
