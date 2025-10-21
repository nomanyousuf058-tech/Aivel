'use client'

import { useUser } from '@clerk/nextjs'

export function useAuth() {
  const { user, isSignedIn, isLoaded } = useUser()

  const isOwner = user?.publicMetadata?.role === 'owner'

  return {
    user,
    isSignedIn,
    isLoaded,
    isOwner
  }
}