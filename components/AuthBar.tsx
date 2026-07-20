'use client'

import { useSession } from 'next-auth/react'
import { SignIn, SignOut } from './AuthComponents'

export const AuthBar = () => {
    const { data: session } = useSession()
    const username = session?.user?.name ?? ''

    return (
        <div className="pb-3 mb-3 border-bottom">
            {username ? <SignOut username={username} /> : <SignIn />}
        </div>
    )
}
