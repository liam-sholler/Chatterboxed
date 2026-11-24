import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useMemo, useState } from 'react'
import { encode } from 'uqr'
import { Button } from '@/components/ui/button'
import { buildOtpauthUri } from '@/features/auth/totp'

interface TotpSetupProps {
  /** The shared key from the backend (base32, no spaces). Placeholder until set. */
  secret?: string
  /** Label for the entry in the authenticator app, e.g. the username. */
  accountName: string
  onContinue: () => void
}

/** Groups the key into blocks of four so it is easier to read and type. */
function formatSecret(secret: string) {
  return secret.match(/.{1,4}/g)?.join(' ') ?? secret
}

/**
 * Draws the QR code as one SVG path, generated locally so the key never
 * leaves the browser. The 4-module border is the quiet zone scanners need.
 */
function QrCode({ value }: { value: string }) {
  const { size, path } = useMemo(() => {
    const { size, data } = encode(value, { ecc: 'M', border: 4 })
    let path = ''
    data.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) path += `M${x} ${y}h1v1h-1z`
      }),
    )
    return { size, path }
  }, [value])

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR code for your authenticator app"
      shapeRendering="crispEdges"
      className="size-full"
    >
      <path d={path} className="fill-black" />
    </svg>
  )
}

export function TotpSetup({ secret, accountName, onContinue }: TotpSetupProps) {
  const [copied, setCopied] = useState(false)

  const otpauthUri = useMemo(
    () => (secret ? buildOtpauthUri({ secret, accountName }) : null),
    [secret, accountName],
  )

  // Reset the "Copied" state after a moment so the button is reusable.
  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  async function copySecret() {
    if (!secret) return
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission).
      // The key is still shown and selectable, so there is nothing to recover.
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scanners need dark-on-light, so this tile stays white (and the
          modules black) in both themes; there is no semantic token for that. */}
      <div className="flex size-48 items-center justify-center rounded-2xl bg-white shadow-[0_0_20px_rgba(0,0,0,0.4)]">
        {otpauthUri ? (
          <QrCode value={otpauthUri} />
        ) : (
          <div
            role="status"
            aria-label="Generating QR code"
            className="size-full animate-pulse rounded-2xl bg-muted motion-reduce:animate-none"
          />
        )}
      </div>

      {/* The key, for people who can't scan the code. */}
      <div className="flex w-full flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Can’t scan? Enter this key instead.
        </p>
        <div className="flex w-full items-center gap-2 rounded-4xl border border-input bg-input/30 py-1 pr-1 pl-4">
          <code
            className="min-w-0 flex-1 text-center font-mono text-sm tracking-wider break-all select-all"
            aria-label="Setup key"
          >
            {secret ? formatSecret(secret) : '···· ···· ···· ····'}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={copySecret}
            disabled={!secret}
            aria-label={copied ? 'Key copied' : 'Copy key'}
          >
            <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={2} />
          </Button>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Key copied to clipboard' : ''}
        </span>
      </div>

      <Button type="button" className="w-full" onClick={onContinue} disabled={!secret}>
        Continue
      </Button>
    </div>
  )
}
