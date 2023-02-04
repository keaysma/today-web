<script setup>
import { titleFromTags } from '@/utils/tags'
import { makeItemsMapping, makeItemsGroupsMapping, makeValuesMappingBase, makeEntriesMapping, makeValuesMapping } from '@/utils/mappings'
const { public: { backendAddress } } = useRuntimeConfig()
const route = useRoute();
let selectedTags = ref(['blog', ... route.params.tags])
//const { pending, data } = useFetch(`${backendAddress}/api/public/entries?tags=${selectedTags.value.join(',')}`)
const { pending, data } = useLazyAsyncData('entries', () => $fetch(`${backendAddress}/api/entries?tags=${selectedTags.value.join(',')}`, { credentials: 'include' }))
refreshNuxtData('entries')

let mappings = ref({
    items: {},
    itemsGroups: {},
    entries: {},
    entriesValues: {}
}) 
watch(data, (newData) => {
    console.log({ newData })
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

</script>

<template>
    <el-space direction="vertical" alignment="start" style="margin: auto; width: 400px;">
        <el-space>
            <el-tag
                v-for="tag in selectedTags"
                :key="tag"
                class="mx-1"
                :type="getTagType(tag)"
                :color="getTagColor(tag)"
                :disable-transitions="true"
                @close="handleRemoveTag(tag)"
            >
                {{ displayTag(tag) }}
            </el-tag>
        </el-space>
        <div v-for="item in mappings.items" :key="item.key">
            <h1 v-if="item.itype=='h1'">{{ mappings.entriesValues[item.key] }}</h1>
            <h2 v-if="item.itype=='h2'">{{ mappings.entriesValues[item.key] }}</h2>
            <h3 v-if="item.itype=='h3'">{{ mappings.entriesValues[item.key] }}</h3>
            <p  v-if="item.itype=='p'">{{ mappings.entriesValues[item.key] }}</p>
            <img 
                v-if="item.itype=='image'" 
                :src="mappings.entriesValues[item.key]"
                style="width: 100%;"
            />
        </div>
    </el-space>
</template>

<style scoped>
    h1, p {
        margin: 0;
        padding: 0;
    }
</style>