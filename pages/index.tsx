/* eslint-disable react/jsx-key */
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import router from 'next/router'
import { getSession, signIn } from 'next-auth/react'
import { useGlobalFilter, useSortBy, useTable } from 'react-table'
import dayjs from 'dayjs'

import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'
import { connectToDatabase } from '../lib/mongo'
import { GlobalFilter } from '../components/GlobalFilter'

type Props = {
  isAdmin: boolean
  games: Array<Game>
}

export default function Home({ isAdmin, games = [] }: Props) {
  useEffect(() => {
    window.addEventListener('keypress', (e) => {
      if (e.key === 'å') signIn()
    }) // Should clean this up but fuck next is doing a thing so fuck it for now
  }, [])

  const gameClick = (id) => {
    if (isAdmin) {
      router.push('/recap?id=' + id)
    }
  }

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
    ]
  }, [])

  const hiddenColumns = useMemo(() => ['_id'], [])

  const data: Array<any> = useMemo(() => {
    return games.map((x) => {
      return {
        _id: x._id,
        title: x.title,
        finishedDate: x.finishedDate ? dayjs(new Date(x.finishedDate)).format('DD MMM YYYY') : '', // What the heck next/dayjs?
        rating: x.rating,
      }
    })
  }, [games])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow, state, setGlobalFilter } = useTable(
    {
      columns,
      data,
      initialState: {
        hiddenColumns,
      },
    },
    useGlobalFilter,
    useSortBy
  )

  const { globalFilter } = state

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <Nav isAdmin={isAdmin} />

      <main>
        <div className={styles.container}>
          {games.length === 0 ? (
            <h2></h2>
          ) : (
            <>
              <GlobalFilter globalFilter={globalFilter} setGlobalFilter={(e) => setGlobalFilter(e)} />
              <table {...getTableProps}>
                <thead>
                  <tr>
                    {headers.map((column) => {
                      return (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}</th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row)
                    return (
                      <tr {...row.getRowProps()} onClick={() => gameClick((row.original as any)._id)}>
                        {row.cells.map((cell) => {
                          return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { res } = ctx
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  const session = await getSession(ctx)
  const isAdmin = process.env.ADMIN_USER_ID === session?.userId
  const { db } = await connectToDatabase()
  const games = await db.collection('games').find({}).sort({ published: -1 }).toArray()

  return {
    props: {
      isAdmin,
      games: JSON.parse(JSON.stringify(games)), //What the fuck
    },
  }
}
