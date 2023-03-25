/* eslint-disable react/jsx-key */
import React, { useEffect, useMemo, useState } from 'react'

import { Cell, ColumnInstance, Row, usePagination, useSortBy, useTable } from 'react-table'

import styles from '../styles/GameTable.module.css'
import { ScoreIndicator } from './ScoreIndicator'
import { useNextQueryParams } from '../hooks/useNextQueryParams'
import { AdminCell, CheckmarkCell, CommentCell, DateCell, FinishedCell, TitleCell, VodCell } from './Cells'
import { dateSort, scoreSort } from '../utils'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const GameTable = ({ games, isAdmin }: Props) => {
  const [stealthFilter, setStealthFilter] = useState(false)
  const [titleFilter, setTitleFilter] = useState('')
  const { params, updateParams, paramsLoaded } = useNextQueryParams()

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

  const columns = useMemo(() => {
    return [
      {
        Header: 'Date',
        accessor: 'finishedDate',
        sortDescFirst: true,
        Cell: DateCell,
        sortType: dateSort,
      },
      {
        Header: 'Game',
        accessor: 'title',
        Cell: TitleCell,
      },
      {
        Header: 'Rating',
        accessor: 'rating',
        sortDescFirst: true,
        Cell: ({ value }) => {
          return <ScoreIndicator rating={value} />
        },
        sortType: scoreSort,
      },
      {
        Header: 'Comments',
        accessor: 'comment',
        Cell: CommentCell,
        disableSortBy: true,
      },
      {
        Header: 'Finished',
        accessor: 'timeSpent',
        sortDescFirst: true,
        Cell: FinishedCell,
      },
      {
        Header: 'Sneaky',
        accessor: 'stealth',
        disableSortBy: true,
        Cell: CheckmarkCell,
      },
      {
        Header: 'Streamed',
        accessor: 'streamed',
        disableSortBy: true,
        Cell: VodCell,
      },
      {
        Header: 'Recap',
        accessor: '_id',
        disableSortBy: true,
        Cell: AdminCell,
      },
    ]
  }, [])

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
      autoResetSortBy: false,
      disableSortRemove: true,
    },
    useSortBy,
    usePagination
  )

  useEffect(() => {
    if (paramsLoaded) {
      updateParams({ ...params, sortBy: sortBy[0].id, sortDesc: sortBy[0].desc })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  // Surely you can improve this
  const formatCell = (cell: Cell<object, any>, row: Row<object>) => {
    // TITLE COLUMN
    if (cell.column.id === 'title') {
      return (
        <td {...cell.getCellProps()} key={cell.column.id + row.id}>
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
    if (['streamed', 'finishedDate', 'timeSpent', 'stealth', '_id'].includes(cell.column.id)) {
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

  const formatHeader = (column: ColumnInstance<object>) => {
    if (column.id === '_id' && !isAdmin) return

    // CONDENCED
    if (['streamed', 'stealth'].includes(column.id)) {
      return (
        <th
          {...column.getHeaderProps(() => ({
            style: {
              fontStretch: 'condensed',
              paddingLeft: '8px',
              paddingRight: '8px',
              textAlign: 'center',
            },
          }))}
          key={column.id}
        >
          {column.render('Header')}
        </th>
      )
    }

    if (column.id === 'timeSpent') {
      return (
        <th
          {...column.getHeaderProps(() => ({
            style: {
              fontStretch: 'condensed',
              paddingLeft: '8px',
              paddingRight: '8px',
              textAlign: 'center',
            },
            ...column.getSortByToggleProps(),
          }))}
          key={column.id}
        >
          <span className='d-flex'>
            {column.render('Header')}
            <span>{column.isSorted ? (column.isSortedDesc ? ' 🔻' : ' 🔺') : ''}</span>
          </span>
        </th>
      )
    }

    return (
      <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
        <span className='d-flex'>
          {column.render('Header')}
          <span>{column.isSorted ? (column.isSortedDesc ? ' 🔻' : ' 🔺') : ''}</span>
        </span>
      </th>
    )
  }

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
      </div>

      <table {...getTableProps()} className={`w-100 ${styles.gameTable}`}>
        <thead>
          <tr>
            {headers.map((column, i) => {
              return formatHeader(column)
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
