'use client'

import React, { useMemo } from 'react'
import Select from 'react-select'

type TagSelectProps = {
    games: Array<Game>
    tagFilter: string | null
    onTagFilterChange: (value: string | null) => void
}

const selectStyles = {
    control: (baseStyles, _state) => ({
        ...baseStyles,
        width: '200px',
        borderColor: 'grey',
        backgroundColor: '#333',
        color: 'red',
        cursor: 'pointer',
    }),
    menu: (baseStyles, _state) => ({
        ...baseStyles,
        width: '300px',
        borderColor: 'grey',
        backgroundColor: '#333',
    }),
    menuList: (baseStyles, _state) => ({
        ...baseStyles,
        borderRadius: '8px',
    }),
    option: (baseStyles, _state) => ({
        ...baseStyles,
        textTransform: 'capitalize',
        cursor: 'pointer',
    }),
    clearIndicator: (baseStyles, _state) => ({
        ...baseStyles,
        color: 'grey !important',
    }),
    indicatorSeparator: (baseStyles, _state) => ({
        ...baseStyles,
        backgroundColor: 'grey !important',
    }),
    dropdownIndicator: (baseStyles, _state) => ({
        ...baseStyles,
        color: 'grey !important',
    }),
    singleValue: (baseStyles, _state) => ({
        ...baseStyles,
        color: 'white',
        textTransform: 'capitalize',
    }),
}

export const TagSelect = ({
    games,
    tagFilter,
    onTagFilterChange,
}: TagSelectProps) => {
    const tagSelectOptions = useMemo(() => {
        const tags: string[] = []

        games.forEach((g) => {
            g.tags?.forEach((t) => tags.push(t))
        })

        // count occurrences per tag
        const tagCounts: Record<string, number> = {}
        tags.forEach((t) => {
            tagCounts[t] = (tagCounts[t] || 0) + 1
        })

        const uniqueTags = [...new Set(tags)].sort()

        const tagOptions = uniqueTags.map((t) => {
            return { value: t, label: `${t} (${tagCounts[t] ?? 0})` }
        })

        return tagOptions
    }, [games])

    return (
        <Select
            value={tagSelectOptions.find((x) => x.value == tagFilter)}
            options={tagSelectOptions}
            onChange={(e) => onTagFilterChange(e?.value ?? null)}
            id="tag-select"
            instanceId="tag-select"
            isClearable
            placeholder="Filter by tag"
            styles={selectStyles}
        />
    )
}
