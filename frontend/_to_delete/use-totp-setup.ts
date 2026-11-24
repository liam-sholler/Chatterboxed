import { useCallback, useEffect, useRef, useState } from 'react'
import { authApi } from './api'

type TotpSetupState =
  | { status: 'loading' }
  | { status: 'ready'; secret: string }
  | { status: 'error'; message: string }

/**
 * Starts authenticator-app enrollment once when the page mounts and exposes
 * the shared key. Enrollment may rotate the key on the server, so the request
 * is guarded to run a single time (React StrictMode re-runs effects in dev)
 * and is only repeated through `retry`.
 */
export function useTotpSetup() {
  const [state, setState] = useState<TotpSetupState>({ status: 'loading' })
  const started = useRef(false)

  const start = useCallback(() => {
    setState({ status: 'loading' })
    authApi.beginTotpSetup().then(
      ({ secret }) => setState({ status: 'ready', secret }),
      (error) =>
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'We couldn’t start setup. Try again.',
        }),
    )
  }, [])

  useEffect(() => {
    if (started.current) return
    started.current = true
    start()
  }, [start])

  return { state, retry: start }
}
