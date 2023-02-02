<!-- All items with entries applied to them. Automatically fetches items and entries when selected tags are changes, or when items or entires are mutated. -->

<script setup>
import { titleFromTags } from '@/utils/tags'
const { public: { backendAddress } } = useRuntimeConfig()

const { pending, data } = useLazyAsyncData('entries', () => $fetch(`${backendAddress}/api/entries?tags=${selectedTags.value.join(',')}`, { credentials: 'include' }))
const refresh = () => refreshNuxtData('entries')

const selectedTags = useSelectedTags()
watch(selectedTags, () => refresh())

let mappings = ref({
    items: {},
    itemsGroups: {},
    entries: {},
    entriesValues: {}
})
watch(data, (newData) => {
    const itemsMapping = newData.items.reduce(
        (acc, item) => ({
            ... acc,
            [item.key]: item
        }),
        {}
    )

    const itemsGroupsMapping = newData.items.reduce(
        (acc, item) => {
            const group = item.tags.join(', ')
            return {
                ... acc,
                [group]: {
                    ... (acc[group] || {}),
                    [item.key]: item
                }
            }
        },
        {}
    )

    const valuesMappingBase = Object.entries(itemsMapping).reduce(
        (acc, [key, { itype }]) => ({
            ... acc,
            [key]: itype === 'checkbox' ? false : ''
        }),
        {}
    )

    const entriesMapping = newData.entries.reduce(
        (acc, entry) => {
            let selectedEntry = entry
            const existingEntry = acc[entry.key]

            /*if(existingEntry)
                return {
                    ... acc,
                    [entry.key + ' (dup) ']: selectedEntry
                }

            return {
                ... acc,
                [entry.key]: selectedEntry
            }*/

            if(existingEntry){
                const dotEntry = selectedTags.value.filter(x => entry.tags.includes(x))
                const dotExistingEntry = selectedTags.value.filter(x => existingEntry.tags.includes(x))
                if(dotExistingEntry.length > dotEntry.length){
                    return {
                        ... acc,
                        [`${entry.key} (dup)`]: entry
                    }
                }else{
                    return {
                        ... acc,
                        [`${entry.key} (dup)`]: existingEntry,
                        [entry.key]: entry
                    }
                }
            }
            return {
                ... acc,
                [entry.key]: entry
            }
        },
        {}
    )
    
    const valuesMapping = Object.entries(entriesMapping).reduce(
        (acc, [k, { value, key }]) => {
            const item = itemsMapping[key]
            if(!item) return acc

            const parsedValue = item.itype === 'checkbox' ? value === 'true' : value

            return { 
                ... acc, 
                [k]: parsedValue
            }
        }, 
        {}
    )

    console.log({
        itemsMapping, itemsGroupsMapping, entriesMapping, valuesMapping, valuesMappingBase, entriesValues: {
            ... valuesMappingBase,
            ... valuesMapping
        }
    })
    
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

const update = async (key, value) => {
    await $fetch(`${backendAddress}/api/entries`, {
        method: 'POST',
        credentials: 'include', 
        body: {
            key, value, 
            tags: selectedTags.value
        }
    })
    refresh()
}

const deleteItem = async (key) => {
    await $fetch(`${backendAddress}/api/items`, {
        method: 'DELETE',
        credentials: 'include',
        body: {
            key
        }
    })
    refresh()
}

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));
const updateEntry = async (key, newValue) => {
    const item = mappings.value.items[key]
    const entry = mappings.value.entries[key]
    console.log(data.value.entries)
    const exactEntry = data.value.entries.find(
        (e) => {
            return e.key === key && 
                eqSet(
                    new Set(e.tags.map(tag => tag.toLowerCase())), 
                    new Set(selectedTags.value.map(tag => tag.toLowerCase()))
                )
        }
    )

    console.debug({ item, entry, newValue, exactEntry })

    if(item.itype !== 'checkbox'){
        console.debug('other')
        return update(key, newValue)
    }

    console.debug('checkbox')
    if(newValue === 'false' && exactEntry !== undefined){
        console.debug('delete', { key, tags: selectedTags.value })
        return deleteEntry(key, selectedTags.value)
    }

    console.debug('update')
    return update(key, newValue)
}

