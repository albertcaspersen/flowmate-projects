import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response: RenderResponse) => {
        response.headers['referrer-policy'] = 'strict-origin-when-cross-origin';
    })
});