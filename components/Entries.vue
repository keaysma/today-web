<!-- All items with entries applied to them. Automatically fetches items and entries when selected tags are changes, or when items or entires are mutated. -->

<script setup lang="ts">
import { titleFromTags } from '@/utils/tags'
import { eqSet, getTagsFromLocalStorage, getTagsFromSearch } from '@/utils/tags';
import { fromEntries, makeItemsGroupsMapping, makeValuesMappingBase, makeEntriesMapping, makeValuesMapping, checkboxTypes, headerTypes, textTypes, iTypeToSize } from '@/utils/mappings'
import type { EntriesResponse, Entry, Group, Item, Tags } from '~~/types';

const { public: { backendAddress } } = useRuntimeConfig()
const { pending, data, refresh } = useAsyncData<EntriesResponse>('entries', () => $fetch(`${backendAddress}/api/entries?tags=${selectedTags.value.join(',')}`, { credentials: 'include' }))

const user = useUser()
const userGroups = computed(() => user.value?.groups.reduce<Record<number, Group>>((acc, group) => ({ ...acc, [group.id]: group }), {}) ?? {})
const selectedTags = useSelectedTags()
watch(selectedTags, () => refresh())

const editingItem = ref<Item | null>(null)

let mappings = ref<{
    items: Record<string, Item>,
    itemsGroups: Record<string, Record<string, Item>>,
    entries: Record<string, Entry>,
    entriesValues: Record<string, string | boolean | undefined>
}>({
    items: {},
    itemsGroups: {},
    entries: {},
    entriesValues: {}
})
watch(data, (newData) => {
    if (!newData) return;

    const itemsMapping = fromEntries('key', newData.items)
    const itemsGroupsMapping = makeItemsGroupsMapping(newData.items)
    const entriesMapping = makeEntriesMapping(newData.entries, selectedTags.value)

    const valuesMappingBase = makeValuesMappingBase(itemsMapping)
    const valuesMapping = makeValuesMapping(entriesMapping, itemsMapping)
    console.log({ valuesMappingBase, valuesMapping })

    mappings.value = {
        items: itemsMapping,
        itemsGroups: itemsGroupsMapping,
        entries: entriesMapping,
        entriesValues: {
            ...valuesMappingBase,
            ...valuesMapping
        }
    }
})

const deleteItem = async (key: string, group: number) => {
    await $fetch(`${backendAddress}/api/items`, {
        method: 'DELETE',
        credentials: 'include',
        body: {
            key, group
        }
    })
    refresh()
}

