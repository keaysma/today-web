<script setup>
import { titleFromTags } from '@/utils/tags'
import { makeItemsMapping, makeItemsGroupsMapping, makeValuesMappingBase, makeEntriesMapping, makeValuesMapping } from '@/utils/mappings'
const { public: { backendAddress } } = useRuntimeConfig()
const route = useRoute();
//const { pending, data } = useFetch(`${backendAddress}/api/public/entries?tags=${selectedTags.value.join(',')}`)
const { pending, data } = useLazyAsyncData('publication', () => $fetch(`${backendAddress}/api/publications?id=${route.params.publication}`, { credentials: 'include' }))
refreshNuxtData('publication')

let mappings = ref({
    tags: [],
    title: "",
    group: "",
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
        tags: newData.tags,
        title: newData.title,
        group: newData.group,
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
    <div class="container">
        <el-space>
            <el-tag
                v-for="tag in mappings.tags"
                :key="tag"
                style="padding: 0 5px;"
                :type="getTagType(tag)"
                :color="getTagColor(tag)"
                :disable-transitions="true"
                @close="handleRemoveTag(tag)"
            >
                {{ displayTag(tag) }}
            </el-tag>
        </el-space>
        <h1 class="header">{{ mappings.title }}</h1>
        <span class="subheader">by {{ mappings.group }}</span>
        <el-divider/>
        <div v-for="item in mappings.items" :key="item.key" :class="item.itype" style="margin: 10px 0;">
            <h1 v-if="item.itype=='h1'">{{ mappings.entriesValues[item.key] }}</h1>
            <h2 v-if="item.itype=='h2'">{{ mappings.entriesValues[item.key] }}</h2>
            <h3 v-if="item.itype=='h3'">{{ mappings.entriesValues[item.key] }}</h3>
            <p  v-if="item.itype=='p'">{{ mappings.entriesValues[item.key] }}</p>
            <p  v-if="item.itype=='caption'">{{ mappings.entriesValues[item.key] }}</p>
            <img 
                v-if="item.itype=='image'" 
                :src="mappings.entriesValues[item.key]"
                style="width: 100%;"
            />
        </div>
    </div>
</template>

<style scoped>
    h1, h2, h3, p, sub {
        margin: 0;
        padding: 0;
    }

    .caption {
        margin: 0 auto;
    }
    .caption>p {
        text-align: center;
        color: #999;
    }

    .container {
        max-width: 400px;
        width: 95%;
        margin: 10px;

        display: flex;
        flex-direction: column;
    }

    .header {
        margin-top: 4px;
        font-size: 3rem;
    }

    .subheader {
        font-size: 1rem;
        color: #999;
    }

    @media screen and (min-width: 768px) {
        .container {
            margin: auto;
            width: 400px;
        }
    }

</style>