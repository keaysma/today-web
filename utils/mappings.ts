interface Item {
    key: string,
    tags: string[]
    itype: 'checkbox' | 'h1' | 'h2' | 'h3' | 'p'
}

interface Entry {
    key: string,
    value: string,
    tags: string[]
}

export const checkboxTypes = ["checkbox", "checkbox-link"]

export const makeItemsMapping = (items: Item[]) => items.reduce(
    (acc, item) => ({
        ... acc,
        [item.key]: item
    }),
    {}
)

export const makeItemsGroupsMapping = (items: Item[]) => items.reduce<Record<string, Record<string, Item>>>(
    (acc, item) => {
        const group = item.tags.join(', ')
        return {
            ... acc,
            [group]: {
                ... (acc[group] || {}),
                [item.key]: item
            }
        }
    },
    {}
)

export const makeValuesMappingBase = (itemsMapping: Record<string, Item>) => Object.entries(itemsMapping).reduce(
    (acc, [key, { itype }]) => ({
        ... acc,
        [key]: checkboxTypes.includes(itype) ? false : ''
    }),
    {}
)

export const makeEntriesMapping = (entries: Entry[], tags: string[]) => entries.reduce<Record<string, Entry>>(
    (acc, entry) => {
        let selectedEntry = entry
        const existingEntry = acc[entry.key]

        /*if(existingEntry)
            return {
                ... acc,
                [entry.key + ' (dup) ']: selectedEntry
            }

        return {
            ... acc,
            [entry.key]: selectedEntry
        }*/

        if(existingEntry){
            const dotEntry = tags.filter(x => entry.tags.includes(x))
            const dotExistingEntry = tags.filter(x => existingEntry.tags.includes(x))
            if(dotExistingEntry.length > dotEntry.length){
                return {
                    ... acc,
                    [`${entry.key} (dup)`]: entry
                }
            }else{
                return {
                    ... acc,
                    [`${entry.key} (dup)`]: existingEntry,
                    [entry.key]: entry
                }
            }
        }
        return {
            ... acc,
            [entry.key]: entry
        }
    },
    {}
)

const chechboxValueMap: Record<string, boolean | undefined> = {
    'true': true,
    'false': false,
    'strike': undefined
}

export const makeValuesMapping = (entriesMapping: Record<string, Entry>, itemsMapping: Record<string, Item>) => Object.entries(entriesMapping).reduce(
    (acc, [k, { value, key }]) => {
        const item = itemsMapping[key]
        if(!item) return acc

        const parsedValue = checkboxTypes.includes(item.itype)
            ? chechboxValueMap[value]
            : value

        return { 
            ... acc, 
            [k]: parsedValue
        }
    }, 
    {}
)