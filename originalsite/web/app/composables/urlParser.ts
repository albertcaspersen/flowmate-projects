export function useUrlParser(url: string, options: object = {}) {

    const config = useRuntimeConfig();
    const backendRewriteUrls = config.public.backendRewriteUrls;

    if (!url || url === '' || url === undefined) {
        console.error("URL is empty");
        return {
            path:false,
            url: false,
            isInternal: false
        };
    }

    // const adminUrl = new URL(admin);
    let inputUrl = null;

    // Validate the URL is an url before trying to parse it.
    try {
        inputUrl = new URL(url);
    } catch (e) {
        console.error("URL is not valid", url);
        return {
            path:false,
            url: false,
            isInternal: false
        };
    }

    let path = url;
    let is_internal = false;

    let backendRewriteUrlsArray = backendRewriteUrls !== undefined ? backendRewriteUrls.split(',') : [];
    // Push the admin URL to the array
    // if (!backendRewriteUrlsArray.includes(admin)) {
    //     backendRewriteUrlsArray.push(admin);
    // }

    // Check if window location is not in the backendRewriteUrlsArray
    if ( typeof window !== 'undefined' && !backendRewriteUrlsArray.includes(window.location.origin)) {
        backendRewriteUrlsArray.push(window.location.origin);
    }

    // Check if the input URL has a different host than the admin URLs.
    if (inputUrl && backendRewriteUrls) {
        // Split backendRewriteUrls - comma separated list of rewrite URLs.
        backendRewriteUrlsArray.forEach((rewriteUrl) => {
            if (rewriteUrl.indexOf('localhost') === 0) {
                if (inputUrl && inputUrl.host === 'localhost') {
                    is_internal = true;
                    path = inputUrl.pathname;
                }
            } else {
                const rewriteUrlObject = new URL(rewriteUrl);
                if (inputUrl && inputUrl.host === rewriteUrlObject.host) {
                    is_internal = true;
                    path = inputUrl.pathname;
                }
            }
        });
    }

    return {
        path: path,
        url: inputUrl,
        isInternal: is_internal
    };
}
