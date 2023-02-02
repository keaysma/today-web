<script setup>
import { titleFromTags } from '@/utils/tags'
const { public: { backendAddress } } = useRuntimeConfig()
const route = useRoute();
let selectedTags = ref(['blog', ... route.params.tags])
const { pending, data } = useFetch(`${backendAddress}/api/public/entries?tags=${selectedTags.value.join(',')}`)

</script>

<template>
    <div>
        {{ data }}
    </div>
</template>