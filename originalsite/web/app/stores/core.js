import { defineStore } from 'pinia';
import fs from "fs";

export const useCoreStore = defineStore('CoreStore', {
    state: () => {
        return {
            showMenu: false,
            showSearchbar: false,
            locations: ['menu-1'], // @deprecated - use config.public.menu.locations in the nuxt config file.
            menus: {
                "en": null,
                "da": null
            },
            settings: {
                front_pages: [
                    { locale: 'en', slug: '' },      // English homepage 
                    { locale: 'da', slug: 'forside' } // Danish homepage
                ],
                get_started_pages: [
                    { locale: 'en', slug: 'get-started' },      // English Get Started page
                    { locale: 'da', slug: 'kom-i-gang' }        // Danish Get Started page
                ]
            },
            cacheKey: 'default',
            meta: {},
            currentPage: {},
            buildNumber: 0,
            routeUpdate: 0,
            headerTextColor: 'white'
        }
    },
    getters: {
        getShowMenu(state) {
            return state.showMenu;
        },
        getMenu: (state) => (location, lang) => {
            // Check if location and lang is set and return it.
            if (state.menus[lang] && state.menus[lang][location]) {
                return state.menus[lang][location];
            } else {
                return null;
            }
        },
        getCacheKey(state) {
            return state.cacheKey;
        },
        getShowSearchbar(state) {
            return state.showSearchbar;
        },
        getCurrentPage(state) {
            return state.currentPage;
        },
        getRouteUpdate(state) {
            return state.routeUpdate;
        },
        getPreviewContent(state) {
            return state.currentPage?.preview_acf.content;
        },
        getContent(state) {
            return state.currentPage.acf.content;
        },
        getSettings(state) {
            return state.settings;
        },
        getHeaderTextColor(state) {
            return state.headerTextColor;
        }
    },
    actions: {
        setCacheKey(){
            // Get cache key from cache file.
            const config = useRuntimeConfig();
            // console.log("CONFIG", config.public.build);

            try {
                let raw = fs.readFileSync('./cache.config.json');
                let cacheConfig = JSON.parse(raw);
                this.cacheKey = cacheConfig.cache_key + config.public.build.number;
            } catch (e) {
                // console.log('CACHE KEY ERROR: ', e);
            }
        },
        setHeaderTextColor(color){
            this.headerTextColor = color;
        },
        routeUpdated() {
            this.routeUpdate = this.routeUpdate + 1;
        },
        setCurrentPage(pageData){
            this.currentPage = pageData;
        },
        setMeta(metaData){
            this.meta = metaData;
        },
        toggleShowMenu() {
            this.showMenu = !this.showMenu;
            if(this.showMenu){
                document.body.classList.add('overflow-hidden');
            } else {
                document.body.classList.remove('overflow-hidden');
            }
        },
        toggleShowSearchbar() {
            this.showSearchbar = !this.showSearchbar;
        },
        /**
         * Fetches project initialization data.
         * @returns {Promise<void>}
         */
        async fetchProjectInitData() {

            const config = useRuntimeConfig();
            const locations = config.public.menu.locations;

            const { data, pending, error, refresh } = await useFetch('/api/init', {
                query:  {
                    cmv: this.cacheKey
                }
            });

            // IF success
            if (data) {
                // Sets settings.
                this.settings = data.value.settings;
                if(data.value.cache_key && this.cacheKey === 'default') {
                    // Only update the cache key if the current one is unset (default).
                    // console.log("setting cache key", data.value.cache_key);
                    this.cacheKey = data.value.cache_key;
                }
                if (data.value.hasOwnProperty('menus')) {
                    if (data.value.menus) {
                        ['en', 'da'].forEach((lang) => {
                            if (data.value.menus.hasOwnProperty(lang)) {
                                this.menus[lang] = data.value.menus[lang];
                            }
                        });
                    }
                }
            }
        },
        async fetchMenus(){
            const { $apiReqUrl } = useNuxtApp();
            const baseUrl = $apiReqUrl('/wp/v2/cm-menus');
            // console.log("fetching menues form: ", baseUrl);

            const config = useRuntimeConfig();
            const locations = config.public.menu.locations;

            await $fetch( baseUrl, {
                method: 'GET',
                params: {
                    locations: locations.join(','),
                    structured: true,
                    depth: 3,
                    cmv: this.cacheKey
                }
            })
                .then((res) => {
                    locations.forEach((location) => {
                        this.menues[location] = res[0][location];
                    });
                })
                .catch((err) => {
                    console.log('MENU ERROR: ', err);
                });
        }
    }
});
