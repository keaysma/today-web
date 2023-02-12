<script setup>
useHead({
    title: 'Today.',
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.ico' }],
    meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
    ],
})

const { public: { backendAddress } } = useRuntimeConfig()
const user = useUser()

if(process.client){
    try{
        const res = await $fetch(`${backendAddress}/api/me`, 
            { credentials: 'include' }
        )
        if(res.items === undefined){
            window.location.pathname = '/login'
        }
        user.value = res
    } catch {
        window.location.pathname = '/login'
    }
}
</script>

<template>
    <div class="app-card">
        <el-card class="box-card" style="margin-bottom: 10px;">
            <template #header>
                <TagSelect />
            </template>
            <Entries />
            <el-divider />
            <ItemCreateForm />
        </el-card>
    </div>
</template>

<style scoped>
.app-card {
    width: 100%;
    height: 100%;
}

@media screen and (min-width: 768px) {
    .app-card {
        width: 500px;
        height: unset;
        margin: 200px auto 0 auto;
    }
}
</style>