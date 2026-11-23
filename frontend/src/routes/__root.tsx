import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthStore } from '@/features/auth/auth-store'

interface RouterContext {
  auth: AuthStore
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Restore any existing session once, before any guard runs.
  beforeLoad: async ({ context }) => {
    await context.auth.bootstrap()
  },
  component: Outlet,
})
