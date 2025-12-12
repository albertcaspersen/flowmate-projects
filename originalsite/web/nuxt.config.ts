import pkg from './package';

export default defineNuxtConfig({
    future: {
        compatibilityVersion: 4,
    },

    // Add Vue compiler options for custom elements
    vue: {
        compilerOptions: {
            isCustomElement: (tag) => ['swiper-container', 'swiper-slide'].includes(tag)
        }
    },

    app: {

        pageTransition: {name: 'page', mode: 'out-in'},
        head: {
            title: 'Checkmate Nuxt 3 Template',
            htmlAttrs: {
                prefix: 'og: http://ogp.me/ns#'
            },
            meta: [
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {hid: 'description', name: 'description', content: ''},
                {name: 'msapplication-TileColor', content: '#da532c'},
                {name: 'theme-color', content: '#ffffff'},
            ],
            link: [
                {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
                {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true},
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap'
                },
                {rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png'},
                {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png'},
                {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png'},
                {rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png'},
                {rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico'},
                {rel: 'manifest', href: '/favicon/site.webmanifest'},
                {rel: 'mask-icon', href: '/favicon/web-app-manifest-192x192.png', sizes: '192x192'},
                {rel: 'mask-icon', href: '/favicon/web-app-manifest-512x512.png', sizes: '512x512'},
            ],
        },
    },

    version: pkg.version,

    // Usually we'll want to use static for production, when possible.
    // target: 'static' // static or server
    // static or server
    target: 'server',

    // defaults to true
    ssr: true,

    // defaults to node-server
    preset: 'node-server',

    runtimeConfig: {
        app: {
            // Don't touch this, it's used by the build process to set the correct path to the assets.
        },
        private: {
            meilisearch: {
                apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
                host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
                apiKeyUid: process.env.MEILISEARCH_API_KEY_UID || '',
                clientId: process.env.MEILISEARCH_CLIENT_ID || 0
            },
            db: {
                database: process.env.DB_DATABASE || 'cm_theme',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 25060,
                user: process.env.DB_USER || 'checkmate',
                password: process.env.DB_PASSWORD || 'checkmate',
                documentsTable: process.env.DB_DOCUMENTS_TABLE || 'wp_cachemate_documents',
            },
            backendUrl: process.env.BACKEND_URL || 'https://checkmate-theme.staging-test.dk',
        },
        public: {
            env: process.env.NODE_ENV || 'development',
            build: {
                number: process.env.BITBUCKET_BUILD_NUMBER || 0,
            },
            backendRewriteUrls: process.env.NUXT_PUBLIC_BACKEND_REWRITE_URLS || 'https://checkmate-theme.staging-test.dk',
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
            assetsUrl: process.env.NUXT_PUBLIC_SITE_URL,
            menu: {
                locations: ['menu-1', 'footer-1', 'footer-2'],
            },
            multilang: {
                enabled: process.env.NUXT_PUBLIC_MULTILANG_ENABLED || true,
            },
            flowmateEnabled: process.env.NUXT_PUBLIC_FLOWMATE_ENABLED || false,
            flowmateBackendDriver: 'wordpress',
            flowmateAvailableBlocks: process.env.NUXT_PUBLIC_FLOWMATE_AVAILABLE_BLOCKS || null,
            gtmId: process.env.NUXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX',
            gtmEnabled: process.env.NUXT_PUBLIC_GTM_ENABLED || false,
            cachemate: {
                enabled: process.env.NUXT_PUBLIC_CACHEMATE_ENABLED || false,
            },
            redis: {
                enabled: process.env.NUXT_PUBLIC_REDIS_ENABLED,
            },
            db: {
                enabled: false,
            },
            search: {
                enabled: true,
                relevanssi: false
            },
            meilisearch: {
                enabled: process.env.NUXT_PUBLIC_MEILISEARCH_ENABLED || false
            },
            flowmatePlugins: {
                'firebase': {
                    'apiKey': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_API_KEY || null,
                    'authDomain': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_AUTH_DOMAIN || null,
                    'databaseURL': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_DATABASE_URL || null,
                    'projectId': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_PROJECT_ID || null,
                    'storageBucket': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_STORAGE_BUCKET || null,
                    'messagingSenderId': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_MESSAGE_SENDER_ID || null,
                    'appId': process.env.NUXT_PUBLIC_FLOWMATE_PLUGINS_FIREBASE_APP_ID || null
                }
            }
        }
    },

    // Simple default page transition

    pageTransition: {
        name: 'my-page',
        mode: 'out-in',
        leave(el, done) {
            const {store} = this.$nuxt.context;
            store.commit('transition/showTransition', true);
            setTimeout(() => {
                done();
            }, 300);
        },
        enter(el, done) {
            const {store} = this.$nuxt.context;
            // setTimeout(() => {
            store.commit('transition/showTransition', false);
            // }, 500);
        }
    },

    /* Sets proxy headers needed for SSR */
    proxyHeaders: true,

    proxyHeadersIgnore: ['accept', 'host', 'x-forwarded-host', 'x-forwarded-port', 'x-forwarded-proto', 'cf-ray', 'cf-connecting-ip', 'content-length', 'content-md5', 'content-type'],

    modules: [
        '@nuxtjs/tailwindcss',
        '@nuxtjs/sitemap',
        '@checkmatecph/flowmate-nuxt-integration',
        '@nuxtjs/i18n',
    ],

    sitemap: {
        sources: ['/api/sitemap']
    },

    site: {
        trailingSlash: true,
    },

    components: [
        {
            path: '~/components', // will get any components nested in let's say /components/test too
            pathPrefix: false,
        },
    ],

    css: [
        // All styles except Flowmate styles.
        '@/assets/scss/style.scss',
    ],

    plugins: [
        '~/plugins/pinia.js',
        '~/plugins/global.js',
        '~/plugins/gsap.client.ts',
        '~/plugins/smartlook.client.ts',
    ],

    devServerHandlers: [],

    // serverMiddleware: [
    //     { path: '/-/healthz', handler: '~/middleware/index.js' }
    // ],

    typescript: {
        strict: true
    },

    // Tailwind options.
    tailwindcss: {
        exposeConfig: true
    },

    routeRules: {
        // Homepage pre-rendered at build time
        // '/': { prerender: true },
        '/': {swr: 5},
        '/search/': {robots: false},
        '/flowmate/**': {ssr: false},
    },

    // nitro: {
    //   plugins: [
    //       '/users/viktor/Code/flowmate-nuxt-integration/dist/index.js',
    //   ]
    // },

    // nitro: {
    //     compressPublicAssets: { gzip: true, brotli: true }
    // },

    // nitro: {
    //     compressPublicAssets: { gzip: false, brotli: false }
    //     prerender: {
    //         routes: [ '/article/100', '/article/101' ]
    //     },
    //     storage: {
    //         cache: {
    //             driver: 'redis',
    //             /* redis connector options */
    //             port: 25061, // Redis port
    //             host: 'hostname',
    //             username: "default", // needs Redis >= 6
    //             password: 'password', // Redis password
    //             db: 0, // Defaults to 0
    //             tls: {} // tls/ssl
    //         }
    //     }
    // },
    // hooks: {
    //     async 'nitro:config'( config ) {
    //         const routes = await generateBlogRoutes( config.runtimeConfig );
    //         config.prerender.routes.push( ...routes );
    //     }
    // },

    build: {
        // transpile: ['vue-intersect'],

        extend(_config, _ctx) {
            _config.node = {
                fs: "empty"
            };
        },

    },

    vite: {
        // Options
        build: {
            rollupOptions: {}
        }
    },

    compatibilityDate: '2024-09-13',

    // Add i18n configuration
    i18n: {
        baseUrl: process.env.NUXT_PUBLIC_SITE_URL,
        defaultLocale: 'da',
        locales: [
            { code: 'en', iso: 'en-US', name: 'English', dir: "ltr", file: 'en.js'},
            { code: 'da', iso: 'da-DK', name: 'Dansk', dir: "ltr", file: 'da.js'},
        ],
        langDir: 'lang',
        strategy: 'prefix_except_default',
        detectBrowserLanguage: false,
        skipSettingLocaleOnNavigate: false,
    },
})
