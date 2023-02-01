<template>
    <div class="app-card">
        <el-card class="box-card" style="margin-bottom: 10px;">
            <template #header>
                <TagSelect/>
            </template>
            <Entries/>
            <ItemCreateForm/>
        </el-card>
    </div>
</template>

<style scoped>
.app-card {
    width: 100%;
    height: 100%;
}

@media screen and (min-width: 768px) {
    .app-card{
        width: 500px; 
        height: unset;
        margin: 200px auto 0 auto;
    }
}
</style>