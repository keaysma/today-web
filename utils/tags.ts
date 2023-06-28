export const eqSet = (xs: any, ys: any) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

export const tagIsMagic = (tag: string) =>
    tag.split(':').length === 2

export const tagIsDate = (tag: string) =>
    tagIsMagic(tag) && ['day', 'month', 'year'].includes(`${tag.split(':').at(0)}`)

export const getTagType = (tag: string) => {
    if (tagIsDate(tag))
        return 'warning'

    if (tagIsMagic(tag))
        return 'success'

    if(tag === 'blog')
        return 'info'

    return ''
}

export const getTagColor = (tag: string) => {    
    if (tagIsMagic(tag) && !tagIsDate(tag))
        return ''
    
    if(tag === 'blog'){
        return '#eee'
    }

    return ''

}

export const displayTag = (tag: string) =>
    `${tag.split(':').at(-1)}`

export const titleFromTags = (tagString: string) => {
    const rawTags = tagString.split(', ')
    const rawDateTags = rawTags.filter(tag => tagIsDate(tag))
    const normalTags = rawTags.filter(tag => !tagIsDate(tag))

    // If it works and it's stupid, it's not stupid
    const dateTags: string[] = []
    for(const yearTag of rawDateTags.filter(tag => tag.split(':')[0] === 'year')){
        for(const monthTag of rawDateTags.filter(tag => tag.split(':')[0] === 'month')){
            for(const dayTag of rawDateTags.filter(tag => tag.split(':')[0] === 'day')){
                const day = dayTag.split(':')[1]
                const month = monthTag.split(':')[1]
                const year = yearTag.split(':')[1]
                dateTags.push(`${month} ${day}, ${year}`)
            }
        }
    }
    return [ ... normalTags, ... dateTags ]
}

export const getTagsFromDate = (date: Date): string[] => {
    const day = date.getDate().toString()
    const year = date.getFullYear().toString()
    const month = date.toLocaleString('default', { month: 'long' })

    return [
        `month:${month}`, `day:${day}`, `year:${year}`
    ]
}

export const getTagsFromLocalStorage = (): string[] => 
    JSON.parse(
        localStorage.getItem('lastSelectedTags') || '[]'
    )

export const getTagsFromSearch = (): string[] => {
    const url = new URL(location.href)
    const tags = url.searchParams.get('tags')?.split?.(',') || []
    const today = url.searchParams.get('today')

    return [ 
        ... tags,
        ... (
            today !== null
                ? getTagsFromDate(new Date())
                : []
        )
    ]

}
