import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authStore } from '@/features/auth/auth-store'
import { VerifyForm } from '@/components/auth/verify-form'

export const Route = createFileRoute('/_auth/verify')({
  // Only reachable mid-login. A refresh drops the in-memory challenge, so the
  // user starts over at /login.
  beforeLoad: ({ context, search }) => {
    const challengeId = context.auth.getState().pendingChallengeId
    if (!challengeId) {
      throw redirect({ to: '/login', search: { redirect: search.redirect } })
    }
    return { challengeId }
  },
  component: VerifyPage,
})

function VerifyPage() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const { challengeId } = Route.useRouteContext()
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <>
      <CardHeader>
        <CardTitle>Two-step verification</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyForm
          challengeId={challengeId}
          onVerified={() => {
            if (redirectTo) router.history.push(redirectTo)
            else void navigate({ to: '/' })
          }}
          onCancel={() => {
            authStore.setPendingChallenge(null)
            void navigate({ to: '/login', search: { redirect: redirectTo } })
          }}
        />
      </CardContent>
    </>
  )
}
