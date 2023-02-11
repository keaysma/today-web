<!-- A multi-select component for selecting tags. Auto-fetches suggestions when text is entered. -->
<script setup>
import { tagIsDate, getTagType, getTagColor, displayTag } from '@/utils/tags'

const user = useUser()

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
const showInput = () => {
    inputVisible.value = true
    nextTick(() => InputRef?.value?.focus())
}

const inputValue = ref('')
const AddTagRef = ref()
const InputRef = ref()
const selectedTags = useSelectedTags()
const addTags = (tags) => {
    addToSelectedTags(tags)

    inputVisible.value = false
    inputValue.value = ''
    localStorage.setItem('lastSelectedTags', JSON.stringify(selectedTags.value))
    nextTick(() =>  AddTagRef?.value?.ref?.focus())
}
const selectAutocompleteOption = () => {
    console.debug(`inputValue`, inputValue.value)
    if(!inputValue.value) return

    if(selectedTags.value.length === 0){
        const group = user.value.tagSets.find(tagSet => tagSet.join(" | ") === inputValue.value)
        console.debug(`group`, group)
        if(group){
            addTags([ ... group ])
            return
        }
    }

    addTags([inputValue.value])
}
const handleRemoveTag = (removeTag) => {
    selectedTags.value = selectedTags.value.filter(tag => tag !== removeTag)
    localStorage.setItem('lastSelectedTags', JSON.stringify(selectedTags.value))
}
const clearAllTags = () => {
    selectedTags.value = []
}


const querySearch = (queryString, cb) => {
    const { items, entries, tagSets } = user.value || {
        items: [],
        entries: [],
        tagSets: [],
    }

    console.debug(`queryString`, queryString)

    if(!queryString.length){
        if(!selectedTags.value.length){
            cb(
                [... tagSets]
                .map(tagSet => ({ value: tagSet.join(" | ") }))
            )
        }else{
            cb(
                [... items]
                .filter(value => !tagIsDate(value))
                .map(value => ({ value }))
            )
        }
    }else{
        const allTags = new Set([... items, ... entries, queryString ])
        const results = [... allTags].filter(tag => tag.indexOf(queryString) > -1)
        cb(
            results
            .map(value => ({ value }))
        )
    }
}
</script>

<template>
    <div
        class="card-header" 
        style="position: relative;"
        v-loading="!user"
    >
        <el-space direction="vertical" alignment="start">
            <el-space wrap style="margin-right: 75px;">
                <el-autocomplete
                    v-if="inputVisible"
                    clearable
                    size="large"
                    ref="InputRef"
                    v-model="inputValue"
                    :fetch-suggestions="querySearch"
                    class="inline-input w-50"
                    placeholder="Please Input"
                    @select="selectAutocompleteOption"
                />
                <el-button v-else ref="AddTagRef" plain type="success" class="button-new-tag ml-1" size="large" @click="showInput">
                    + list
                </el-button>
                <el-button v-if="selectedTags.length" plain type="danger" class="button-new-tag ml-1" size="large" @click="clearAllTags">
                    clear
                </el-button>
            </el-space>
            <el-space wrap style="margin-right: 75px;">
                <el-tag
                    v-for="tag in selectedTags"
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
        <el-dropdown 
            split-button 
            type="primary" 
            color="red"
            size="large"
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
                            <el-button class="no-select" size="large" @click="selectCalendarDate('prev-year')">
                                Previous Year
                            </el-button>
                            <el-button class="no-select" size="large" @click="selectCalendarDate('prev-month')">
                                Previous Month
                            </el-button>
                            <el-button class="no-select" size="large" @click="selectCalendarDate('today')">Today</el-button>
                            <el-button class="no-select" size="large" @click="selectCalendarDate('next-month')">
                                Next Month
                            </el-button>
                            <el-button class="no-select" size="large" @click="selectCalendarDate('next-year')">
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