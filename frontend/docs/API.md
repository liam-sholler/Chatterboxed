# Config and API client

## Constants: `src/lib/config.ts`

All shared constants live here. Import them instead of repeating literals.

| Constant | Default | Purpose |
|---|---|---|
| `APP_NAME` | `Chatterboxed` | Product name for UI copy |
| `SERVER_PROTOCOL` | `http` | Backend protocol |
| `SERVER_HOST` | `localhost` | Backend host |
| `SHARED_SERVER_PORT` | `9943` | Backend port (empty = no explicit port) |
| `API_BASE_URL` | `http://localhost:9943` | Built from the three above |
| `API_TIMEOUT_MS` | `10000` | Per-request timeout |
| `API_PATHS` | see file | Every backend endpoint the frontend calls |

### Overriding the server

Copy `.env.example` to `.env.local` (git-ignored, keep in repository root) and edit:

```
VITE_SERVER_PROTOCOL=http
VITE_SERVER_HOST=localhost
SHARED_SERVER_PORT=8080
```

Restart `npm run dev` after changing it. For a production host on the default
port, set `SHARED_SERVER_PORT=` (empty) so no port is appended.

## API client: `src/lib/api.ts`

A thin wrapper over `fetch`:

```ts
import { api } from '@/lib/api'
import { API_PATHS } from '@/lib/config'

const user = await api.post<User>(API_PATHS.auth.register, { username, password })
```

- Methods: `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete`. Each takes a path, a body where it makes sense, and optional `{ headers, signal }`.
- Sends and receives JSON, with `credentials: 'include'` so the backend's session cookie works.
- Times out after `API_TIMEOUT_MS`. Pass your own `signal` to cancel; a cancelled request rethrows the abort.
- Any failure throws `ApiError` with `status` (0 for network or timeout), `body`, and a `message` that is safe to show. The message comes from the body's `message` field when present.

Feature code should not call `api` from components. Wrap it in a feature module
like `features/auth/api.ts` so endpoints and shapes stay in one place.

## Auth contract (defaults)

Shapes live in `src/features/auth/types.ts`. Edit them there to match the backend.

| Endpoint | Request | Response |
|---|---|---|
| `POST /auth/register` | `{ username, password }` | `{ challengeId, secret }`, or an error status with `{ message }` |
| `POST /auth/login` | `{ username, password }` | `{ status: 'mfa_required', challengeId }` (or `{ status: 'authenticated', user }`) |
| `POST /auth/verify-mfa` | `{ challengeId, code }` | `User` (and the session cookie) |

### Sign-up flow

1. `/register` posts `{ username, password }`. The backend validates but does not
   create the account. It holds the details (password already hashed) and the
   new key in a pending challenge and returns `{ challengeId, secret }`.
2. `/totp-setup` shows the key and QR code. Both come from the register response
   and live in memory only, so a refresh sends the user back to `/register`.
3. `/verify` posts `{ challengeId, code }` to `/auth/verify-mfa`. On success the
   backend creates the account, starts the session, and returns the `User`.

`secret` must be plain base32: uppercase `A-Z` and `2-7`, no spaces and no `=`
padding. The page adds the spacing for display, and the `otpauth://` URI for the
QR code is built in the browser from it.

### Login flow

1. `/login` posts `{ username, password }`. The backend validates and answers
   `{ status: 'mfa_required', challengeId }`.
2. `/verify` posts `{ challengeId, code }` to the same `/auth/verify-mfa`, which
   starts the session and returns the `User`.

`/auth/verify-mfa` completes both kinds of challenge; the backend knows which
from the `challengeId`.

### Backend expectations

- Errors: a 4xx status with a `{ message }` body that is safe to show (the client
  displays it as is). Use 409 for a taken username and 400/422 for validation.
- Check username availability at register, and again when the account is
  created at verify, since nothing is reserved in between.
- Challenges should be single-use, expire (a few minutes), and limit wrong
  codes. An expired or unknown challenge should say so in `message` so the user
  knows to start over.
- Never return the password or its hash.

`User` is `{ id, username }`.

### Open items

- **Session restore:** there is no "who am I" endpoint, so `authApi.getSession` returns `null` and a refresh signs the user out in the UI.
- **Logout:** no endpoint, so `authApi.logout` only clears local state.
- **CORS:** the backend must allow the frontend origin (Vite dev default `http://localhost:5173`) with credentials enabled, since requests are cross-origin and use cookies.
