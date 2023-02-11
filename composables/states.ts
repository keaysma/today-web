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
}

export const addDateTags = (date: Date) => {
    const selectedTags = useSelectedTags()
    const day = date.getDate().toString()
    const year = date.getFullYear().toString()
    const month = date.toLocaleString('default', { month: 'long' })

    selectedTags.value = (selectedTags.value || []).filter(tag => !tagIsDate(tag))
    
    addToSelectedTags([
        `month:${month}`, `day:${day}`, `year:${year}`
    ])
}