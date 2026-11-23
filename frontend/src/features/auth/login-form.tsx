import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authApi } from './api'
import { authStore } from './auth-store'
import { loginSchema, type LoginValues } from './schemas'

interface LoginFormProps {
  onAuthenticated: () => void
  onMfaRequired: () => void
}

export function LoginForm({ onAuthenticated, onMfaRequired }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    try {
      const result = await authApi.login(values)
      if (result.status === 'mfa_required') {
        authStore.setPendingChallenge(result.challengeId)
        onMfaRequired()
      } else {
        authStore.setUser(result.user)
        onAuthenticated()
      }
    } catch (error) {
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
            {...register('username')}
          />
          <FieldError errors={[errors.username]} />
        </Field>

        <Field data-invalid={errors.password ? true : undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        {serverError && <FieldError>{serverError}</FieldError>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </FieldGroup>
    </form>
  )
}
