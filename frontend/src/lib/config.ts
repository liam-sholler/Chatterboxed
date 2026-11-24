/**
 * App-wide constants. Import from here instead of scattering literals.
 * Server settings can be overridden per machine with a `.env.local` file
 * (see `.env.example` and `docs/API.md`).
 */
const env = import.meta.env

export const APP_NAME = 'Chatterboxed'

// Backend server. An empty SHARED_SERVER_PORT means "no explicit port" (e.g. https on 443).
export const SERVER_PROTOCOL: string = env.VITE_SERVER_PROTOCOL ?? 'http'
export const SERVER_HOST: string = env.VITE_SERVER_HOST ?? 'localhost'
export const SHARED_SERVER_PORT: string = env.SHARED_SERVER_PORT ?? '9943'

export const API_BASE_URL = `${SERVER_PROTOCOL}://${SERVER_HOST}${SHARED_SERVER_PORT ? `:${SHARED_SERVER_PORT}` : ''}`

/** How long a request may take before the wrapper gives up. */
export const API_TIMEOUT_MS = 10_000

/** Every backend endpoint the frontend calls. Add new ones here. */
export const API_PATHS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    verifyMfa: '/auth/verify-mfa',
  },
} as const
