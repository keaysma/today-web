<!-- A multi-select component for selecting tags. Auto-fetches suggestions when text is entered. -->
<script setup>
import { tagIsDate, getTagColor, displayTag } from '@/utils/tags'

const { public: { backendAddress } } = useRuntimeConfig()
const { pending, data, error } = await useFetch('me', () => $fetch(`${backendAddress}/api/me`, { credentials: 'include', headers: useRequestHeaders(['cookie']) }))
const refresh = () => refreshNuxtData('me')

const getData = () => data
const getTagsFromLocalStorage = () => JSON.parse(localStorage.getItem('lastSelectedTags')) || []

const inputVisible = ref(false)
const inputValue = ref('')
const AddTagRef = ref()
const InputRef = ref()
const showInput = () => {
    inputVisible.value = true
    nextTick(() => InputRef?.value?.focus())
}
const handleAddTag = () => {
    if(inputValue.value)
        selectedTags.value = [... selectedTags.value, inputValue.value].map(tag => tag.toLowerCase())
    inputVisible.value = false
    inputValue.value = ''
    localStorage.setItem('lastSelectedTags', JSON.stringify(selectedTags.value))
    nextTick(() =>  AddTagRef?.value?.ref?.focus())
}
const addTodayTags = () => {
    const today = new Date()

    const day = today.getDate().toString()
    const year = today.getFullYear().toString()
    const month = today.toLocaleString('default', { month: 'long' })

    selectedTags.value = [... selectedTags.value, `month:${month}`, `day:${day}`, `year:${year}`].map(tag => tag.toLowerCase())
    localStorage.setItem('lastSelectedTags', JSON.stringify(selectedTags.value))
}
const handleRemoveTag = (removeTag) => {
    selectedTags.value = selectedTags.value.filter(tag => tag !== removeTag)
    localStorage.setItem('lastSelectedTags', JSON.stringify(selectedTags.value))
}
const clearAllTags = () => {
    selectedTags.value = []
}

const selectedTags = useSelectedTags()
const additionalTagOptions = useState('additionalTags', () => [])

const querySearch = (queryString, cb) => {
    const { items, entries } = getData().value || {
        items: [],
        entries: []
    }

    if(!queryString.length){
        console.log({ items })
        cb([... items].filter(value => !tagIsDate(value)).map(value => ({ value })))
        return
    }

    console.log({ queryString })

    const allTags = new Set([... items, ... entries, ... additionalTagOptions.value, queryString ])
    const results = [... allTags].filter(tag => tag.indexOf(queryString) > -1)
    cb(results.map(value => ({ value })))
}


if(process.client){
    //refresh()
    selectedTags.value = getTagsFromLocalStorage()
    if(error.value){
        console.log(`error`, error.value)
        window.location.pathname = '/login'
    }
}
</script>

<template>
    <div
        class="card-header" 
        style="position: relative;"
        v-loading="pending || !data"
    >
        <el-space wrap style="margin-right: 75px;">
            <el-button v-if="selectedTags.length" plain type="info" class="button-new-tag ml-1" size="small" @click="clearAllTags">
                clear
            </el-button>
            <el-tag
                v-for="tag in selectedTags"
                :key="tag"
                class="mx-1"
                closable
                :type="getTagColor(tag)"
                :disable-transitions="true"
                @close="handleRemoveTag(tag)"
            >
                {{ displayTag(tag) }}
            </el-tag>
            <el-autocomplete
                v-if="inputVisible"
                clearable
                size="small"
                ref="InputRef"
                v-model="inputValue"
                :fetch-suggestions="querySearch"
                class="inline-input w-50"
                placeholder="Please Input"
                @select="handleAddTag"
            />
            <el-button v-else ref="AddTagRef" plain type="info" class="button-new-tag ml-1" size="small" @click="showInput">
                + list
            </el-button>
        </el-space>
        <el-button size="small" color="#000" style="position: absolute; top: 0; right: 0;" @click="addTodayTags">Today.</el-button>
    </div>
</template>

<style scoped>
</style>