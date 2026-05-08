'use client'

import { signIn, signOut } from 'next-auth/react'
import { Icon } from './Icon'

export function SignIn({ provider }: { provider?: string }) {
    return (
        <button
            className="btn btn-light"
            onClick={() => signIn(provider)}
            style={{
                background: '#6f42c1',
                borderColor: '#6f42c1',
                color: 'white',
            }}
        >
            Sign in to vote for upcoming games <Icon type="twitch" />
        </button>
    )
}

export function SignOut(props: { username: string }) {
    return (
        <button
            className="btn btn-light"
            onClick={() => signOut()}
            style={{
                background: '#6f42c1',
                borderColor: '#6f42c1',
                color: 'white',
            }}
        >
            Sign Out ({props.username})
        </button>
    )
}
