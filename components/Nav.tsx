'use client'

import Link from 'next/link'
import { toast } from 'react-toastify'
import { SignIn, SignOut } from './AuthComponents'
import { revalidateAction } from 'app/actions'

async function revalidate() {
  var res = await revalidateAction()
  if (res) {
    toast.success('Revalidated')
  } else {
    toast.error('Revalidation failed')
  }
}

export default function Nav({ username, isAdmin }: { username: string, isAdmin: boolean }) {
  return (
    <nav className='w-100 pb-3 mb-3 border-bottom d-flex justify-content-between align-items-center'>
      {username ? <SignOut username={username} /> : <SignIn />}

      {isAdmin && (
        <>
          <Link href='/admin'>
            Game list
          </Link>

          <Link href='/add-game'>
            Add game
          </Link>

          <button
            className='btn btn-light'
            onClick={() => revalidate()}
          >
            Revalidate
          </button>
        </>
      )}
    </nav>
  )
}