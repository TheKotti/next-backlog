'use client'

import Link from 'next/link'
import { toast } from 'react-toastify'
import { RevalidateButton, SignIn, SignOut } from './AuthComponents'
import { useEffect, useState } from 'react'

async function revalidate(username: string) {
  try {
    const response = await fetch(`/api/revalidate?secret=${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to revalidate')
    }
    
    toast.success('Cache refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh cache')
  }
}

export default function Nav({ username, isAdmin }: { username: string, isAdmin: boolean }) {
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

          <RevalidateButton />
        </>
      ) : (
        <SignIn />
      )}
    </nav>
  )
}