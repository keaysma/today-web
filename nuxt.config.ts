// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {

        dummyConfigPrivate: 'server-config',

        public: {
            dummyConfigPublic: 'public-config',
            backendAddress: 'http://localhost:8080'
        }
    }
})
