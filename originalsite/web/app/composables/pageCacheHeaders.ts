import {setHeaders} from "h3";
import crypto from 'crypto';


export function usePageCacheHeaders(page: any) {

    if (process.server && page) {

        if (!page.value[0]) {
            return;
        }

        const event = useRequestEvent();
        const d = new Date(page.value[0].modified_gmt);
        const lastModified = d.toUTCString();

        const { cacheKey } = useCheckmateCacheKey();

        // Create etag for headers.
        // TODO create hash also based on the current build.
        const contentKey = cacheKey.value + "-" + page.value[0].modified_gmt + "-" + page.value[0].id  + process.env.BITBUCKET_COMMIT;
        const contentHash = crypto.createHash('md5').update(contentKey).digest('hex');
        const etag =  "W/\"" + contentHash + "\"" ;
        // console.log(contentKey, contentHash, etag);
        // console.log("ETAG", etag);

        // Using etag or last modified does not currently work well with new builds. Use at own risk.
        setHeaders(event, {
            // 'Last-Modified': lastModified,
            'Cache-Control': 'max-age=1, must-revalidate, stale-while-revalidate=59',
            'ETag': etag,
            // 'alt-svc': 'h3-27=":443"; ma=86400, h3-28=":443"; ma=86400, h3-29=":443"; ma=86400, h3=":443"; ma=86400;',
            // 'Cache-Control': 'max-age=0, s-maxage=60'
        });
    }

}