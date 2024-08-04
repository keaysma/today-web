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

    if (tag === 'blog')
        return 'info'

    return 'primary'
}

export const getTagColor = (tag: string) => {
    if (tagIsMagic(tag) && !tagIsDate(tag))
        return ''

    if (tag === 'blog') {
        return '#eee'
    }

    return ''

}

export const getTagIcon = (tag: string) => {
    if (tagIsDate(tag))
        return ElIconCalendar
}

export const displayTag = (tag: string) =>
    `${tag.split(':').at(-1)}`

export const titleFromTags = (tagString: string) => {
    const rawTags = tagString.split(', ')
    const rawDateTags = rawTags.filter(tag => tagIsDate(tag))
    const normalTags = rawTags.filter(tag => !tagIsDate(tag))

    const yearTags = rawDateTags.filter(tag => tag.split(':')[0] === 'year').map(tag => tag.split(':')[1])
    const monthTags = rawDateTags.filter(tag => tag.split(':')[0] === 'month').map(tag => tag.split(':')[1])
    const dayTags = rawDateTags.filter(tag => tag.split(':')[0] === 'day').map(tag => tag.split(':')[1])
    const dateTags: string[] = [
        ...
        yearTags.length
            ? yearTags.map(
                year => monthTags.length
                    ? monthTags.map(
                        month => dayTags.length
                            ? dayTags.map(
                                day => `${month} ${day}, ${year}`
                            )
                            : `${month} ${year}`
                    )
                    : year
            ).flat(2)
            : monthTags.length
                ? monthTags.map(
                    month => dayTags.length
                        ? dayTags.map(
                            day => `${month} ${day}`
                        )
                        : month
                ).flat(1)
                : dayTags.map(day => `day ${day}`)
    ]

    return [...normalTags, ...dateTags]
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
        ...tags,
        ... (
            today !== null
                ? getTagsFromDate(new Date())
                : []
        )
    ]

}
