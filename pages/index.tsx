import axios from 'axios'
import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { useEffect, useState } from 'react'

import Nav from '../components/Nav'
import PostCard from '../components/PostCard'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [games, setGames] = useState<any[]>([])

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

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <Nav />

      <main>
        <div className={styles.container}>
          {games.length === 0 ? (
            <h2>No added posts</h2>
          ) : (
            <ul>
              {games.map((post, i) => (
                <PostCard post={post} key={i} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
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
