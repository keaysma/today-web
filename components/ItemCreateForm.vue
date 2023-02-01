<!-- A form for specifying settings for items. -->
<script setup>
import { getTagColor, displayTag } from '@/utils/tags'
const { public: { backendAddress } } = useRuntimeConfig()
const visible = useCreateItemFormIsOpen()
const initialTags = useSelectedTags()

const inputModel = ref('')
const tagsModel = ref([])
watch(initialTags, (newTags) => {
    tagsModel.value = newTags
})
const resetTags = () => tagsModel.value = initialTags.value
const handleRemoveTag = (removeTag) => {
    tagsModel.value = tagsModel.value.filter(tag => tag !== removeTag)
}

const submit = async () => {
    if(!inputModel.value || !tagsModel.value.length) return
    
    await $fetch(`${backendAddress}/api/items`, {
        method: 'POST',
        credentials: 'include',
        body: {
            key: inputModel.value,
            itype: 'checkbox',
            tags: tagsModel.value
        }
    })
    inputModel.value = ''
    refreshNuxtData('entries')
}

</script>

<template>
    <div v-if="visible">
        <el-space direction="vertical" alignment="flex-start" style="margin-top: 20px;">
            <el-input v-model="inputModel" placeholder="key" />
            <el-space wrap>
                <el-button plain size="small" @click="resetTags">reset</el-button>
                <el-tag
                    v-for="tag in tagsModel"
                    :key="tag"
                    class="mx-1"
                    closable
                    :type="getTagColor(tag)"
                    :disable-transitions="true"
                    @close="handleRemoveTag(tag)"
                >
                    {{ displayTag(tag) }}
                </el-tag>
            </el-space>

            <el-space direction="horizontal" alignment="flex-start">
                <el-button type="danger" @click="visible = false" plain>Cancel</el-button>
                <el-button type="success" @click="submit()" plain>Submit</el-button>
            </el-space>
        </el-space>
    </div>
    <el-button 
        v-else
        plain
        size="small"
        type="primary" 
        style="width: 150px; margin-top: 20px;"
        :disabled="initialTags.length === 0"
        @click="visible = true" 
    >
        + New Item
    </el-button>
</template>