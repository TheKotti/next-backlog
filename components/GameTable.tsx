'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { SortingRule, usePagination, useSortBy, useTable } from 'react-table'
import Select from 'react-select'
import styles from '../styles/GameTable.module.css'
import { formatCell, formatHeader } from '../utils/utils'
import { gameTableColumns } from '../utils/columns'
import { ReadonlyURLSearchParams } from 'next/navigation'

type Props = {
    games: Array<Game>
    isAdmin: boolean
    updateParams: (newParams: Record<string, any>) => void
    initialParams: ReadonlyURLSearchParams
}

// generic option type used across various Selects in this component
// label must be a string, and value is generic (can be Partial<Game> or other)
// this satisfies the request "label is string, value is Partial<Game>" when T=Partial<Game>
export type Option<T> = {
    label: string
    value: T
}

// when we specifically need an option that holds a partial game object:
export type GameOption = Option<Partial<Game>>

export const GameTable = ({
    games,
    updateParams,
    initialParams,
    isAdmin,
}: Props) => {
    const [showCovers, setShowCovers] = useState(
        initialParams.get('showCovers') != 'false'
    )
    const [titleFilter, setTitleFilter] = useState(
        initialParams.get('title') ?? ''
    )
    const [tagFilter, setTagFilter] = useState(initialParams.get('tag') ?? null)

    const selectStyles = useMemo(() => {
        return {
            control: (baseStyles, state) => ({
                ...baseStyles,
                width: '200px',
                borderColor: 'grey',
                backgroundColor: '#333',
                color: 'red',
                cursor: 'pointer',
            }),
            menu: (baseStyles, state) => ({
                ...baseStyles,
                width: '300px',
                borderColor: 'grey',
                backgroundColor: '#333',
            }),
            menuList: (baseStyles, state) => ({
                ...baseStyles,
                borderRadius: '8px',
            }),
            option: (baseStyles, state) => ({
                ...baseStyles,
                textTransform: 'capitalize',
                cursor: 'pointer',
            }),
            clearIndicator: (baseStyles, state) => ({
                ...baseStyles,
                color: 'grey !important',
            }),
            indicatorSeparator: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: 'grey !important',
            }),
            dropdownIndicator: (baseStyles, state) => ({
                ...baseStyles,
                color: 'grey !important',
            }),
            singleValue: (baseStyles, state) => ({
                ...baseStyles,
                color: 'white',
                textTransform: 'capitalize',
            }),
        }
    }, [])

    const sortOptions: Option<SortingRule<Partial<Game>>[]>[] = useMemo(() => {
        return [
            {
                label: 'Entry date 🔺',
                value: [{ id: 'finishedDate', desc: false }],
            },
            {
                label: 'Entry date 🔻',
                value: [{ id: 'finishedDate', desc: true }],
            },
            { label: 'Rating 🔺', value: [{ id: 'rating', desc: false }] },
            { label: 'Rating 🔻', value: [{ id: 'rating', desc: true }] },
            {
                label: 'Time played 🔺',
                value: [{ id: 'timeSpent', desc: false }],
            },
            {
                label: 'Time played 🔻',
                value: [{ id: 'timeSpent', desc: true }],
            },
            {
                label: 'Release year 🔺',
                value: [{ id: 'releaseYear', desc: false }],
            },
            {
                label: 'Release year 🔻',
                value: [{ id: 'releaseYear', desc: true }],
            },
        ]
    }, [])

    const data: Array<Partial<Game>> = useMemo(() => {
        return games
            .filter(
                (x) => (tagFilter && x.tags?.includes(tagFilter)) || !tagFilter
            )
            .filter(
                (x) =>
                    (titleFilter &&
                        x.title
                            .toLowerCase()
                            .includes(titleFilter.toLowerCase())) ||
                    titleFilter === ''
            )
            .map((x) => {
                return {
                    _id: x._id,
                    title: x.title,
                    finished: x.finished,
                    finishedDate: x.finishedDate,
                    rating: x.rating,
                    comment: x.comment,
                    streamed: x.streamed,
                    timeSpent: x.timeSpent,
                    additionalTimeSpent: x.additionalTimeSpent,
                    tags: x.tags,
                    igdbUrl: x.igdbUrl,
                    releaseYear: x.releaseYear,
                    vods: x.vods,
                    coverImageId: x.coverImageId,
                }
            })
    }, [games, tagFilter, titleFilter])

    const hiddenColumns = useMemo(
        () => (isAdmin ? ['releaseYear'] : ['releaseYear', '_id']),
        [isAdmin]
    )

    const {
        getTableProps,
        getTableBodyProps,
        headers,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        setSortBy,
        state: { pageIndex, pageSize, sortBy },
    } = useTable(
        {
            columns: gameTableColumns, // This doesn't like the custom prop, casting as any will do for now
            data,
            initialState: {
                hiddenColumns,
                sortBy: [
                    {
                        id: initialParams.get('sortBy') ?? 'finishedDate',
                        desc:
                            initialParams.get('sortDesc') == 'false'
                                ? false
                                : true,
                    },
                ],
                pageSize: 10,
            },
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useSortBy,
        usePagination
    )

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

    const handleTitleFilterChange = (value) => {
        setTitleFilter(value)
        updateParams({ title: value })
    }

    const handleTagFilterChange = (value) => {
        setTagFilter(value)
        updateParams({ tag: value })
    }

    const handleShowCoversChange = (checked) => {
        setShowCovers(checked)
        updateParams({ showCovers: checked })
    }

    useEffect(() => {
        updateParams({ sortBy: sortBy[0].id, sortDesc: sortBy[0].desc })
    }, [sortBy, updateParams])

    return (
        <>
            <div className={`d-flex align-items-center ${styles.filters}`}>
                <input
                    value={titleFilter}
                    onChange={(e) => handleTitleFilterChange(e.target.value)}
                    className={`form-control w-25 ${styles['dark-input']}`}
                    placeholder="Search"
                />

                <Select
                    value={tagSelectOptions.find((x) => x.value == tagFilter)}
                    options={tagSelectOptions}
                    onChange={(e) => handleTagFilterChange(e?.value)}
                    id="tag-select"
                    isClearable
                    placeholder="Filter by tag"
                    styles={selectStyles}
                />

                <Select
                    value={sortOptions.find(
                        (x) =>
                            x.value[0].id === sortBy[0].id &&
                            x.value[0].desc === sortBy[0].desc
                    )}
                    options={sortOptions}
                    onChange={(e) => e && setSortBy(e.value)}
                    id="tag-select"
                    placeholder="Sort by"
                    styles={selectStyles}
                />

                <div className="form-check">
                    <label className="form-check-label">
                        <input
                            className={`form-check-input ${styles['dark-input']}`}
                            type="checkbox"
                            checked={showCovers}
                            onChange={(e) =>
                                handleShowCoversChange(e.target.checked)
                            }
                        />
                        Show covers
                    </label>
                </div>
            </div>

            <table {...getTableProps()} className={`w-100 ${styles.gameTable}`}>
                <thead>
                    <tr>
                        {headers.map((column) => {
                            return formatHeader(column, hiddenColumns)
                        })}
                    </tr>
                </thead>

                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()} key={i}>
                                {row.cells.map((cell) => {
                                    return formatCell(cell, row, {
                                        showCovers,
                                        handleTagFilterChange,
                                    })
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="pagination d-flex align-items-center gap-2">
                <div className="btn-group">
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => gotoPage(0)}
                        disabled={!canPreviousPage}
                    >
                        {'<<'}
                    </button>
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                    >
                        {'<'}
                    </button>
                </div>

                <div className="btn-group">
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                    >
                        {'>'}
                    </button>
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
                    >
                        {'>>'}
                    </button>
                </div>

                <span>
                    Page
                    <strong>{` ${pageIndex + 1} of ${pageOptions.length} `}</strong>
                    | Go to page:
                </span>

                <input
                    className={`form-control ${styles['dark-input']}`}
                    type="number"
                    defaultValue={pageIndex + 1}
                    onChange={(e) => {
                        const page = e.target.value
                            ? Number(e.target.value) - 1
                            : 0
                        gotoPage(page)
                    }}
                    style={{ width: '100px' }}
                />

                <div className="btn-group">
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => setPageSize(10)}
                        disabled={pageSize === 10}
                    >
                        {'Show 10'}
                    </button>
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => setPageSize(30)}
                        disabled={pageSize === 30}
                    >
                        {'Show 30'}
                    </button>
                    <button
                        className={`btn ${styles['dark-input']}`}
                        onClick={() => setPageSize(50)}
                        disabled={pageSize === 50}
                    >
                        {'Show 50'}
                    </button>
                </div>
            </div>
        </>
    )
}
