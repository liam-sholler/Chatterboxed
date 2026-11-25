import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { authApi } from '@/features/auth/api'
import { authStore } from '@/features/auth/auth-store'

const CODE_LENGTH = 6

interface VerifyFormProps {
  challengeId: string
  onVerified: () => void
  onCancel: () => void
  cancelLabel?: string
}

export function VerifyForm({
  challengeId,
  onVerified,
  onCancel,
  cancelLabel = 'Use a different account',
}: VerifyFormProps) {
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function submit(value: string) {
    setPending(true)
    setServerError(null)
    try {
      const user = await authApi.verifyTotp(challengeId, value)
      authStore.setUser(user)
      onVerified()
    } catch (error) {
      setCode('')
      setServerError(error instanceof Error ? error.message : 'That code didn’t work. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP
        maxLength={CODE_LENGTH}
        pattern={REGEXP_ONLY_DIGITS}
        autoComplete="one-time-code"
        autoFocus
        value={code}
        onChange={setCode}
        onComplete={submit}
        disabled={pending}
        aria-label="6-digit authentication code"
      >
        <InputOTPGroup>
          {Array.from({ length: CODE_LENGTH }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {serverError && <FieldError>{serverError}</FieldError>}

      <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
        {cancelLabel}
      </Button>
    </div>
  )
}
