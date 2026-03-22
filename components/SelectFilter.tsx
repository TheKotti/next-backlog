'use client'

import React from 'react'
import Select from 'react-select'

type Props = {
    options: Array<{
        value: string
        label: string
    }>
    value: string | null
    onValueChange: (value: string | null) => void
    id: string
    placeholder: string
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
    input: (baseStyles, _state) => ({
        ...baseStyles,
        color: 'white !important',
    }),
}

export const SelectFilter = ({
    options,
    value,
    onValueChange,
    id,
    placeholder,
}: Props) => {
    return (
        <Select
            value={options.find((x) => x.value == value)}
            options={options}
            onChange={(e) => onValueChange(e?.value ?? null)}
            id={id}
            instanceId={id}
            isClearable
            placeholder={placeholder}
            styles={selectStyles}
        />
    )
}
