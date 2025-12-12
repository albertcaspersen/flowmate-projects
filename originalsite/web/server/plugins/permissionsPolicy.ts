import type { NitroAppPlugin, RenderResponse } from 'nitropack'
export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response: RenderResponse) => {
        if (!response.headers['permissions-policy']) {
            response.headers['permissions-policy'] = "interest-cohort=(), camera=(), microphone=(), geolocation=(), payment=()";
        }
    })
});