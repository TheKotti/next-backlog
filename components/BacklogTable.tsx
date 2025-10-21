/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
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
import { getHltbString } from '../utils/utils'
import { AdminCell, TitleCell } from './Cells';

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const BacklogTable = ({ games, isAdmin }: Props) => {
  const [titleFilter, setTitleFilter] = useState('')
  const [showCovers, setShowCovers] = useState(true)

  const backlogTableColumns: ColumnDef<Game>[] = useMemo(() => [
    {
      header: 'Game',
      accessorKey: 'title',
      cell: ({ getValue, row }) => TitleCell({ getValue, row, showCovers }),
    },
    {
      header: 'Howlongtobeat',
      accessorKey: 'hltbString',
      size: 1500
    },
    {
      header: 'Admin',
      accessorKey: '_id',
      enableGlobalFilter: false,
      enableSorting: false,
      cell: ({ getValue, row }) => AdminCell({ getValue, row, showNextButton: true }),
    },
  ], [showCovers])

  const data: Array<any> = useMemo(() => {
    return games
      .filter((x) => (titleFilter && x.title.toLowerCase().includes(titleFilter.toLowerCase())) || titleFilter === '')
      .map((x) => {
        return {
          _id: x._id,
          title: x.title,
          notPollable: x.notPollable,
          igdbUrl: x.igdbUrl,
          releaseYear: x.releaseYear,
          hltbString: getHltbString(x),
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
      columns: backlogTableColumns as ColumnDef<Game>[],
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
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
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
