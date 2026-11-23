import { API_BASE_URL, API_TIMEOUT_MS } from './config'

/** Thrown for every failed request. `message` is safe to show to the user. */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Pulls a human-readable message out of a typical error body, e.g. { "message": "..." }.
function messageFrom(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown }
    if (typeof message === 'string' && message) return message
  }
  return typeof body === 'string' && body ? body : undefined
}

async function request<T>(
  method: Method,
  path: string,
  { body, headers, signal }: RequestOptions = {},
): Promise<T> {
  const timeout = AbortSignal.timeout(API_TIMEOUT_MS)
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      // Send and accept the backend's session cookie.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (error) {
    // The caller cancelled on purpose: let the abort propagate untouched.
    if (signal?.aborted) throw error
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new ApiError(
      timedOut
        ? 'The request timed out. Try again.'
        : 'Couldn’t reach the server. Check your connection and try again.',
      0,
    )
  }

  const data = await parseBody(response)
  if (!response.ok) {
    throw new ApiError(
      messageFrom(data) ?? `Request failed (${response.status}).`,
      response.status,
      data,
    )
  }
  return data as T
}

/** Lightweight JSON client. Paths come from `API_PATHS` in `config.ts`. */
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
}
