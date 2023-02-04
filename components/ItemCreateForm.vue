<!-- A form for specifying settings for items. -->
<script setup>
import { getTagColor, getTagType, displayTag } from '@/utils/tags'
const { public: { backendAddress } } = useRuntimeConfig()
const visible = useCreateItemFormIsOpen()
const initialTags = useSelectedTags()

const inputModel = ref('')
const tagsModel = ref([])
watch(initialTags, (newTags) => {
    tagsModel.value = newTags
    if(newTags.length < 1)
        visible.value = false
})
const resetTags = () => tagsModel.value = initialTags.value
const handleRemoveTag = (removeTag) => {
    tagsModel.value = tagsModel.value.filter(tag => tag !== removeTag)
}

const typesWithCustomKeys = ["checkbox"]
const availableTypes = ["checkbox", "h1", "h2", "h3", "p", "image", "caption"]
const typeModel = ref('checkbox')
const selectType = (newValue) => typeModel.value = newValue

const submit = async () => {
    if(!typeModel.value || !tagsModel.value.length) return

    const itype = typeModel.value
    const key = typesWithCustomKeys.includes(itype) ? inputModel.value : `${(new Date()).getTime()}`
    if(!itype || !key) return

    await $fetch(`${backendAddress}/api/items`, {
        method: 'POST',
        credentials: 'include',
        body: {
            key,
            itype,
            tags: tagsModel.value
        }
    })
    inputModel.value = ''
    refreshNuxtData('entries')
}

</script>

<template>
    <div v-if="visible">
        <el-space direction="vertical" alignment="flex-start">
            <el-dropdown split-button type="plain" trigger="click" @command="selectType">
                {{ typeModel }}
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item 
                            v-for="itemType in availableTypes" 
                            :key="itemType" 
                            :command="itemType"
                        >
                            {{ itemType }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-input v-if="typesWithCustomKeys.includes(typeModel)" v-model="inputModel" placeholder="key" />
            <el-space wrap>
                <el-button plain size="small" @click="resetTags">reset</el-button>
                <el-tag
                    v-for="tag in tagsModel"
                    :key="tag"
                    class="mx-1"
                    closable
                    :type="getTagType(tag)"
                    :color="getTagColor(tag)"
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