export type Tags = string[]
export type IType = 'checkbox' | 'h1' | 'h2' | 'h3' | 'p';

export interface Item {
    key: string,
    tags: Tags,
    itype: IType,
    group: number,
    config: Record<string, string>
}

export interface Entry {
    key: string,
    value: string,
    tags: Tags,
    group: number,
}

export interface EntriesResponse {
    items: Item[],
    entries: Entry[]
}

export interface Group {
    id: number
    name: string
}

export interface User {
    tagSets: string[][],
    items: string[],
    entries: string[]
    groups: Group[]
}