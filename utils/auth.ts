'use server'

import { auth, signIn, signOut } from "app/auth"

export async function handleSignIn(provider?: string) {
    await signIn(provider)
}

export async function handleSignOut() {
    await signOut()
}

export async function handleRevalidate() {
    const authState = await auth()
    const username = authState?.user?.name ?? ""
        
    const response = await fetch(`${process.env.APP_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({secret: username}) 
    })

    const body = await response.json()
    
    if (body.error) {
        return false
    }
    
    return true
}