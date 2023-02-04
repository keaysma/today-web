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
    ],
    css: [
        '@/assets/css/global.css'
    ]
})
