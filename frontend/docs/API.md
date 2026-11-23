# Config and API client

## Constants: `src/lib/config.ts`

All shared constants live here. Import them instead of repeating literals.

| Constant | Default | Purpose |
|---|---|---|
| `APP_NAME` | `Chatterboxed` | Product name for UI copy |
| `SERVER_PROTOCOL` | `http` | Backend protocol |
| `SERVER_HOST` | `localhost` | Backend host |
| `SERVER_PORT` | `8080` | Backend port (empty = no explicit port) |
| `API_BASE_URL` | `http://localhost:8080` | Built from the three above |
| `API_TIMEOUT_MS` | `10000` | Per-request timeout |
| `API_PATHS` | see file | Every backend endpoint the frontend calls |

### Overriding the server

Copy `.env.example` to `.env.local` (git-ignored) and edit:

```
VITE_SERVER_PROTOCOL=http
VITE_SERVER_HOST=localhost
VITE_SERVER_PORT=8080
```

Restart `npm run dev` after changing it. For a production host on the default
port, set `VITE_SERVER_PORT=` (empty) so no port is appended.

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
| `POST /auth/register` | `{ username, password }` | `User` (and the session cookie) |
| `POST /auth/login` | `{ username, password }` | `{ status: 'authenticated', user }` or `{ status: 'mfa_required', challengeId }` |
| `POST /auth/verify-mfa` | `{ challengeId, code }` | `User` (and the session cookie) |

`User` is `{ id, username }`.

### Open items

- **Session restore:** there is no "who am I" endpoint, so `authApi.getSession` returns `null` and a refresh signs the user out in the UI.
- **Logout:** no endpoint, so `authApi.logout` only clears local state.
- **CORS:** the backend must allow the frontend origin (Vite dev default `http://localhost:5173`) with credentials enabled, since requests are cross-origin and use cookies.
