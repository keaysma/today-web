// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {

        dummyConfigPrivate: 'server-config',

        public: {
            dummyConfigPublic: 'public-config',
            backendAddress: 'http://today-api.keays.test'
        }
    },
    
    css: [
        '@/assets/css/global.css'
    ]
})
