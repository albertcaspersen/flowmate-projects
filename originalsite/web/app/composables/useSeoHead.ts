import { useCheckmateUrlProxy } from "~/composables/checkmateUrlProxy";
import { useCheckmateImageProxy } from "~/composables/checkmateImageProxy";

export function useSeoHead() {
    function getSeoHead(data) {
        if (data === undefined) {
            return [];
        }
        const config = useRuntimeConfig();
        const metaTitle = data.title ?? data.title;
        const metaData = [];
        let canonical = '';

        if (data.robots) {
            metaData.push({
                hid: 'robots',
                name: 'robots',
                content: Object.values(data.robots).join(", "),
            });
        }
        if (data.og_description) {
            metaData.push({
                hid: 'description',
                name: 'description',
                content: data.og_description,
            });
        }
        if (data.og_title) {
            metaData.push({
                hid: 'og:title',
                property: 'og:title',
                content: data.og_title.replaceAll('&amp;', '&').replaceAll('&shy;', ''),
            });
        }
        if (data.og_image && data.og_image.length > 0) {
            const { url } = useCheckmateImageProxy(data.og_image[0].url);
            metaData.push({
                hid: 'og:image',
                property: 'og:image',
                content: url,
            });
        }
        if (data.og_description) {
            metaData.push({
                hid: 'og:description',
                property: 'og:description',
                content: data.og_description,
            });
        }
        if (data.og_url) {
            const { url } = useCheckmateUrlProxy(data.og_url);
            metaData.push({
                hid: 'og:url',
                property: 'og:url',
                content: url,
            });

            canonical = url;
        }

        let links = [];

        if (canonical) {
            links.push({
                rel: 'canonical',
                href: canonical,
            });
        }

        metaData.push({
            name: 'google-site-verification',
            content: 'xxxx-xxxx',
        });

        // if (config.public.multilang.enabled) {
        //     const i18nHead = useLocaleHead({
        //         addSeoAttributes: true,
        //         addDirAttribute: true
        //     })

        //     return {
        //         htmlAttrs: {
        //             lang: i18nHead.value.htmlAttrs.lang,
        //             dir: i18nHead.value.htmlAttrs.dir,
        //         },
        //         title: metaTitle,
        //         meta: [...metaData, ...(i18nHead.value.meta || [])],
        //         link: links,
        //     };
        // }

        return {
            title: metaTitle,
            meta: metaData,
            link: links,
        };
    }

    return {
        getSeoHead,
    };
}
