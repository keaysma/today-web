const devConfig = {
    dummyConfigPrivate: 'server-config',

    public: {
        dummyConfigPublic: 'public-config',
        backendAddress: 'http://today-api.keays.test',
    }
}

const prodConfig = {
    public: {
        backendAddress: 'https://today-api.keays.io'
    }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: process.env.NODE_ENV !== 'production' ? devConfig : prodConfig,
    modules: [
        '@kevinmarrec/nuxt-pwa',
        '@element-plus/nuxt',
    ],
    css: [
        '@/assets/css/global.css'
    ],
    typescript: {
        strict: true,
        shim: false,
    },
    app: {
        head: {
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
            ],
            link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
        }
    },

    // https://github.com/kevinmarrec/nuxt-pwa-module/blob/main/src/module.ts
    pwa: {
        manifest: {
            name: 'Today.',
            description: 'The super-duper todo app for everyday, including today!',
            background_color: "#FFF",
            theme_color: "#FFF",
        },
        meta: {
            title: 'Today.',
            name: 'Today.',
            author: 'Michael-Andrew Keays',
            description: 'The super-duper todo app for everyday, including today!',
            
            mobileApp: true,
            // Generate splash screens for iOS
            mobileAppIOS: true,
            appleStatusBarStyle: 'default',
            theme_color: '#FFF',
        },
    },

    // https://github.com/element-plus/element-plus-nuxt-starter/blob/main/nuxt.config.ts
    elementPlus: {
        icon: 'ElIcon',
    },
})
