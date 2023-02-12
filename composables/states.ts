import { getTagsFromDate } from "~~/utils/tags"

export const useUser = () => useState('user', () => {})
export const useSelectedTags = () => useState<string[]>('selectedTags', () => [])
export const useCount = () => useState<number>('count', () => 0)

export const addToSelectedTags = (tags: string[]) => {
    const selectedTags = useSelectedTags()
    selectedTags.value = [ 
        ... new Set([ 
            ... selectedTags.value || [], 
            ... tags || []
        ].map(tag => tag.toLowerCase()))
    ]
    localStorage.setItem('lastSelectedTags', JSON.stringify(selectedTags.value))
}

export const addDateTags = (date: Date) => {
    const selectedTags = useSelectedTags()
    
    selectedTags.value = (selectedTags.value || []).filter(tag => !tagIsDate(tag))
    
    addToSelectedTags(getTagsFromDate(date))
}