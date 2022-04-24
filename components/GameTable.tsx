/* eslint-disable react/jsx-key */
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useGlobalFilter, useSortBy, useTable } from 'react-table'
import router from 'next/router'

import { GlobalFilter } from './GlobalFilter'
import styles from '../styles/GameTable.module.css'

type Props = {
  games: Array<Game>
  isAdmin: boolean
}

const CommentCell = ({ value }) => {
  const [showFull, setShowFull] = useState(false)
  const shortThreshold = 100
  const shortText = value.length > shortThreshold ? value.substring(0, shortThreshold - 3) + '...' : value
  const displayedText = showFull ? value : shortText
  return (
    <span
      onClick={() => setShowFull(!showFull)}
      dangerouslySetInnerHTML={{ __html: displayedText.replace(/\n/g, '<br />') }}
    ></span>
  )
}

export const GameTable = ({ games, isAdmin }: Props) => {
  const columns = useMemo(() => {
    return [
      {
        Header: 'Date',
        accessor: 'finishedDate',
        disableGlobalFilter: true,
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
        accessor: 'comment',
        disableGlobalFilter: true,
        Cell: CommentCell,
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
      <table {...getTableProps} className={styles.gameTable}>
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
    </>
  )
}