const deleteEntry = async (key, tags) => {
    console.log(key, tags)
    await $fetch(`${backendAddress}/api/entries`, {
        method: 'DELETE',
        credentials: 'include',
        body: {
            key, tags
        }
    })
    refresh()
}

let debounceTimeout
const captureTextInput = (key, newValue) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        console.log({ key, newValue })
        updateEntry(key, newValue)
    }, 500);
}

refresh()
</script>

<template>
    <el-space v-loading="pending || !data" direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
        <el-space v-if="data" direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
            <!-- ungrouped
            <el-space 
                v-for="item in Object.values(mappings.items)" 
                :key="item.key"
                class="entry"
                style="width: 100%; justify-content: space-between;"
            >
                <el-checkbox v-if="item.itype === 'checkbox'"
                    plain 
                    :label="item.key"
                    v-model="mappings.entriesValues[item.key]"
                    @change="update(item.key, (mappings.entriesValues[item.key]).toString())"
                />
                <p v-else>{{ entriesMap[item.key]?.value }}</p>

                <div style="height: 1px; width: 50px; background: #ccc;"/>

                <el-dropdown trigger="click">
                    <el-button round text bg small class="el-dropdown-link">
                        &middot;&middot;&middot;
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="deleteItem(item.key)">delete</el-dropdown-item>
                    </template>
                </el-dropdown>
            </el-space> -->
            <el-space 
                v-for="item in Object.entries(mappings.itemsGroups)" 
                :key="item[0]"
                direction="vertical"
                alignment="flex-start" style="width: 100%;" :fill="true"
            >
                <el-space spacer="|">
                    <h3 v-for="title in titleFromTags(item[0])" :key="title">{{ title.replaceAll('"', '').trim() }}</h3>
                </el-space>
                <el-space 
                    v-for="item in Object.values(item[1])" 
                    :key="item.key"
                    :class="item.itype"
                >
                    <el-checkbox
                        v-if="item.itype === 'checkbox'"
                        plain 
                        :label="item.key"
                        v-model="mappings.entriesValues[item.key]"
                        @change="updateEntry(item.key, (mappings.entriesValues[item.key]).toString())"
                    />
                    <div v-if="item.itype === 'checkbox'" style="position: relative; height: 1px; width: 50px; background: #ccc;">
                        <p
                            v-if="item.itype === 'checkbox' && mappings.entries[item.key] !== undefined"
                            style="position: absolute; top: -50px; right: 10px; font-size: 2rem; color: #aaa;"
                        >
                            &middot;
                        </p>
                    </div>

                    <el-input v-else-if="['h1', 'h2', 'h3'].includes(item.itype)" 
                        :size="{ 'h1': 'large', 'h2': 'medium', 'h3': 'small' }[item.itype]"
                        :placeholder="item.itype" style="width: 100%;"
                        v-model="mappings.entriesValues[item.key]"
                        @input="captureTextInput(item.key, mappings.entriesValues[item.key])"
                    />
                    
                    <el-input v-else-if="['p'].includes(item.itype)" 
                        type="textarea" 
                        placeholder="write"
                        v-model="mappings.entriesValues[item.key]"
                        @input="captureTextInput(item.key, mappings.entriesValues[item.key])"
                    />
                    
                    <p v-else>???</p>
                    
                    <el-dropdown trigger="click">
                            <el-button round text bg small class="el-dropdown-link">
                                &middot;&middot;&middot;
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-item 
                                    v-if="mappings.entries[item.key] !== undefined"
                                    @click="deleteEntry(item.key, mappings.entries[item.key].tags)"
                                >
                                    clear
                                </el-dropdown-item>
                                <el-dropdown-item @click="deleteItem(item.key)">delete</el-dropdown-item>
                            </template>
                        </el-dropdown>
                </el-space>
            </el-space>
        </el-space>
    </el-space>
    <!-- <button @click="refresh">get</button> -->
</template>

<style scoped>
h3 {
    font-size: 0.75rem;
    color: #aaa;

    margin: 0;
    padding: 0;
}
</style>