import { createFileRoute, redirect } from '@tanstack/react-router'
import { TotpSetup } from '@/components/auth/totp-setup'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Shared-key step of sign-up. The account doesn't exist yet: the key comes from
// the register response and is held in memory only. The code-entry step
// (/verify) is what confirms it and creates the account.
export const Route = createFileRoute('/_auth/totp-setup')({
  // Only reachable mid-sign-up. A refresh drops the in-memory key, so the user
  // starts over at /register.
  beforeLoad: ({ context, search }) => {
    const { pendingEnrollment, pendingChallengeId } = context.auth.getState()
    if (!pendingEnrollment || !pendingChallengeId) {
      throw redirect({ to: '/register', search: { redirect: search.redirect } })
    }
    return { enrollment: pendingEnrollment }
  },
  component: TotpSetupPage,
})

function TotpSetupPage() {
  const navigate = Route.useNavigate()
  const { enrollment } = Route.useRouteContext()
  const { redirect: redirectTo } = Route.useSearch()

  return (
    <>
      <CardHeader>
        <CardTitle>Set up your authenticator app</CardTitle>
        <CardDescription>
          Scan the QR code with an authenticator app, like Google Authenticator
          or 1Password. Next, you’ll enter a code from it to finish creating
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TotpSetup
          secret={enrollment.secret}
          accountName={enrollment.accountName}
          onContinue={() =>
            void navigate({ to: '/verify', search: { redirect: redirectTo } })
          }
        />
      </CardContent>
    </>
  )
}
