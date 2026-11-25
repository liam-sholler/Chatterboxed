import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { authApi } from '@/features/auth/api'
import { authStore } from '@/features/auth/auth-store'
import { PASSWORD_MIN, registerSchema, type RegisterValues } from '@/features/auth/schemas'

interface RegisterFormProps {
  onRegistered: () => void
}

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(values: RegisterValues) {
    setServerError(null)
    try {
      const { challengeId, secret } = await authApi.register(values)
      authStore.setPendingEnrollment(challengeId, {
        secret,
        accountName: values.username,
      })
      onRegistered()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError('username', { message: error.message }, { shouldFocus: true })
        return
      }
      setServerError(error instanceof Error ? error.message : 'Something went wrong. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={errors.username ? true : undefined}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? 'username-error' : undefined}
            {...register('username')}
          />
          <FieldError id="username-error" errors={[errors.username]} />
        </Field>

        <Field data-invalid={errors.password ? true : undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? true : undefined}
            {...register('password')}
          />
          <FieldDescription>At least {PASSWORD_MIN} characters.</FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        {serverError && <FieldError>{serverError}</FieldError>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </FieldGroup>
    </form>
  )
}
