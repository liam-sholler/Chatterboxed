import { useSyncExternalStore } from 'react'
import { authApi } from './api'
import type { User } from './types'

interface AuthState {
  user: User | null
  /** Set between the password step and the authenticator-app step. */
  pendingChallengeId: string | null
}

let state: AuthState = { user: null, pendingChallengeId: null }
const listeners = new Set<() => void>()

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

let bootstrapPromise: Promise<void> | null = null

/**
 * Tiny external store so route guards (outside React) and components share one
 * source of truth without a provider. It is injected into the router context.
 */
export const authStore = {
  getState: () => state,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /** Restores an existing session once. Failures count as signed out. */
  bootstrap: () => {
    bootstrapPromise ??= authApi
      .getSession()
      .then((user) => setState({ user }))
      .catch(() => {})
    return bootstrapPromise
  },

  setUser: (user: User) => setState({ user, pendingChallengeId: null }),

  setPendingChallenge: (pendingChallengeId: string | null) =>
    setState({ pendingChallengeId }),

  signOut: async () => {
    try {
      await authApi.logout()
    } finally {
      setState({ user: null, pendingChallengeId: null })
    }
  },
}

export type AuthStore = typeof authStore

export const useAuth = () =>
  useSyncExternalStore(authStore.subscribe, authStore.getState)
