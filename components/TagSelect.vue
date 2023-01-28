<!-- A multi-select component for selecting tags. Auto-fetches suggestions when text is entered. -->
<script setup>
const { public: { backendAddress } } = useRuntimeConfig()

const { pending, data } = useFetch(`${backendAddress}/api/all-tags`)
const selectedTags = useSelectedTags()
const additionalTagOptions = useState('additionalTags', () => {
    return []
})

const onChange = (event) => {
    //console.log(e.target.map(v => [v.value, v.selected]))
    const newSelectedTags = Array.from(event.target)
        .filter(({ selected }) => selected)
        .map(({ value }) => value)
    
    selectedTags.value = newSelectedTags
    localStorage.setItem('lastSelectedTags', JSON.stringify(newSelectedTags))
}

const addTag = () => {
    const input = document.querySelector('#new-tag')
    additionalTagOptions.value.push(input.value)
    input.value = ""
}

if(process.client)
    additionalTagOptions.value = JSON.parse(localStorage.getItem('lastSelectedTags')) || []
</script>

<template>
    <div style="display: flex; flex-direction: column;">
        <label for="tags">Tags:</label>
        <select name="tags" id="tags" @change="onChange" multiple>
            <option v-for="tag in new Set([... data.tags, ... additionalTagOptions])" :key="tag" :value="tag">{{ tag }}</option>
        </select>
    </div>

    <div>
        <label for="new-tag">New tag:</label>
        <input name="new-tag" id="new-tag"/>
        <button @click="addTag">+</button>
    </div>
</template>