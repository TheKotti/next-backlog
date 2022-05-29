/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Cell, Row, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table'
import router from 'next/router'

import { GlobalFilter } from './GlobalFilter'
import styles from '../styles/GameTable.module.css'

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
      },
      {
        Header: 'Comments',
        accessor: 'comment',
        disableGlobalFilter: true,
        Cell: CommentCell,
      },
      {
        Header: 'Streamed',
        accessor: 'streamed',
        disableGlobalFilter: true,
        Cell: ({ value }) => {
          return <span>{value ? 'X' : ''}</span>
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
    if (['streamed', 'rating', 'finishedDate'].includes(cell.column.id)) {
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
      <div className={styles.filters}>
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={(e) => setGlobalFilter(e)} />
        <label>
          Sneaky?
          <input type='checkbox' checked={stealthFilter} onChange={(e) => setStealthFilter(e.target.checked)} />
        </label>
      </div>

      <table {...getTableProps} className={styles.gameTable}>
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
                  //console.log(cell)
                  return formatCell(cell, row)
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className='pagination'>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type='number'
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
