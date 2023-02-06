export const useUser = () => useState('user', () => {})
export const useSelectedTags = () => useState<string[]>('selectedTags', () => [])
export const useCount = () => useState<number>('count', () => 0)
export const useCreateItemFormIsOpen = () => useState<Boolean>('createItemFormIsOpen', () => false)