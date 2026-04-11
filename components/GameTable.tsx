'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePagination, useSortBy, useTable } from 'react-table'
import styles from '../styles/GameTable.module.css'
import { formatCell, formatHeader } from '../utils/utils'
import { gameTableColumns } from '../utils/columns'
import { ReadonlyURLSearchParams } from 'next/navigation'
import Select from 'react-select'
import { SelectFilter } from './SelectFilter'

const TOGGLEABLE_COLUMNS = [
    { id: 'finishedDate', label: 'Date' },
    { id: 'rating', label: 'Rating' },
    { id: 'comment', label: 'Comments' },
    { id: 'timeSpent', label: 'Finished' },
    { id: 'streamed', label: 'Vods' },
]

type Props = {
    games: Array<Game>
    isAdmin: boolean
    updateParams: (newParams: Record<string, unknown>) => void
    initialParams: ReadonlyURLSearchParams
}

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
    const [devFilter, setDevFilter] = useState(initialParams.get('dev') ?? null)

    const data: Array<Partial<Game>> = useMemo(() => {
        return games
            .filter(
                (x) => (tagFilter && x.tags?.includes(tagFilter)) || !tagFilter
            )
            .filter(
                (x) =>
                    (devFilter && x.developers?.includes(devFilter)) ||
                    !devFilter
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
    }, [games, tagFilter, devFilter, titleFilter])

    const [userHiddenColumns, setUserHiddenColumns] = useState<string[]>(() => {
        const param = initialParams.get('hiddenCols')
        return param ? param.split(',').filter(Boolean) : []
    })

    const hiddenColumns = useMemo(
        () => [
            ...(isAdmin ? ['releaseYear'] : ['releaseYear', '_id']),
            ...userHiddenColumns,
        ],
        [isAdmin, userHiddenColumns]
    )

    const tagOptions = useMemo(() => {
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

    const devOptions = useMemo(() => {
        const devs: string[] = []

        games.forEach((g) => {
            g.developers?.forEach((t) => devs.push(t))
        })

        // count occurrences per dev
        const devCounts: Record<string, number> = {}
        devs.forEach((t) => {
            devCounts[t] = (devCounts[t] || 0) + 1
        })

        const uniqueTags = [...new Set(devs)]

        const devOptions = uniqueTags
            .sort((a, b) => {
                const countA = devCounts[a] ?? 0
                const countB = devCounts[b] ?? 0
                if (countA !== countB) {
                    return countB - countA // descending by count
                }
                return a.localeCompare(b) // ascending by name
            })
            .map((t) => {
                return { value: t, label: `${t} (${devCounts[t] ?? 0})` }
            })

        return devOptions
    }, [games])

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
        setHiddenColumns,
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

    const handleTitleFilterChange = (value) => {
        setTitleFilter(value)
        updateParams({ title: value })
    }

    const handleTagFilterChange = (value: string | null) => {
        setTagFilter(value)
        updateParams({ tag: value })
    }

    const handleDevFilterChange = (value: string | null) => {
        setDevFilter(value)
        updateParams({ dev: value })
    }

    const handleShowCoversChange = (checked) => {
        setShowCovers(checked)
        updateParams({ showCovers: checked })
    }

    const handleColumnToggle = (visibleIds: string[]) => {
        const next = TOGGLEABLE_COLUMNS.map((c) => c.id).filter(
            (id) => !visibleIds.includes(id)
        )
        setUserHiddenColumns(next)
        updateParams({ hiddenCols: next.join(',') || null })
    }

    useEffect(() => {
        setHiddenColumns(hiddenColumns)
    }, [hiddenColumns, setHiddenColumns])

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

                <SelectFilter
                    options={tagOptions}
                    value={tagFilter}
                    onValueChange={handleTagFilterChange}
                    id="tag-select"
                    placeholder="Filter by tag"
                />

                <SelectFilter
                    options={devOptions}
                    value={devFilter}
                    onValueChange={handleDevFilterChange}
                    id="dev-select"
                    placeholder="Filter by developer"
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

                <Select
                    isMulti
                    options={TOGGLEABLE_COLUMNS.map(({ id, label }) => ({
                        value: id,
                        label,
                    }))}
                    value={TOGGLEABLE_COLUMNS.filter(
                        ({ id }) => !userHiddenColumns.includes(id)
                    ).map(({ id, label }) => ({ value: id, label }))}
                    onChange={(selected) =>
                        handleColumnToggle(selected.map((s) => s.value))
                    }
                    placeholder="Columns"
                    instanceId="column-select"
                    styles={{
                        control: (base) => ({
                            ...base,
                            minWidth: '140px',
                            borderColor: 'grey',
                            backgroundColor: '#333',
                            cursor: 'pointer',
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: '#333',
                            borderColor: 'grey',
                        }),
                        menuList: (base) => ({
                            ...base,
                            borderRadius: '8px',
                        }),
                        option: (base) => ({
                            ...base,
                            cursor: 'pointer',
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#555',
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: 'white',
                        }),
                        multiValueRemove: (base) => ({
                            ...base,
                            color: 'grey',
                        }),
                        clearIndicator: (base) => ({
                            ...base,
                            color: 'grey !important',
                        }),
                        indicatorSeparator: (base) => ({
                            ...base,
                            backgroundColor: 'grey !important',
                        }),
                        dropdownIndicator: (base) => ({
                            ...base,
                            color: 'grey !important',
                        }),
                        input: (base) => ({
                            ...base,
                            color: 'white !important',
                        }),
                    }}
                />
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
