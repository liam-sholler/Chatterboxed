import { useSyncExternalStore } from 'react'
import { authApi } from './api'
import type { User } from './types'

/** The key shown during sign-up. Held in memory only; never persisted. */
export interface PendingEnrollment {
  secret: string
  /** Label for the entry in the authenticator app, e.g. the username. */
  accountName: string
}

interface AuthState {
  user: User | null
  /** Set between the password step and the authenticator-app step. */
  pendingChallengeId: string | null
  /** Set between register and the authenticator-app step, for sign-up only. */
  pendingEnrollment: PendingEnrollment | null
}

let state: AuthState = {
  user: null,
  pendingChallengeId: null,
  pendingEnrollment: null,
}
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

  setUser: (user: User) =>
    setState({ user, pendingChallengeId: null, pendingEnrollment: null }),

  /** Login step 2: a challenge to verify. Clears any sign-up in progress. */
  setPendingChallenge: (pendingChallengeId: string | null) =>
    setState({ pendingChallengeId, pendingEnrollment: null }),

  /** Sign-up step 2: the challenge to verify plus the key to show. */
  setPendingEnrollment: (
    pendingChallengeId: string,
    pendingEnrollment: PendingEnrollment,
  ) => setState({ pendingChallengeId, pendingEnrollment }),

  signOut: async () => {
    try {
      await authApi.logout()
    } finally {
      setState({
        user: null,
        pendingChallengeId: null,
        pendingEnrollment: null,
      })
    }
  },
}

export type AuthStore = typeof authStore

export const useAuth = () =>
  useSyncExternalStore(authStore.subscribe, authStore.getState)
