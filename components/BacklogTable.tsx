/* eslint-disable react/jsx-key */
import { useMemo } from 'react'
import { Cell, Row, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table'
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
      {
        Header: 'Blocked from polls by',
        accessor: 'notPollable',
      },
      {
        Header: 'Info',
        accessor: 'igdbUrl',
        disableGlobalFilter: true,
        disableSortBy: true,
        Cell: ({ value, row }) => {
          console.log('value', value, row.original)
          return (
            <a href={value} target='_blank' rel='noreferrer' style={{ fontFamily: 'Noto Color Emoji' }}>
              🔗
            </a>
          )
        },
      },
    ]
  }, [])

  const data: Array<any> = useMemo(() => {
    return games.map((x) => {
      return {
        _id: x._id,
        title: x.title,
        notPollable: x.notPollable,
        igdbUrl: x.igdbUrl,
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
        pageSize: 10,
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

  // Surely you can improve this
  const formatCell = (cell: Cell<object, any>, row: Row<object>) => {
    // TITLE COLUMN
    if (cell.column.id === 'title') {
      return (
        <td {...cell.getCellProps()} onClick={() => gameClick((row.original as any)._id)} key={cell.column.id + row.id}>
          {cell.render('Cell')}
        </td>
      )
    }

    // CENTERED COLUMN
    if (['igdbUrl'].includes(cell.column.id)) {
      return (
        <td
          {...cell.getCellProps(() => ({
            style: {
              textAlign: 'center',
            },
          }))}
          key={cell.column.id + row.id}
        >
          {cell.render('Cell')}
        </td>
      )
    }

    return (
      <td {...cell.getCellProps()} key={cell.column.id + row.id}>
        {cell.render('Cell')}
      </td>
    )
  }

  return (
    <>
      <GlobalFilter globalFilter={globalFilter} setGlobalFilter={(e) => setGlobalFilter(e)} />

      <table {...getTableProps} className={`w-100 ${styles.gameTable}`}>
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
                  return formatCell(cell, row)
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

        <div className='btn-group'>
          <button className='btn btn-light' onClick={() => setPageSize(10)} disabled={pageSize === 10}>
            {'Show 10'}
          </button>
          <button className='btn btn-light' onClick={() => setPageSize(30)} disabled={pageSize === 30}>
            {'Show 30'}
          </button>
          <button className='btn btn-light' onClick={() => setPageSize(50)} disabled={pageSize === 50}>
            {'Show 50'}
          </button>
        </div>
      </div>
    </>
  )
}
