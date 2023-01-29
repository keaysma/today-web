// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {

        dummyConfigPrivate: 'server-config',

        public: {
            dummyConfigPublic: 'public-config',
            backendAddress: 'http://127.0.0.1:8080'
        }
    },
    
    css: [
        '@/assets/css/global.css'
    ]
})
