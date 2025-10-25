import { auth } from 'app/auth'
import Nav from './Nav'

export default async function NavWrapper() {
  const authState = await auth()
  const username = authState?.user?.name ?? ""
  const isAdmin = process.env.ADMIN_USER_NAME === username

  return <Nav username={username} isAdmin={isAdmin} />
}