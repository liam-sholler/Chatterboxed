import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RegisterForm } from '@/components/auth/register-form'

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const { redirect } = Route.useSearch()

  return (
    <>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Pick a username and a password to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm
          onRegistered={() => {
            if (redirect) router.history.push(redirect)
            else void navigate({ to: '/' })
          }}
        />
      </CardContent>
      <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
        Already have an account?
        <Link
          to="/login"
          search={{ redirect }}
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Sign in
        </Link>
      </CardFooter>
    </>
  )
}
