import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'

import axios from 'axios'
import { toast } from 'react-toastify'

type Props = {
  isAdmin: boolean
  username: string
}

export default function Nav(props: Props) {
  const { isAdmin, username } = props

  const refresh = () => {
    if (isAdmin) {
      axios
        .get(`/api/revalidate?secret=${username}`)
        .then(() => toast.success('Revalidated'))
        .catch((err) => {
          toast.error('REVALIDATION FAILED')
        })
    } else {
      console.log("YOU'RE NO ADMIN")
    }
  }

  return (
    <nav className='w-100 py-3 border-bottom d-flex justify-content-evenly align-items-center'>
      {isAdmin ? (
        <>
          <button className='btn btn-light' onClick={() => signOut()}>
            Sign out ({username})
          </button>

          <Link href='/admin'>
            Home
          </Link>

          <Link href='/add-game'>
            Add game
          </Link>

          <Link href='/random'>
            Random
          </Link>

          <button className='btn btn-light' onClick={() => refresh()}>
            Refresh
          </button>
        </>
      ) : (
        <button className='btn btn-light' onClick={() => signIn().then(() => refresh())}>
          Sign in as {username}
        </button>
      )}
    </nav>
  )
}
