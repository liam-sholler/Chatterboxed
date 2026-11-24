import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const { redirect } = Route.useSearch()

  return (
    <>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to Chatterboxed.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm
          onAuthenticated={() => {
            if (redirect) router.history.push(redirect)
            else void navigate({ to: '/' })
          }}
          onMfaRequired={() => void navigate({ to: '/verify', search: { redirect } })}
        />
      </CardContent>
      <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
        New here?
        <Link
          to="/register"
          search={{ redirect }}
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Create an account
        </Link>
      </CardFooter>
    </>
  )
}
