<!-- A multi-select component for selecting tags. Auto-fetches suggestions when text is entered. -->
<script setup>
import { tagIsDate, getTagType, getTagColor, displayTag } from '@/utils/tags'

const { public: { backendAddress } } = useRuntimeConfig()
const data = ref()

const getData = () => data
const getTagsFromLocalStorage = () => JSON.parse(localStorage.getItem('lastSelectedTags')) || []

const calendar = ref()
const selectCalendarDate = (val, e) => {
    calendar.value.selectDate(val)
}

const dropdown = ref()
const selectedDate = ref(new Date())
const selectDate = (event) => {
    //console.log({event, selectedDate: selectedDate.value})

    const skipSelect = event.target.classList.contains('no-select') || event.target.parentElement.classList.contains('no-select')
    //console.log(skipSelect)

    if(!skipSelect){
        addDateTags(selectedDate.value)
        dropdown.value.handleClose()
    }
}

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
const addDateTags = (date) => {

    const day = date.getDate().toString()
    const year = date.getFullYear().toString()
    const month = date.toLocaleString('default', { month: 'long' })

    selectedTags.value = [
        ... selectedTags.value.filter(tag => !tagIsDate(tag)), 
        ...[`month:${month}`, `day:${day}`, `year:${year}`].map(tag => tag.toLowerCase())
    ]
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
    const { items, entries } = data.value || {
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
    try{
        const res = await $fetch(`${backendAddress}/api/me`, 
            { credentials: 'include' }
        )
        data.value = res
        selectedTags.value = getTagsFromLocalStorage()
    } catch {
        window.location.pathname = '/login'
    }
}
</script>

<template>
    <div
        class="card-header" 
        style="position: relative;"
        v-loading="!data"
    >
        <el-space direction="vertical" alignment="start">
            <el-space wrap style="margin-right: 75px;">
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
                <el-button v-else ref="AddTagRef" plain type="success" class="button-new-tag ml-1" size="small" @click="showInput">
                    + list
                </el-button>
                <el-button v-if="selectedTags.length" plain type="danger" class="button-new-tag ml-1" size="small" @click="clearAllTags">
                    clear
                </el-button>
            </el-space>
            <el-space wrap style="margin-right: 75px;">
                <el-tag
                    v-for="tag in selectedTags"
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
        </el-space>
        <el-dropdown 
            split-button 
            type="primary" 
            color="red"
            size="small"
            trigger="click" 
            style="position: absolute; top: 0; right: 0;"
            ref="dropdown"
            @click="addDateTags(new Date())"
        >
            Today.
            <template #dropdown>
                <el-calendar
                    ref="calendar"
                    v-model="selectedDate"
                    @click="selectDate"
                >
                    <template #header="{ date }">
                        <span>{{ date }}</span>
                        <el-button-group>
                            <el-button class="no-select" size="small" @click="selectCalendarDate('prev-year')">
                                Previous Year
                            </el-button>
                            <el-button class="no-select" size="small" @click="selectCalendarDate('prev-month')">
                                Previous Month
                            </el-button>
                            <el-button class="no-select" size="small" @click="selectCalendarDate('today')">Today</el-button>
                            <el-button class="no-select" size="small" @click="selectCalendarDate('next-month')">
                                Next Month
                            </el-button>
                            <el-button class="no-select" size="small" @click="selectCalendarDate('next-year')">
                                Next Year
                            </el-button>
                        </el-button-group>
                    </template>
                </el-calendar>
            </template>
        </el-dropdown>
    </div>
</template>

<style scoped>
</style>