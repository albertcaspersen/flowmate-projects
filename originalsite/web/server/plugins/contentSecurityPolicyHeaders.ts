import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response: RenderResponse) => {
        if (!response.headers['content-security-policy']) {

            const scrptSrc = [
                'https://*.googletagmanager.com',
                'https://www.googletagmanager.com',
                'https://tagmanager.google.com',
                'https://www.googleadservices.com',
                'https://googleads.g.doubleclick.net',
                'https://www.google.com',
                'https://consentcdn.cookiebot.com',
                'https://consent.cookiebot.com',
                'https://assets.adoberesources.net',
                'https://documentcloud.adobe.com',
                'https://www.google-analytics.com',
                'https://ajax.cloudflare.com',
                'https://cdn.cloudflare.com',
                'https://*.europe-west1.firebasedatabase.app',
                'https://*.firebasedatabase.app',
                'https://*.smartlook.com'
            ];

            const frameSrc = [
                'https://www.googletagmanager.com',
                'https://www.youtube.com',
                'https://youtu.be',
                'https://www.youtube-nocookie.com',
                'https://vimeo.com',
                'https://player.vimeo.com',
                'https://documentcloud.adobe.com',
                'https://consentcdn.cookiebot.com',
                'https://*.europe-west1.firebasedatabase.app',
                'https://*.firebasedatabase.app',
            ];

            const fontSrc = [
                'https://fonts.gstatic.com',
                'https://fonts.googleapis.com',
                'https://*.typekit.net',
                'data:'
            ]

            const styleSrc = [
                'https://fonts.gstatic.com',
                'https://fonts.googleapis.com',
                'https://*.typekit.net'
            ];

            const frameAncestors = [
                'https://app.flowmate.dk'
            ];

            response.headers['content-security-policy'] = "upgrade-insecure-requests;";
            // Note - unsafe-inline and unsafe-eval are neded for nuxt or gsap or something.
            response.headers['content-security-policy'] += "script-src 'self' 'unsafe-inline' 'unsafe-eval' "+scrptSrc.join(' ')+";";  // NOTE - unsafe-inline and unsafe-eval is required with greensock.
            response.headers['content-security-policy'] += "style-src 'self' 'unsafe-inline' "+styleSrc.join(' ')+";"; // Specifies valid sources for stylesheets.
            response.headers['content-security-policy'] += "frame-ancestors 'self' " + frameAncestors.join(' ') + ";"; // Specifies valid parents that may embed a page using <frame>, <iframe>, <object>, or <embed>.
            response.headers['content-security-policy'] += "font-src 'self' "+fontSrc.join(' ')+";";
            response.headers['content-security-policy'] += "frame-src 'self' "+frameSrc.join(' ')+";";
            // object-src headers.
            response.headers['content-security-policy'] += "object-src 'none';"; // Specifies valid sources for the <object>, <embed>, and <applet> elements.


        }
    })
});

// content-security-policy
// 	default-src 'self' blob: data: *.akamaized.net *.apple.com *.apple-mapkit.com *.cdn-apple.com *.organicfruitapps.com; child-src blob: mailto: embed.music.apple.com embed.podcasts.apple.com https://recyclingprogram.apple.com swdlp.apple.com www.apple.com www.instagram.com platform.twitter.com www.youtube-nocookie.com; img-src 'unsafe-inline' blob: data: *.apple.com *.apple-mapkit.com *.cdn-apple.com *.mzstatic.com; script-src 'unsafe-inline' 'unsafe-eval' blob: *.apple.com *.apple-mapkit.com www.instagram.com platform.twitter.com; style-src 'unsafe-inline' *.apple.com
