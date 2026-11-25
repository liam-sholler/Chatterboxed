import { http, HttpResponse } from 'msw'
import { API_BASE_URL, API_PATHS } from '@/lib/config'

// Shapes mirror backend/src/main/kotlin/routing (RegisterResponse, ApiError) and AuthService.
export const url = (path: string) => `${API_BASE_URL}${path}`

export const CHALLENGE_ID = 'challenge-123'
export const SECRET = 'JBSWY3DPEHPK3PXP'
export const VALID_CODE = '123456'

export const apiError = (code: string, message: string, status: number) =>
  HttpResponse.json({ code, message }, { status })

export const handlers = [
  http.post(url(API_PATHS.auth.register), () =>
    HttpResponse.json({ challengeId: CHALLENGE_ID, secret: SECRET }),
  ),
  http.post(url(API_PATHS.auth.verifyMfa), async ({ request }) => {
    const { challengeId, code } = (await request.json()) as { challengeId: string; code: string }
    if (challengeId !== CHALLENGE_ID) {
      return apiError('REGISTRATION_EXPIRED', 'Registration timed out. Please log in or create your account again.', 401)
    }
    if (code !== VALID_CODE) {
      return apiError('INVALID_MFA_CODE', 'MFA is invalid or code expired.', 401)
    }
    // AuthService currently answers `call.respond(OK, "LGTM")`: plain text, not a User.
    return HttpResponse.text('LGTM')
  }),
]
