import { APP_NAME } from '@/lib/config'

interface OtpauthOptions {
  /** The shared key (base32). Treat as a secret: don't log it. */
  secret: string
  /** Shown next to the entry in the authenticator app, e.g. the username. */
  accountName: string
  issuer?: string
}

/**
 * Builds the `otpauth://` URI that authenticator apps read from a QR code.
 * Algorithm (SHA1) and period (30s) are left at the defaults every app
 * assumes; digits matches the 6-digit code the verify step asks for.
 */
export function buildOtpauthUri({
  secret,
  accountName,
  issuer = APP_NAME,
}: OtpauthOptions) {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`
  const params = new URLSearchParams({ secret, issuer, digits: '6' })
  return `otpauth://totp/${label}?${params.toString()}`
}
