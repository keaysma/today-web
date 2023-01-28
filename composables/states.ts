export const useSelectedTags = () => useState<string[]>('selectedTags', () => [])
export const useCount = () => useState<number>('count', () => 0)