<!-- All items with entries applied to them. Automatically fetches items and entries when selected tags are changes, or when items or entires are mutated. -->

<script setup>
const { public: { backendAddress } } = useRuntimeConfig()

const { pending, data } = useLazyAsyncData('entries', () => $fetch(`${backendAddress}/api/entries?tags=${selectedTags.value.join(',')}`))
const refresh = () => refreshNuxtData('entries')

const selectedTags = useSelectedTags()
watch(selectedTags, () => refresh())

let entriesMap = {}
watch(data, (newData) => {
    entriesMap = newData.entries.reduce(
        (acc, entry) => {
            let selectedEntry = entry
            const existingEntry = acc[entry.key]

            if(existingEntry){
                const dotEntry = selectedTags.value.filter(x => entry.tags.includes(x))
                const dotExistingEntry = selectedTags.value.filter(x => existingEntry.tags.includes(x))
                if(dotExistingEntry > dotEntry)
                    selectedEntry = existingEntry
            }
            return {
                ... acc,
                [entry.key]: selectedEntry
            }
        },
        {}
    )
})

const update = async (key, value) => {
    await $fetch(`${backendAddress}/api/entries`, {
        method: 'POST',
        body: {
            key, value, 
            tags: selectedTags.value
        }
    })
}

const addItem = async () => {
    const input = document.querySelector('#new-item')
    await $fetch(`${backendAddress}/api/items`, {
        method: 'POST',
        body: {
            key: input.value,
            itype: 'checkbox',
            tags: selectedTags.value
        }
    })
    input.value = ''
    refresh()
}

const deleteItem = async (key) => {
    await $fetch(`${backendAddress}/api/items`, {
        method: 'DELETE',
        body: {
            key
        }
    })
    refresh()
}

refresh()
</script>

<template>
    <div v-if="pending || !data">loading...</div>
    <div v-else style="display: flex; flex-direction: column;">
        <div v-for="item in data.items" :key="item.key" style="display: flex;">
            <div v-if="item.itype === 'checkbox'">
                <input 
                    :name="item.key"
                    :type="item.itype" 
                    :checked="entriesMap[item.key]?.value === 'true'" 
                    @click="update(item.key, (entriesMap[item.key]?.value !== 'true').toString())"
                />
                <label :for="item.key">{{ item.key }}</label>
                <button @click="deleteItem(item.key)">x</button>
            </div>
            <div v-else>
                <p>{{ entriesMap[item.key]?.value }}</p>
            </div>
        </div>
    </div>
    <div>
        <label for="new-item">New Item:</label>
        <input name="new-item" id="new-item"/>
        <button @click="addItem">+</button>
    </div>
    <!-- <button @click="refresh">get</button> -->
</template>