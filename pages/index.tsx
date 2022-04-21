import { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import router from 'next/router'
import { signIn } from 'next-auth/react'

import Nav from '../components/Nav'
import { useAdminStatus } from '../lib/hooks'
import styles from '../styles/Home.module.css'

export default function Home({ ADMIN_USER_ID }) {
  const [games, setGames] = useState<Game[]>([])
  const adminStatus = useAdminStatus(ADMIN_USER_ID)

  useEffect(() => {
    window.addEventListener(
      'keypress',
      (e) => {
        if (e.key === 'å') signIn()
      },
      { once: true }
    )
  }, [])

  useEffect(() => {
    axios
      .get('api/games')
      .then((res) => {
        setGames(res.data.message)
      })
      .catch((err) => {
        console.log('ERROR: ', err)
      })
  }, [])

  const gameClick = (id) => {
    if (adminStatus) {
      router.push('/recap?id=' + id)
    }
  }

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <Nav isAdmin={adminStatus === 'admin'} />

      <main>
        <div className={styles.container}>
          {games.length === 0 ? (
            <h2></h2>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, i) => (
                  <tr key={game._id}>
                    <td
                      onClick={() => {
                        gameClick(game._id)
                      }}
                    >
                      {game.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      ADMIN_USER_ID: process.env.ADMIN_USER_ID,
    },
  }
}

/* export async function getServerSideProps(ctx) {
  // get the current environment
  const { APP_URL } = process.env

  // THIS IS THE ONE
  const session = await getSession(ctx)
  const token = await getToken(ctx)

  console.log('aaa', session)
  //console.log('aeaa', token)

  // request posts from api
  const response = await axios.get(`${APP_URL}/api/games`)

  // extract the data
  const data = response.data

  return {
    props: {
      games: data['message'],
    },
  }
} */
