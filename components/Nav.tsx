import Link from 'next/link'
import { toast } from 'react-toastify'
import { SignIn, SignOut } from './AuthComponents'
import { auth } from 'app/auth'

async function revalidate() {
  const authState = await auth()
  const username = authState?.user?.name ?? ""

  fetch(`/api/revalidate?secret=${username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(() => toast.success('Revalidated'))
}


export default async function Nav() {
  const authState = await auth()
  const username = authState?.user?.name ?? ""
  const isAdmin = process.env.ADMIN_USER_NAME === username

  return (
    <nav className='w-100 pb-3 mb-3 border-bottom d-flex justify-content-between align-items-center'>
      {isAdmin ? (
        <>
          <SignOut />

          <Link href='/admin'>
            Game list
          </Link>

          <Link href='/add-game'>
            Add game
          </Link>

          <Link href='/random'>
            Random
          </Link>

          <button
            className='btn btn-light'
            onClick={async () => {
              "use server"
              await revalidate()
            }}>
            Refresh
          </button>
        </>
      ) : (
        <SignIn />
      )}
    </nav>
  )
}
