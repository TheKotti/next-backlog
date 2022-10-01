import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

import axios from 'axios'
import { toast } from 'react-toastify'

type Props = {
  isAdmin: boolean
  userId?: string
}

export default function Nav(props: Props) {
  const { isAdmin, userId } = props

  const refresh = () => {
    axios
      .get(`/api/revalidate?secret=${userId}`)
      .then(() => toast.success('Revalidated'))
      .catch((err) => {
        toast.error('REVALIDATION FAILED')
        console.log('eee', err)
      })
  }

  return (
    <nav className='w-100 py-3 border-bottom d-flex justify-content-evenly align-items-center'>
      {isAdmin ? (
        <>
          <button className='btn btn-light' onClick={() => signOut()}>
            Sign out
          </button>

          <Link href='/admin'>
            <a>Home</a>
          </Link>

          <Link href='/add-game'>
            <a>Add game</a>
          </Link>

          <Link href='/random'>
            <a>Random</a>
          </Link>

          {userId && (
            <button className='btn btn-light' onClick={() => refresh()}>
              Refresh
            </button>
          )}
        </>
      ) : (
        <button className='btn btn-light' onClick={() => signIn()}>
          Sign in
        </button>
      )}
    </nav>
  )
}
