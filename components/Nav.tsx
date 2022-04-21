import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

import styles from '../styles/Nav.module.css'

type Props = {
  isAdmin: boolean
}

export default function Nav(props: Props) {
  const { isAdmin } = props
  const { data: session } = useSession()

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        <li>
          {!session ? (
            <button onClick={() => signIn()}>Sign in</button>
          ) : (
            <button onClick={() => signOut()}>Sign out</button>
          )}
        </li>
        <li className={styles.item}>
          <Link href='/'>
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href='/add-game'>
            <a>Add game</a>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
