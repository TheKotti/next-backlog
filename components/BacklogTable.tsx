/* eslint-disable react/jsx-key */
import { useMemo } from 'react'
import { useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table'
import router from 'next/router'

import { GlobalFilter } from './GlobalFilter'
import styles from '../styles/GameTable.module.css'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const BacklogTable = ({ games, isAdmin }: Props) => {
  const columns = useMemo(() => {
    return [
      {
        Header: 'Game',
        accessor: 'title',
      },
    ]
  }, [])

  const data: Array<any> = useMemo(() => {
    return games.map((x) => {
      return {
        _id: x._id,
        title: x.title,
      }
    })
  }, [games])

  const hiddenColumns = useMemo(() => ['_id'], [])

  const {
    getTableProps,
    getTableBodyProps,
    headers,
    prepareRow,
    state,
    setGlobalFilter,
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
      columns,
      data,
      initialState: {
        hiddenColumns,
        sortBy: [
          {
            id: 'title',
            desc: false,
          },
        ],
        pageSize: 30,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const { globalFilter } = state

  const gameClick = (id) => {
    if (isAdmin) {
      router.push('/recap?id=' + id)
    }
  }

  return (
    <>
      <GlobalFilter globalFilter={globalFilter} setGlobalFilter={(e) => setGlobalFilter(e)} />

      <table {...getTableProps} className={styles.gameTable}>
        <thead>
          <tr>
            {headers.map((column) => {
              return <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}</th>
            })}
          </tr>
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  //console.log(cell)
                  if (cell.column.id === 'title') {
                    return (
                      <td {...cell.getCellProps()} onClick={() => gameClick((row.original as any)._id)}>
                        {cell.render('Cell')}
                      </td>
                    )
                  }
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className='pagination d-flex align-items-center gap-2'>
        <div className='btn-group'>
          <button className='btn btn-light' onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>
          <button className='btn btn-light' onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>
        </div>

        <div className='btn-group'>
          <button className='btn btn-light' onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>
          <button className='btn btn-light' onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>
        </div>

        <span>
          Page<strong>{` ${pageIndex + 1} of ${pageOptions.length} `}</strong>| Go to page:
        </span>

        <input
          className='form-control'
          type='number'
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            gotoPage(page)
          }}
          style={{ width: '100px' }}
        />

        <select
          className='form-select'
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}
          style={{ width: '120px' }}
        >
          {[10, 30, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
