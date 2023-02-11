<!-- All items with entries applied to them. Automatically fetches items and entries when selected tags are changes, or when items or entires are mutated. -->

<script setup>
import { titleFromTags } from '@/utils/tags'
import { eqSet, getTagsFromLocalStorage, getTagsFromSearch } from '@/utils/tags';
import { makeItemsMapping, makeItemsGroupsMapping, makeValuesMappingBase, makeEntriesMapping, makeValuesMapping, checkboxTypes } from '@/utils/mappings'

const { public: { backendAddress } } = useRuntimeConfig()
const { pending, data, refresh } = useAsyncData('entries', () => $fetch(`${backendAddress}/api/entries?tags=${selectedTags.value.join(',')}`, { credentials: 'include' }))

const user = useUser()
const selectedTags = useSelectedTags()
watch(selectedTags, refresh)

let mappings = ref({
    items: {},
    itemsGroups: {},
    entries: {},
    entriesValues: {}
})
watch(data, (newData) => {
    const itemsMapping = makeItemsMapping(newData.items)
    const itemsGroupsMapping = makeItemsGroupsMapping(newData.items)
    const valuesMappingBase = makeValuesMappingBase(itemsMapping)
    const entriesMapping = makeEntriesMapping(newData.entries)
    const valuesMapping = makeValuesMapping(entriesMapping, itemsMapping)
    
    mappings.value = {
        items: itemsMapping,
        itemsGroups: itemsGroupsMapping,
        entries: entriesMapping,
        entriesValues: {
            ... valuesMappingBase,
            ... valuesMapping
        }
    }
})

const update = async (key, group, value, tags) => {
    await $fetch(`${backendAddress}/api/entries`, {
        method: 'POST',
        credentials: 'include', 
        body: {
            key, group, value, tags
        }
    })
    refresh()
}

const deleteItem = async (key, group) => {
    await $fetch(`${backendAddress}/api/items`, {
        method: 'DELETE',
        credentials: 'include',
        body: {
            key, group
        }
    })
    refresh()
}

const updateEntry = async (key, newValue) => {
    const item = mappings.value.items[key]
    const entry = mappings.value.entries[key]

    const group = item.group
    const tags = [ ... new Set([
        ... item.tags,
        ... selectedTags.value.filter(tagIsMagic)
    ])]


    const exactEntry = data.value.entries.find(
        (e) => {
            return e.key === key && 
                eqSet(
                    new Set(e.tags.map(tag => tag.toLowerCase())), 
                    new Set(tags.map(tag => tag.toLowerCase()))
                )
        }
    )

    const newValueCalc = checkboxTypes.includes(item.itype)
        ? (
            newValue === 'false' && exactEntry 
            ? 'strike'
            : exactEntry
                ? 'false'
                : 'true' 
        )
        : newValue

    console.debug({ item, group, entry, tags, newValueCalc, exactEntry })

    if(checkboxTypes.includes(item.itype) && newValueCalc === 'false' && exactEntry !== undefined){
        console.debug('delete', { key, tags })
        return deleteEntry(key, group, tags)
    }

    console.debug('update')
    return update(key, group, newValueCalc, tags)
}

const deleteEntry = async (key, group, tags) => {
    console.log(key, tags)
    await $fetch(`${backendAddress}/api/entries`, {
        method: 'DELETE',
        credentials: 'include',
        body: {
            key, group, tags
        }
    })
    refresh()
}

let debounceTimeout
const captureTextInput = (key, newValue) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        updateEntry(key, newValue)
    }, 500);
}

if(process.client){
    const tagsFromSearch = getTagsFromSearch()
    selectedTags.value = tagsFromSearch

    if(selectedTags.value.length === 0){
        selectedTags.value = getTagsFromLocalStorage()
        if(selectedTags.value.some(tagIsDate))
            addDateTags(new Date())
    }
}
</script>

<template>
    <el-space v-loading="pending || !data" direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
        <el-space v-if="data" direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
            <el-space 
                v-for="item in Object.entries(mappings.itemsGroups)" 
                :key="item[0]"
                direction="vertical"
                alignment="flex-start" style="width: 100%;" :fill="true"
            >
                <el-space spacer="|">
                    <h3 v-for="title in titleFromTags(item[0])" :key="title" class="section-title">{{ title.replaceAll('"', '').trim() }}</h3>
                </el-space>
                <el-space 
                    v-for="item in Object.values(item[1])" 
                    :key="item.key"
                    :class="item.itype"
                >
                    <el-checkbox
                        v-if="checkboxTypes.includes(item.itype)"
                        plain 
                        :class="(mappings.entriesValues[item.key] === undefined) ? 'strike' : ''"
                        :indeterminate="mappings.entriesValues[item.key] === undefined"
                        v-model="mappings.entriesValues[item.key]"
                        @change="updateEntry(item.key, (mappings.entriesValues[item.key].toString()))"
                    >
                        <el-link :href="item.config.link" target="_blank" v-if="item.config.link" type="primary">{{ item.key }}</el-link>
                        <span v-else>{{ item.key }}</span>
                    </el-checkbox>
                    <div v-if="checkboxTypes.includes(item.itype)" style="position: relative; height: 1px; width: 50px; background: #ccc;">
                        <p
                            v-if="checkboxTypes.includes(item.itype) && mappings.entries[item.key] !== undefined"
                            class="checkbox-middot"
                        >
                            &middot;
                        </p>
                    </div>

                    <el-input v-else-if="['h1', 'h2', 'h3', 'image'].includes(item.itype)" 
                        :size="{ 'h1': 'large', 'h2': 'medium', 'h3': 'small' }[item.itype]"
                        :placeholder="item.itype" style="width: 100%;"
                        v-model="mappings.entriesValues[item.key]"
                        @input="captureTextInput(item.key, mappings.entriesValues[item.key])"
                    />
                    
                    <el-input v-else-if="['p', 'caption', 'markdown'].includes(item.itype)" 
                        type="textarea" 
                        placeholder="write"
                        v-model="mappings.entriesValues[item.key]"
                        @input="captureTextInput(item.key, mappings.entriesValues[item.key])"
                    />
                    
                    <p v-else>???</p>
                    
                    <el-dropdown trigger="click" size="large">
                        <el-button round text bg small class="el-dropdown-link">
                            &middot;&middot;&middot;
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-item 
                                v-if="mappings.entries[item.key] !== undefined"
                                @click="deleteEntry(item.key, item.group, mappings.entries[item.key].tags)"
                            >
                                clear
                            </el-dropdown-item>
                            <el-dropdown-item :disabled="true">group: {{ user.groups.find(group => group.id === item.group)?.name || "unknown" }}</el-dropdown-item>
                            <el-dropdown-item :divided="true" @click="deleteItem(item.key, item.group)">delete</el-dropdown-item>
                        </template>
                    </el-dropdown>
                </el-space>
            </el-space>
        </el-space>
    </el-space>
    <!-- <button @click="refresh">get</button> -->
</template>

<style>
.section-title {
    font-size: 0.75rem;
    color: #aaa;

    margin: 0;
    padding: 0;
}

.strike>.el-checkbox__label {
    text-decoration: line-through;
}

.checkbox-middot{
    position: absolute; 
    top: -50px; 
    right: 10px; 
    font-size: 2rem; 
    color: #aaa;
}

@media screen and (max-width: 767px) {
    .checkbox-middot{
        top: -45px;
    }
}

</style>