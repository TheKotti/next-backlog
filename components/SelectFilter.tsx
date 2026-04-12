'use client'

import React from 'react'
import Select from 'react-select'

type Option = { value: string; label: string }

const sharedSelectStyles = {
    menu: (base, _state) => ({
        ...base,
        borderColor: 'grey',
        backgroundColor: '#333',
    }),
    menuList: (base, _state) => ({
        ...base,
        borderRadius: '8px',
    }),
    option: (base, _state) => ({
        ...base,
        textTransform: 'capitalize' as const,
        cursor: 'pointer',
    }),
    indicatorSeparator: (base, _state) => ({
        ...base,
        backgroundColor: 'grey !important',
    }),
    dropdownIndicator: (base, _state) => ({
        ...base,
        color: 'grey !important',
    }),
    input: (base, _state) => ({
        ...base,
        color: 'white !important',
    }),
}

type SelectFilterProps = {
    options: Array<Option>
    value: string | null
    onValueChange: (value: string | null) => void
    id: string
    placeholder: string
}

export const SelectFilter = ({
    options,
    value,
    onValueChange,
    id,
    placeholder,
}: SelectFilterProps) => {
    return (
        <div data-testid={id}>
            <Select
                value={options.find((x) => x.value == value)}
                options={options}
                onChange={(e) => onValueChange(e?.value ?? null)}
                id={id}
                instanceId={id}
                isClearable
                classNamePrefix="react-select"
                placeholder={placeholder}
                styles={{
                    ...sharedSelectStyles,
                    control: (base, _state) => ({
                        ...base,
                        width: '200px',
                        borderColor: 'grey',
                        backgroundColor: '#333',
                        cursor: 'pointer',
                    }),
                    menu: (base, _state) => ({
                        ...sharedSelectStyles.menu(base, _state),
                        width: '300px',
                    }),
                    clearIndicator: (base, _state) => ({
                        ...base,
                        color: 'grey !important',
                    }),
                    singleValue: (base, _state) => ({
                        ...base,
                        color: 'white',
                        textTransform: 'capitalize' as const,
                    }),
                }}
            />
        </div>
    )
}

type ColumnSelectFilterProps = {
    options: Array<Option>
    value: Array<Option>
    onValueChange: (visibleIds: string[]) => void
    id: string
    placeholder: string
}

export const ColumnSelectFilter = ({
    options,
    value,
    onValueChange,
    id,
    placeholder,
}: ColumnSelectFilterProps) => {
    return (
        <div data-testid={id}>
            <Select
            isMulti
            controlShouldRenderValue={false}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            isClearable={false}
            options={options}
            value={value}
            onChange={(selected) => onValueChange(selected.map((s) => s.value))}
            placeholder={placeholder}
            instanceId={id}
            classNamePrefix="react-select"
            components={{
                Option: ({ innerProps, label, isSelected }) => (
                    <div
                        {...innerProps}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span style={{ width: '1em' }}>
                            {isSelected ? '✓' : ''}
                        </span>
                        {label}
                    </div>
                ),
            }}
            styles={{
                ...sharedSelectStyles,
                control: (base, _state) => ({
                    ...base,
                    minWidth: '120px',
                    borderColor: 'grey',
                    backgroundColor: '#333',
                    cursor: 'pointer',
                }),
            }}
            />
        </div>
    )
}
