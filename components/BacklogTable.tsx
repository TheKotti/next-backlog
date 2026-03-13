'use client'

import { useMemo, useState } from 'react'
import { usePagination, useSortBy, useTable, Column } from 'react-table'
import styles from '../styles/GameTable.module.css'
import { backlogTableColumns } from '../utils/columns'
import {
    formatCell,
    formatHeader,
    getHltbString,
    titleSortSimple,
} from '../utils/utils'
import { ReadonlyURLSearchParams } from 'next/navigation'
import CoverImage from './CoverImage'
import { TagSelect } from './TagSelect'

type Props = {
    games: Array<Game>
    isAdmin: boolean
    updateParams: (newParams: Record<string, unknown>) => void
    initialParams: ReadonlyURLSearchParams
}

export const BacklogTable = ({
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

    const data: Array<Game & { hltbString: string }> = useMemo(() => {
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
                    ...x,
                    hltbString: getHltbString(x),
                }
            })
    }, [games, tagFilter, titleFilter])

    const hiddenColumns = useMemo(() => (isAdmin ? [] : ['_id']), [isAdmin])

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
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns: backlogTableColumns as Column[],
            data,
            initialState: {
                hiddenColumns,
                sortBy: [
                    {
                        id: 'title',
                        desc: true,
                    },
                ],
                pageSize: 10,
            },
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

    const handleShowCoversChange = (checked) => {
        setShowCovers(checked)
        updateParams({ showCovers: checked })
    }

    return (
        <>
            <div className={`d-flex align-items-center ${styles.filters}`}>
                <input
                    value={titleFilter}
                    onChange={(e) => handleTitleFilterChange(e.target.value)}
                    className={`form-control w-25 ${styles['dark-input']}`}
                    placeholder="Search"
                />

                <TagSelect
                    games={games}
                    tagFilter={tagFilter}
                    onTagFilterChange={handleTagFilterChange}
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

            {showCovers ? (
                <div className={`${styles['backlog-grid']}`}>
                    {data
                        .filter(
                            (x) =>
                                (titleFilter &&
                                    x.title
                                        .toLowerCase()
                                        .includes(titleFilter.toLowerCase())) ||
                                titleFilter === ''
                        )
                        .sort((a, b) => titleSortSimple(a.title, b.title))
                        .map((game) => {
                            return (
                                <CoverImage
                                    game={game}
                                    showHltb
                                    showTags
                                    onTagClick={handleTagFilterChange}
                                    key={game._id}
                                    isAdmin={isAdmin}
                                />
                            )
                        })}
                </div>
            ) : (
                <>
                    <table
                        {...getTableProps}
                        className={`w-100 ${styles.gameTable}`}
                    >
                        <thead>
                            <tr>
                                {headers.map((column) => {
                                    if (column.id === '_id' && !isAdmin) return
                                    return formatHeader(column, hiddenColumns)
                                })}
                            </tr>
                        </thead>

                        <tbody {...getTableBodyProps()}>
                            {page.map((row) => {
                                prepareRow(row)
                                const rowProps = row.getRowProps()
                                return (
                                    <tr {...rowProps} key={rowProps.key}>
                                        {row.cells.map((cell) => {
                                            return formatCell(cell, row, {
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
            )}
        </>
    )
}