const updateEntry = async (key: string, newValue: string) => {
    if (!data.value) {
        console.warn(`updateEntry: data.value is null`)
        return;
    }
    const item = mappings.value.items[key]
    const entry = mappings.value.entries[key]

    const group = item.group
    const tags = [... new Set([
        ...item.tags,
        ...selectedTags.value.filter(tagIsMagic)
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

    const value = checkboxTypes.includes(item.itype)
        ? (
            newValue === 'false' && exactEntry
                ? 'strike'
                : exactEntry
                    ? 'false'
                    : 'true'
        )
        : newValue

    console.debug({ item, group, entry, tags, value, exactEntry })

    if (checkboxTypes.includes(item.itype) && value === 'false' && exactEntry !== undefined) {
        console.debug('delete', { key, tags })
        return deleteEntry(key, group, tags)
    }

    console.debug('update')
    await $fetch(`${backendAddress}/api/entries`, {
        method: 'POST',
        credentials: 'include',
        body: {
            key, group, value, tags
        }
    })
    refresh()
}

const deleteEntry = async (key: string, group: number, tags: Tags) => {
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

let debounceTimeout: NodeJS.Timeout | undefined = undefined;
const captureTextInput = (key: string, newValue: any) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        updateEntry(key, newValue)
    }, 500);
}

if (process.client) {
    const tagsFromSearch = getTagsFromSearch()
    selectedTags.value = tagsFromSearch

    if (selectedTags.value.length === 0) {
        selectedTags.value = getTagsFromLocalStorage()
        if (selectedTags.value.some(tagIsDate))
            addDateTags(new Date())
    }
}
</script>

<template>
    <el-space v-loading="pending || !data" direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
        <el-space v-if="data" direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
            <el-space v-for="[groupName, ItemsByKey] in Object.entries(mappings.itemsGroups)" :key="groupName"
                direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
                <el-space spacer="|">
                    <h3 v-for="title in titleFromTags(groupName)" :key="title" class="section-title">{{
                        title.replaceAll('"', '').trim() }}</h3>
                </el-space>
                <el-space v-for="item in Object.values(ItemsByKey)" :key="item.key" :class="item.itype">
                    <el-checkbox v-if="checkboxTypes.includes(item.itype)" plain
                        :class="(mappings.entriesValues[item.key] === undefined) ? 'strike' : ''"
                        :indeterminate="mappings.entriesValues[item.key] === undefined"
                        v-model="mappings.entriesValues[item.key]"
                        @change="updateEntry(item.key, (mappings.entriesValues[item.key]?.toString()) ?? '')">
                        <el-link :href="item.config.link" target="_blank" v-if="item.config.link" type="primary">{{
                            item.key }}</el-link>
                        <span v-else>{{ item.key }}</span>
                    </el-checkbox>
                    <div v-if="checkboxTypes.includes(item.itype)"
                        style="position: relative; height: 1px; width: 50px; background: #ccc;">
                        <p v-if="checkboxTypes.includes(item.itype) && mappings.entries[item.key] !== undefined"
                            class="checkbox-middot">
                            &middot;
                        </p>
                    </div>

                    <el-input v-else-if="headerTypes.includes(item.itype)" :size="iTypeToSize[item.itype]"
                        :placeholder="item.itype" style="width: 100%;" v-model="mappings.entriesValues[item.key] as string"
                        @input="captureTextInput(item.key, mappings.entriesValues[item.key])" />

                    <el-input v-else-if="textTypes.includes(item.itype)" type="textarea" placeholder="write"
                        v-model="mappings.entriesValues[item.key] as string"
                        @input="captureTextInput(item.key, mappings.entriesValues[item.key])" />

                    <p v-else>???</p>

                    <!--<el-text type="info" class="group-name">{{ userGroups?.[item.group].name ?? "unknwon" }}</el-text>-->

                    <el-dropdown trigger="click" size="large">
                        <el-button small plain circle :icon="ElIconMoreFilled" />
                        <template #dropdown>
                            <el-dropdown-item v-if="user" :disabled="true">
                                group: {{ user.groups.find(group => group.id === item.group)?.name || "unknown" }}
                            </el-dropdown-item>
                            <el-dropdown-item @click="editingItem = item">
                                edit
                            </el-dropdown-item>
                            <el-dropdown-item v-if="mappings.entries[item.key] !== undefined"
                                @click="deleteEntry(item.key, item.group, mappings.entries[item.key].tags)">
                                clear
                            </el-dropdown-item>
                            <el-dropdown-item :divided="true"
                                @click="deleteItem(item.key, item.group)">delete</el-dropdown-item>
                        </template>
                    </el-dropdown>
                </el-space>
            </el-space>
        </el-space>
    </el-space>

    <client-only>
        <el-dialog :model-value="editingItem !== null" @update:model-value="editingItem = null" title="Edit Item">
            <item-edit-form v-if="editingItem" :item="editingItem" :user-groups="userGroups" @submitted="refresh" @close="editingItem = null" />
        </el-dialog>
    </client-only>
</template>

<style>
.section-title {
    font-size: 0.75rem;
    color: #aaa;

    margin: 0;
    padding: 0;
}

.group-name {
    margin-top: -3px;
}

.strike>.el-checkbox__label {
    text-decoration: line-through;
}

.checkbox-middot {
    position: absolute;
    top: -50px;
    right: 10px;
    font-size: 2rem;
    color: #aaa;
}

@media screen and (max-width: 767px) {
    .checkbox-middot {
        top: -45px;
    }
}
</style>