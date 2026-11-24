/**
 * Auth API contract. These are DEFAULTS: edit them to match the backend and
 * the rest of the frontend follows. See docs/API.md.
 */

export interface User {
  id: string
  username: string
}

// POST /auth/register  →  RegisterResponse
export interface RegisterPayload {
  username: string
  password: string
}

/**
 * Sign-up doesn't create the account or a session. The backend validates the
 * details, holds them in a pending challenge, and returns the authenticator-app
 * key. The account is created when /auth/verify-mfa confirms a code for
 * `challengeId`. The client builds the otpauth:// URI and QR code from `secret`.
 */
export interface RegisterResponse {
  challengeId: string
  /** Base32-encoded shared key, no spaces or padding. */
  secret: string
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

// POST /auth/verify-mfa  →  User (and the session cookie)
// Completes either challenge: a login, or a pending sign-up (which also
// creates the account).
export interface VerifyMfaRequest {
  challengeId: string
  code: string
}
