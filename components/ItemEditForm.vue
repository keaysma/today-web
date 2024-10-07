<script setup lang="ts">
import type { Group, Item } from '~~/types';
import { TYPES_WITH_LINK_CONFIG } from '@/constants/items'

const { public: { backendAddress } } = useRuntimeConfig()
const emit = defineEmits<{
    (event: 'close'): void
    (event: 'submitted'): void
}>();

const props = defineProps<{
    item: Item
    userGroups: Record<number, Group>
}>();
const itemRef = toRef(props, 'item');
const editModel = ref<Item>(structuredClone(toRaw(itemRef.value)));

const selectedTags = useSelectedTags()
// const orphanTags = computed(() => editModel.value.tags.filter(tag => !selectedTags.value.includes(tag)));
const toggleTag = (tag: string) => {
    const tags = editModel.value.tags;
    if (tags.includes(tag)) {
        tags.splice(tags.indexOf(tag), 1);
    } else {
        tags.push(tag);
    }
};

const doMigrateEntries = ref(true);

const submitApi = async () => {
    return await $fetch(`${backendAddress}/api/items`, {
        method: 'PATCH',
        credentials: 'include',
        body: {
            updates: [{
                item: props.item,
                changes: editModel.value,
                migrateEntries: doMigrateEntries.value,
            }]
        }
    });
};

const close = () => emit("close");
const submitted = () => emit("submitted");
const submit = () => submitApi().then(submitted).then(close);


const selectedGroup = computed(() => props.userGroups[editModel.value.group] ?? null);
const selectGroup = (group: Group) => editModel.value.group = group.id;
</script>

<template>
    <el-form>
        <el-form-item label="Group">
            <el-dropdown split-button trigger="click" @command="selectGroup">
                {{ selectedGroup.name }}
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="group in Object.values(props.userGroups)" :key="group.id" :command="group">
                            {{ group.name }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </el-form-item>
        <el-form-item label="Name">
            <el-input v-model="editModel.key" />
        </el-form-item>
        <el-form-item label="Link">
            <el-input v-if="TYPES_WITH_LINK_CONFIG.includes(item.itype)" v-model="editModel.config.link" placeholder="https://..."/>
        </el-form-item>
        <el-form-item label="Tags">
            <el-space direction="horizontal" alignment="flex-start">
                <el-check-tag v-for="tag in selectedTags" :key="tag" :type="getTagType(tag)" :color="getTagColor(tag)"
                    :checked="editModel.tags.includes(tag)" @update:checked="toggleTag(tag)">
                    {{ displayTag(tag) }}
                </el-check-tag>
            </el-space>

        </el-form-item>
        <el-form-item label="Migrate Entries">
            <el-switch v-model="doMigrateEntries" active-text="Yes" inactive-text="No" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit">Save</el-button>
            <el-button @click="close">Cancel</el-button>
        </el-form-item>
    </el-form>
</template>