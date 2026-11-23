/**
 * Accepts only same-origin paths so `?redirect=` cannot be abused as an open
 * redirect (e.g. `//evil.com` or `https://evil.com`).
 */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return undefined
  }
  return value
}
