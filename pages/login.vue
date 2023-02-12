<script setup>
useSeoMeta({
    head: 'Today. - login'
})

const router = useRouter()
const { public: { backendAddress } } = useRuntimeConfig()
const { data } = await useFetch(`${backendAddress}/api/me`, { headers: useRequestHeaders(), credentials: 'include' })

if(data?.value?.items?.length !== undefined){
    router.push({ path: '/' })
}

const username = ref('')
const password = ref('')
const displayError = ref('')

const login = async () => {
    try{
        await $fetch(`${backendAddress}/api/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: {
                username: username.value,
                password: password.value,
            }
        })
        window.location.pathname = '/'
    } catch {
        console.error("failed to login")
        displayError.value = "failed to login"
    }

}
</script>

<template>
    <div style="width: 500px; margin: 200px auto 0 auto;">
        <el-card class="box-card" style="margin-bottom: 10px;">
            <template #header>
                <el-space style="width: 100%; flex-direction: row-reverse;">
                    <el-button
                        color="#000"
                        size="large"
                    >
                        Today.
                    </el-button>
                </el-space>
            </template>
            <el-space direction="vertical" alignment="start">
                <el-input v-model="username" placeholder="username"/>
                <el-input v-model="password" placeholder="password" type="password"/>
                <el-button
                    plain
                    @click="login"
                >
                    login.
                </el-button>
                <p style="color: red;">{{ displayError }}</p>
            </el-space>
        </el-card>
    </div>
</template>