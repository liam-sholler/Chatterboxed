import { api } from '@/lib/api'
import { API_PATHS } from '@/lib/config'
import type {
  LoginRequest,
  LoginResult,
  RegisterPayload,
  RegisterResponse,
  User,
  VerifyMfaRequest,
} from './types'

/**
 * The only file that talks to the backend for auth. Request and response
 * shapes live in `./types.ts`; endpoints live in `@/lib/config`. Failed
 * requests reject with an `ApiError` whose message is safe to show.
 */
export const authApi = {
  /**
   * TODO(backend): there is no "who am I" endpoint yet, so this always reports
   * signed out and a page refresh drops the session in the UI. Add an endpoint
   * (e.g. GET /auth/me) to API_PATHS and call it here.
   */
  getSession: async (): Promise<User | null> => null,

  /** Password step. May answer `mfa_required` instead of a session. */
  login: (request: LoginRequest) =>
    api.post<LoginResult>(API_PATHS.auth.login, request),

  /**
   * Starts sign-up. Nothing is created yet: the response carries the
   * authenticator-app key and a challenge that `verifyTotp` completes.
   */
  register: (request: RegisterPayload) =>
    api.post<RegisterResponse>(API_PATHS.auth.register, request),

  /**
   * Authenticator-app step: completes a pending challenge, either a login
   * (`mfa_required`) or a sign-up (which creates the account).
   */
  verifyTotp: (challengeId: string, code: string) =>
    api.post<User>(API_PATHS.auth.verifyMfa, {
      challengeId,
      code,
    } satisfies VerifyMfaRequest),

  /** TODO(backend): no logout endpoint yet, so this only clears the local state. */
  logout: async (): Promise<void> => {},
}
