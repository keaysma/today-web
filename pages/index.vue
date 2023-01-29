<template>
    <div style="width: 500px; margin: 200px auto 0 auto;">
        <el-card class="box-card" style="margin-bottom: 10px;">
            <template #header>
                <TagSelect/>
            </template>
            <Entries/>
        </el-card>
        <ItemCreateForm/>
    </div>
</template>