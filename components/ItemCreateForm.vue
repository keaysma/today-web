<!-- A form for specifying settings for items. -->
<script setup>
import { getTagColor, getTagType, displayTag } from '@/utils/tags'
const { public: { backendAddress } } = useRuntimeConfig()

const user = useUser()
const groupModel = ref(user?.value?.groups?.[0] || {})
const selectGroup = (newValue) => groupModel.value = newValue
watch(user, (newUser) => {
    groupModel.value = unewUserer.value.groups[9]
})

const initialTags = useSelectedTags()
watch(initialTags, (newTags) => {
    tagsModel.value = newTags
    if(newTags.length < 1){
        disableNewItemButton.value = true
        visible.value = false
    }else{
        disableNewItemButton.value = false
    }
})

const disableNewItemButton = ref(false)
const visible = ref(false)
const inputModel = ref('')
const linkModel = ref('')
const tagsModel = ref(initialTags.value)

const resetTags = () => tagsModel.value = initialTags.value
const handleRemoveTag = (removeTag) => {
    tagsModel.value = tagsModel.value.filter(tag => tag !== removeTag)
}

const typesWithCustomKeys = ["checkbox", "checkbox-link"]
const typesWithLinkConfig = ["checkbox"] // ["checkbox-link"]
const availableTypes = ["checkbox"] //["checkbox", "checkbox-link", "markdown", "h1", "h2", "h3", "p", "image", "caption"]
const typeModel = ref('checkbox')
const selectType = (newValue) => typeModel.value = newValue

const submit = async () => {
    if(!typeModel.value || !tagsModel.value.length) return

    const itype = typeModel.value
    const key = typesWithCustomKeys.includes(itype) ? inputModel.value : `${(new Date()).getTime()}`
    if(!itype || !key) return
    
    const config = {}
    if(typesWithLinkConfig.includes(itype)){
        config['link'] = linkModel.value
    }

    await $fetch(`${backendAddress}/api/items`, {
        method: 'POST',
        credentials: 'include',
        body: {
            key,
            itype,
            config,
            group: groupModel.value.id,
            tags: tagsModel.value,
        }
    })
    inputModel.value = ''
    linkModel.value = ''
    refreshNuxtData('entries')
}

</script>

<template>
    <div v-if="visible && user">
        <el-space direction="vertical" alignment="flex-start">
            <el-space direction="horizontal" alignment="flex-start">
                <!-- <el-space direction="vertical" alignment="flex-start">
                    <span>Type</span>
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
                </el-space> -->
                <el-space direction="vertical" alignment="flex-start">
                    <span>Group</span>
                    <el-dropdown split-button type="plain" trigger="click" @command="selectGroup">
                        {{ groupModel.name }}
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item 
                                    v-for="group in user.groups" 
                                    :key="group.id" 
                                    :command="group"
                                >
                                    {{ group.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-space>
            </el-space>
            <el-space direction="vertical" alignment="flex-start">
                <span>Tags</span>
                <el-space wrap>
                    <el-button plain @click="resetTags">reset</el-button>
                    <el-tag
                        v-for="tag in tagsModel"
                        :key="tag"
                        class="mx-1"
                        size="large"
                        closable
                        :type="getTagType(tag)"
                        :color="getTagColor(tag)"
                        :disable-transitions="true"
                        @close="handleRemoveTag(tag)"
                    >
                        {{ displayTag(tag) }}
                    </el-tag>
                </el-space>
            </el-space>
            <el-space v-if="typesWithCustomKeys.includes(typeModel)" direction="vertical" alignment="flex-start">
                <span>Name</span>
                <el-input v-model="inputModel" placeholder="broccoli" />
            </el-space>
            <el-space v-if="typesWithLinkConfig.includes(typeModel)" direction="vertical" alignment="flex-start">
                <span>Link</span>
                <el-input v-model="linkModel" placeholder="https://..." />
            </el-space>

            <el-space direction="horizontal" alignment="flex-start">
                <el-button type="danger" @click="visible = false" plain>Cancel</el-button>
                <el-button type="success" :disabled="tagsModel.length === 0" @click="submit()" plain>Submit</el-button>
            </el-space>
        </el-space>
    </div>
    <el-button 
        v-else
        plain
        size="large"
        type="primary" 
        style="width: 150px; margin-top: 20px;"
        :disabled="disableNewItemButton"
        @click="visible = true" 
    >
        + New Item
    </el-button>
</template>