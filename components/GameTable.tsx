/* eslint-disable react/jsx-key */
import React, { useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

import styles from '../styles/GameTable.module.css'
import { dateSort, getHltbString, scoreSort } from '../utils/utils'
import { AdminCell, CommentCell, DateCell, FinishedCell, TitleCell, VodCell } from './Cells';
import { ScoreIndicator } from './ScoreIndicator';

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const GameTable = ({ games, isAdmin }: Props) => {
  const [titleFilter, setTitleFilter] = useState('')
  const [showCovers, setShowCovers] = useState(true)

  const gameTableColumns: ColumnDef<Game>[] = useMemo(() => [
    {
      header: 'Date',
      accessorKey: 'finishedDate',
      sortDescFirst: true,
      cell: ({ getValue, row }) => DateCell({ getValue, row }),
      sortingFn: dateSort,
    },
    {
      header: 'Game',
      accessorKey: 'title',
      cell: ({ getValue, row }) => TitleCell({ getValue, row, showCovers: true }),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: ({ getValue }) => {
        var value = getValue()
        return <ScoreIndicator rating={value as (number | null)} />
      },
      sortingFn: (rowA, rowB) => scoreSort(rowA, rowB),
    },
    {
      header: 'Comments',
      accessorKey: 'comment',
      cell: ({ getValue, row }) => CommentCell({ getValue, row }),
      enableSorting: false,
    },
    {
      header: 'Finished',
      accessorKey: 'timeSpent',
      sortDescFirst: true,
      cell: FinishedCell,
    },
    {
      header: 'Vods',
      accessorKey: 'streamed',
      enableSorting: false,
      cell: VodCell,
    },
    {
      header: 'Admin',
      accessorKey: '_id',
      enableSorting: false,
      cell: ({ getValue, row }) => AdminCell({ getValue, row, showVodButton: true }),
    },
  ], [showCovers])

  const data: Array<any> = useMemo(() => {
    return games
      .filter((x) => (titleFilter && x.title.toLowerCase().includes(titleFilter.toLowerCase())) || titleFilter === '')
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
          stealth: x.stealth,
          igdbUrl: x.igdbUrl,
          releaseYear: x.releaseYear,
          vods: x.vods,
          coverImageId: x.coverImageId,
        }
      })
  }, [games, titleFilter])

  const columnVisibility = { _id: isAdmin };
  const [sorting, setSorting] = useState<SortingState>([{
    id: "title",
    desc: false
  }])
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const table = useReactTable(
    {
      columns: gameTableColumns as ColumnDef<Game>[],
      data,
      state: {
        columnVisibility,
        sorting,
        pagination
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      onPaginationChange: setPagination,
      enableSortingRemoval: false
    },
  )

  return (
    <>
      <div className={`d-flex align-items-center ${styles.filters}`}>
        <input
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className={`form-control w-25 ${styles['dark-input']}`}
          placeholder='Search'
        />

        <div className='form-check'>
          <label className='form-check-label'>
            <input
              className={`form-check-input ${styles['dark-input']}`}
              type='checkbox'
              checked={showCovers}
              onChange={(e) => setShowCovers(e.target.checked)}
            />
            Show covers
          </label>
        </div>
      </div>

      <table className={`w-100 ${styles.gameTable}`}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}
                  onClick={header.column.getToggleSortingHandler()}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  {{
                    asc: ' 🔻',
                    desc: ' 🔺',
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className='pagination d-flex align-items-center gap-2'>
        <div className='btn-group'>
          <button className={`btn ${styles['dark-input']}`} onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
            {'<<'}
          </button>
          <button className={`btn ${styles['dark-input']}`} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {'<'}
          </button>
        </div>

        <div className='btn-group'>
          <button className={`btn ${styles['dark-input']}`} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {'>'}
          </button>
          <button
            className={`btn ${styles['dark-input']}`}
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>

        <span>
          Page<strong>{` ${pagination.pageIndex + 1} of ${table.getPageCount()} `}</strong>
        </span>

        <div className='btn-group'>
          <button className={`btn ${styles['dark-input']}`} onClick={() => table.setPageSize(10)} disabled={pagination.pageSize === 10}>
            {'Show 10'}
          </button>
          <button className={`btn ${styles['dark-input']}`} onClick={() => table.setPageSize(30)} disabled={pagination.pageSize === 30}>
            {'Show 30'}
          </button>
          <button className={`btn ${styles['dark-input']}`} onClick={() => table.setPageSize(50)} disabled={pagination.pageSize === 50}>
            {'Show 50'}
          </button>
        </div>
      </div>
    </>
  )
}

/* import { usePagination, useSortBy, useTable } from 'react-table'

import styles from '../styles/GameTable.module.css'
import { useNextQueryParams } from '../hooks/useNextQueryParams'
import { formatCell, formatHeader } from '../utils/utils'
import { gameTableColumns } from '../utils/columns'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const GameTable = ({ games, isAdmin }: Props) => {
  const [stealthFilter, setStealthFilter] = useState(false)
  const [showCovers, setShowCovers] = useState(true)
  const [titleFilter, setTitleFilter] = useState('')
  const { params, updateParams, paramsLoaded } = useNextQueryParams({
    sortBy: 'finishedDate',
    sortDesc: true,
    title: '',
  })

  const data: Array<any> = useMemo(() => {
    return games
      .filter((x) => (stealthFilter && x.stealth) || !stealthFilter)
      .filter((x) => (titleFilter && x.title.toLowerCase().includes(titleFilter.toLowerCase())) || titleFilter === '')
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
          stealth: x.stealth,
          igdbUrl: x.igdbUrl,
          releaseYear: x.releaseYear,
          vods: x.vods,
          coverImageId: x.coverImageId,
        }
      })
  }, [games, stealthFilter, titleFilter])

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
    setSortBy,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns: gameTableColumns as any, // This doesn't like the custom prop, casting as any will do for now
      data,
      initialState: {
        hiddenColumns,
        sortBy: [
          {
            id: 'finishedDate',
            desc: true,
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

  // On load set stuff from query parameters
  useEffect(() => {
    if (paramsLoaded) {
      params.sneaky === 'true' && setStealthFilter(true)
      params.title && setTitleFilter(params.title as string)
      params.sortBy && setSortBy([{ id: params.sortBy as string, desc: params.sortDesc === 'true' ? true : false }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsLoaded])

  const handleStealthFilterChange = (checked) => {
    setStealthFilter(checked)
    if (checked) {
      updateParams({ ...params, sneaky: checked })
    } else {
      delete params.sneaky
      updateParams({ ...params })
    }
  }

  const handleTitleFilterChange = (value) => {
    setTitleFilter(value)
    updateParams({ ...params, title: value })
  }

  useEffect(() => {
    if (paramsLoaded) {
      updateParams({ ...params, sortBy: sortBy[0].id, sortDesc: sortBy[0].desc })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  return (
    <>
      <div className={`d-flex align-items-center ${styles.filters}`}>
        <input
          value={titleFilter}
          onChange={(e) => handleTitleFilterChange(e.target.value)}
          className={`form-control w-25 ${styles['dark-input']}`}
          placeholder='Search'
        />

        <div className='form-check'>
          <label className='form-check-label'>
            <input
              className={`form-check-input ${styles['dark-input']}`}
              type='checkbox'
              checked={stealthFilter}
              onChange={(e) => handleStealthFilterChange(e.target.checked)}
            />
            Sneaky?
          </label>
        </div>

        <div className='form-check'>
          <label className='form-check-label'>
            <input
              className={`form-check-input ${styles['dark-input']}`}
              type='checkbox'
              checked={showCovers}
              onChange={(e) => setShowCovers(e.target.checked)}
            />
            Show covers
          </label>
        </div>
      </div>

      <table {...getTableProps()} className={`w-100 ${styles.gameTable}`}>
        <thead>
          <tr>
            {headers.map((column, i) => {
              return formatHeader(column, isAdmin)
            })}
          </tr>
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} key={i}>
                {row.cells.map((cell) => {
                  return formatCell(cell, row, { showCovers })
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className='pagination d-flex align-items-center gap-2'>
        <div className='btn-group'>
          <button className={`btn ${styles['dark-input']}`} onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>
          <button className={`btn ${styles['dark-input']}`} onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>
        </div>

        <div className='btn-group'>
          <button className={`btn ${styles['dark-input']}`} onClick={() => nextPage()} disabled={!canNextPage}>
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
          Page<strong>{` ${pageIndex + 1} of ${pageOptions.length} `}</strong>| Go to page:
        </span>

        <input
          className={`form-control ${styles['dark-input']}`}
          type='number'
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            gotoPage(page)
          }}
          style={{ width: '100px' }}
        />

        <div className='btn-group'>
          <button className={`btn ${styles['dark-input']}`} onClick={() => setPageSize(10)} disabled={pageSize === 10}>
            {'Show 10'}
          </button>
          <button className={`btn ${styles['dark-input']}`} onClick={() => setPageSize(30)} disabled={pageSize === 30}>
            {'Show 30'}
          </button>
          <button className={`btn ${styles['dark-input']}`} onClick={() => setPageSize(50)} disabled={pageSize === 50}>
            {'Show 50'}
          </button>
        </div>
      </div>
    </>
  )
}
 */