import {createGtm } from '@gtm-support/vue-gtm';
export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig();

    nuxtApp.vueApp.use(createGtm({
        id: config.public.gtmId,
        defer: false,
        compatibility: false,
        enabled: config.public.gtmEnabled,
        debug: false,
        loadScript: true,
        vueRouter: useRouter(),
        trackOnNextTick: false,
        pageTracking: true,
        pageViewEventName: 'nuxtRoute',
        respectDoNotTrack: false,
    }));
});
