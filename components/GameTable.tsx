/* eslint-disable react/jsx-key */
import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useGlobalFilter, useSortBy, useTable } from 'react-table'
import router from 'next/router'

import { GlobalFilter } from './GlobalFilter'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

export const GameTable = ({ games, isAdmin }: Props) => {
  const columns = useMemo(() => {
    return [
      {
        Header: 'Date',
        accessor: 'finishedDate',
        disableGlobalFilter: true,
        primaryRow: true,
      },
      {
        Header: 'Game',
        accessor: 'title',
        primaryRow: true,
      },
      {
        Header: 'Rating',
        accessor: 'rating',
        disableGlobalFilter: true,
        primaryRow: true,
      },
      {
        accessor: 'comment',
        disableGlobalFilter: true,
      },
    ]
  }, [])

  const data: Array<any> = useMemo(() => {
    return games.map((x) => {
      return {
        _id: x._id,
        title: x.title,
        finishedDate: x.finishedDate ? dayjs(new Date(x.finishedDate)).format('DD MMM YYYY') : '', // What the heck next/dayjs?
        rating: x.rating,
        comment: x.comment,
      }
    })
  }, [games])

  const hiddenColumns = useMemo(() => ['_id'], [])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow, state, setGlobalFilter } = useTable(
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
    useSortBy
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
      <table {...getTableProps}>
        <thead>
          <tr>
            {headers.map((column) => {
              return <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}</th>
            })}
          </tr>
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} onClick={() => gameClick((row.original as any)._id)}>
                {row.cells.map((cell) => {
                  //console.log(cell)
                  if ((cell.column as any).primaryRow) {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  }
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
