import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

// Protected layout: everything under here requires a session.
export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.getState().user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Outlet,
})
