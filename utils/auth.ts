'use server'

import { auth, signIn, signOut } from "app/auth"

export async function handleSignIn(provider?: string) {
    await signIn(provider)
}

export async function handleSignOut() {
    await signOut()
}