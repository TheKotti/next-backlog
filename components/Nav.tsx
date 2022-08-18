import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

import styles from '../styles/Nav.module.css'

type Props = {
  isAdmin: boolean
}

export default function Nav(props: Props) {
  const { isAdmin } = props
  const { data: session } = useSession()

  if (!isAdmin) {
    return null
  }

  return (
    <nav className='w-100 py-3 border-bottom d-flex justify-content-evenly align-items-center'>
      <button className='btn btn-light' onClick={() => signOut()}>
        Sign out
      </button>

      <Link href='/'>
        <a>Home</a>
      </Link>

      <Link href='/add-game'>
        <a>Add game</a>
      </Link>

      <Link href='/random'>
        <a>Random</a>
      </Link>
    </nav>
  )
}
