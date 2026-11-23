/**
 * Auth API contract. These are DEFAULTS: edit them to match the backend and
 * the rest of the frontend follows. See docs/API.md.
 */

export interface User {
  id: string
  username: string
}

// POST /auth/register  →  User
export interface RegisterPayload {
  username: string
  password: string
}

// POST /auth/login  →  LoginResult
export interface LoginRequest {
  username: string
  password: string
}

/**
 * Result of the password step. If the account has an authenticator app
 * enabled, the backend answers with a challenge instead of a session and the
 * client continues at /verify.
 */
export type LoginResult =
  | { status: 'authenticated'; user: User }
  | { status: 'mfa_required'; challengeId: string }

// POST /auth/verify-mfa  →  User
export interface VerifyMfaRequest {
  challengeId: string
  code: string
}
