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
    if (newTags.length < 1) {
        disableNewItemButton.value = true
        visible.value = false
    } else {
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
const toggleTag = (tag) => {
    tagsModel.value.includes(tag)
        ? tagsModel.value = tagsModel.value.filter(t => t !== tag)
        : tagsModel.value = [...tagsModel.value, tag]
}

const typesWithCustomKeys = ["checkbox", "checkbox-link"]
const typesWithLinkConfig = ["checkbox"] // ["checkbox-link"]
const availableTypes = ["checkbox"] //["checkbox", "checkbox-link", "markdown", "h1", "h2", "h3", "p", "image", "caption"]
const typeModel = ref('checkbox')
const selectType = (newValue) => typeModel.value = newValue

const submit = async () => {
    if (!typeModel.value || !tagsModel.value.length) return

    const itype = typeModel.value
    const key = typesWithCustomKeys.includes(itype) ? inputModel.value : `${(new Date()).getTime()}`
    if (!itype || !key) return

    const config = {}
    if (typesWithLinkConfig.includes(itype)) {
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
        <el-divider>New Item</el-divider>
        <el-space direction="vertical" alignment="flex-start">
            <el-input class="group-select">
                <template #prepend>
                    <label>Group</label>
                </template>
                <template #append>
                    <el-dropdown split-button trigger="click" @command="selectGroup">
                        {{ groupModel.name }}
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="group in user.groups" :key="group.id" :command="group">
                                    {{ group.name }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-input>
            <el-input v-if="typesWithCustomKeys.includes(typeModel)" v-model="inputModel" placeholder="broccoli">
                <template #prepend>
                    <label>Name</label>
                </template>
            </el-input>
            <el-input v-if="typesWithLinkConfig.includes(typeModel)" v-model="linkModel" placeholder="https://...">
                <template #prepend>
                    <label>Link</label>
                </template>
            </el-input>

            <!-- <el-space direction="vertical" alignment="flex-start">
                <label>Tags</label>
                <el-space wrap>
                    <el-button plain @click="resetTags">reset</el-button>
                    <el-tag v-for="tag in tagsModel" :key="tag" class="mx-1" size="large" closable :type="getTagType(tag)"
                        :color="getTagColor(tag)" :disable-transitions="true" @close="handleRemoveTag(tag)">
                        {{ displayTag(tag) }}
                    </el-tag>
                </el-space>
            </el-space> -->
            <el-space direction="horizontal" alignment="flex-start">
                <el-check-tag v-for="tag in initialTags" :key="tag" :type="getTagType(tag)" :color="getTagColor(tag)"
                    :checked="tagsModel.includes(tag)" @update:checked="toggleTag(tag)">
                    {{ displayTag(tag) }}
                </el-check-tag>
            </el-space>
            <el-space direction="horizontal" alignment="flex-start" style="margin-top: 1em;">
                <el-button type="danger" @click="visible = false" plain>Cancel</el-button>
                <el-button type="success" :disabled="tagsModel.length === 0" @click="submit()" plain>Submit</el-button>
            </el-space>
        </el-space>
    </div>
    <el-button v-else plain size="large" type="primary" style="width: 150px; margin-top: 20px;"
        :disabled="disableNewItemButton" @click="visible = true">
        + New Item
    </el-button>
</template>

<style>
label {
    font-size: .75em;
    font-weight: 200;
    color: gray;
}

.group-select>.el-input__wrapper {
    display: none;
}

.group-select>.el-input-group__append {
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    background-color: transparent;
}

.group-select>.el-input-group__append>.el-dropdown>.el-button-group>.el-button:first-child {
    border-radius: 0;
}
.group-select>.el-input-group__append>.el-dropdown>.el-button-group>.el-button:last-child {
    background-color: var(--el-fill-color-light);
}

.tag-select {
    min-width: 200px;
}

.el-select-v2__wrapper {
    padding-bottom: 2px !important;
}
</style>
