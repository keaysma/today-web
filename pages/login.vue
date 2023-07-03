<script setup lang="ts">
useHead({
    title: 'Today. - Login'
})

const { public: { backendAddress } } = useRuntimeConfig()

const username = ref('')
const password = ref('')
const displayError = ref('')

const login = async () => {
    try {
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

if (process.client) {
    try {
        const res: { items?: unknown } = await $fetch(`${backendAddress}/api/me`,
            { credentials: 'include' }
        )
        if (res.items !== undefined) {
            window.location.pathname = '/'
        }
    } catch { }
}
</script>

<template>
    <div style="width: 500px; margin: 100px auto 0 auto;">
        <el-card class="box-card" style="margin-bottom: 10px;">
            <template #header>
                <el-button class="logo" color="#000" size="large">
                    Today.
                </el-button>
            </template>
            <el-space direction="vertical" alignment="start">
                <el-input v-model="username" placeholder="username" />
                <el-input v-model="password" placeholder="password" type="password" />
                <el-button plain @click="login">
                    login.
                </el-button>
                <p style="color: red;">{{ displayError }}</p>
            </el-space>
        </el-card>
    </div>
</template>

<style>
.el-input__wrapper {
    padding: 0;
}

.el-input__wrapper > input {
    padding: 1em;
    border-radius: 4px;
}

.logo {
    pointer-events: none;
}

</style>
