import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { APP_NAME } from '@/lib/config'
import { AuthBackdrop } from '@/components/auth/auth-backdrop'
import { safeRedirect } from '@/features/auth/safe-redirect'

// Public-only layout: signed-in users are sent to the app.
export const Route = createFileRoute('/_auth')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: safeRedirect(search.redirect),
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.getState().user) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="relative isolate min-h-svh overflow-hidden">
      <AuthBackdrop />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
        <span className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <img src="/chatterbot.svg" alt="" className="h-8 w-auto" />
          {APP_NAME}
        </span>
        <Card className="w-full max-w-sm">
          <Outlet />
        </Card>
      </main>
    </div>
  )
}
