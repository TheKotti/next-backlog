/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
import { usePagination, useSortBy, useTable } from 'react-table'

import styles from '../styles/GameTable.module.css'
import { backlogTableColumns } from '../utils/columns'
import { formatCell, getHltbString } from '../utils/utils'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const BacklogTable = ({ games, isAdmin }: Props) => {
  const [titleFilter, setTitleFilter] = useState('')

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
        }
      })
  }, [games, titleFilter])

  const hiddenColumns = useMemo(() => (isAdmin ? [] : ['_id']), [isAdmin])

  const {
    getTableProps,
    getTableBodyProps,
    headers,
    prepareRow,
    state,
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
      columns: backlogTableColumns as any, // TODO: Impletement cover art things here, and to randomizer
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
    useSortBy,
    usePagination
  )

  return (
    <>
      <input
        value={titleFilter}
        onChange={(e) => setTitleFilter(e.target.value)}
        className={`form-control w-25 ${styles['dark-input']}`}
        placeholder='Search'
      />

      <table {...getTableProps} className={`w-100 ${styles.gameTable}`}>
        <thead>
          <tr>
            {headers.map((column) => {
              if (column.id === '_id' && !isAdmin) return
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
