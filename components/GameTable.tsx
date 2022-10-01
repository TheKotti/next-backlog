/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Cell, Row, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table'
import router from 'next/router'

import { GlobalFilter } from './GlobalFilter'
import styles from '../styles/GameTable.module.css'
import { ScoreIndicator } from './ScoreIndicator'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

const CommentCell = ({ value }) => {
  const [showFull, setShowFull] = useState(false)
  const shortThreshold = 2000
  const shortText = value.length > shortThreshold ? value.substring(0, shortThreshold - 3) + '...' : value
  const displayedText = showFull ? value : shortText
  return (
    <span
      onClick={() => setShowFull(!showFull)}
      dangerouslySetInnerHTML={{ __html: displayedText.replace(/\n/g, '<br />') }}
    ></span>
  )
}

const DateCell = ({ value, row }) => {
  if (row.original['finished'] === 'Happening') return <span>Ongoing or soon™</span>

  const formattedDate = value ? dayjs(new Date(value)).format('DD MMM YYYY') : ''
  return <span>{formattedDate}</span>
}

const dateSort = (rowA, rowB, id, desc) => {
  // I am a hack
  if (rowA.original['finished'] === 'Happening') return 1
  if (rowB.original['finished'] === 'Happening') return -1

  const a = new Date(rowA.values[id]).getTime()
  const b = new Date(rowB.values[id]).getTime()
  return a - b
}

export const GameTable = ({ games, isAdmin }: Props) => {
  const [stealthFilter, setStealthFilter] = useState(false)

  const columns = useMemo(() => {
    return [
      {
        Header: 'Date',
        accessor: 'finishedDate',
        disableGlobalFilter: true,
        Cell: DateCell,
        sortType: dateSort,
      },
      {
        Header: 'Game',
        accessor: 'title',
      },
      {
        Header: 'Rating',
        accessor: 'rating',
        disableGlobalFilter: true,
        Cell: ({ value }) => {
          return <ScoreIndicator rating={value} />
        },
      },
      {
        Header: 'Comments',
        accessor: 'comment',
        disableGlobalFilter: true,
        Cell: CommentCell,
        disableSortBy: true,
      },
      {
        Header: 'Finished',
        accessor: 'timeSpent',
        disableGlobalFilter: true,
        Cell: ({ value, row }) => {
          let finished = row.original.finished
          if (row.original.finished === 'Nope') finished = 'Did not finish'
          if (row.original.finished === 'Yes') finished = 'Completed'
          return <>{value ? `${finished} (${value}h)` : null}</>
        },
      },
      {
        Header: 'Sneaky',
        accessor: 'stealth',
        disableGlobalFilter: true,
        disableSortBy: true,
        Cell: ({ value }) => {
          return <>{value ? 'X' : ''}</>
        },
      },
      {
        Header: 'Streamed',
        accessor: 'streamed',
        disableGlobalFilter: true,
        disableSortBy: true,
        Cell: ({ value }) => {
          return <>{value ? 'X' : ''}</>
        },
      },
    ]
  }, [])

  const data: Array<any> = useMemo(() => {
    return games
      .filter((x) => (stealthFilter && x.stealth) || !stealthFilter)
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
        }
      })
  }, [games, stealthFilter])

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
            id: 'finishedDate',
            desc: true,
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

    if (cell.column.id === 'rating') {
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

    // CENTERED COLUMN
    if (['streamed', 'finishedDate', 'timeSpent', 'stealth'].includes(cell.column.id)) {
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
      <div className={`d-flex align-items-center ${styles.filters}`}>
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={(e) => setGlobalFilter(e)} />
        <div className='form-check'>
          <input
            className='form-check-input'
            type='checkbox'
            checked={stealthFilter}
            onChange={(e) => setStealthFilter(e.target.checked)}
          />
          <label className='form-check-label'>Sneaky?</label>
        </div>
      </div>

      <table {...getTableProps} className={`w-100 ${styles.gameTable}`}>
        <thead>
          <tr>
            {headers.map((column, i) => {
              return (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={i}>
                  {column.render('Header')}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} key={i}>
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
