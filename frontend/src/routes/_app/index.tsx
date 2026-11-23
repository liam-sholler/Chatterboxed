import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { authStore, useAuth } from '@/features/auth/auth-store'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

// Placeholder until the chat UI exists.
function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await authStore.signOut()
    await navigate({ to: '/login' })
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Signed in as {user?.username}
      </h1>
      <p className="text-muted-foreground">The chat interface is coming next.</p>
      <Button variant="secondary" onClick={signOut}>
        Sign out
      </Button>
    </main>
  )
}
