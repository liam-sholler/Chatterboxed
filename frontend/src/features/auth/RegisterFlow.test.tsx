import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { API_PATHS } from '@/lib/config'
import { routeTree } from '@/routeTree.gen'
import { apiError, SECRET, url, VALID_CODE } from '@/test/handlers'
import { server } from '@/test/setup'
import { authStore } from './auth-store'

const USERNAME = 'alice_01'
const PASSWORD = 'correct horse battery'

async function renderApp() {
  const router = createRouter({
    routeTree,
    context: { auth: authStore },
    history: createMemoryHistory({ initialEntries: ['/register'] }),
  })
  await router.load() // routes are code-split; resolve the first chunk before rendering
  render(<RouterProvider router={router} />)
  return userEvent.setup()
}

async function fillRegister(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Username'), USERNAME)
  await user.type(screen.getByLabelText('Password'), PASSWORD)
}

async function registerAndReachCode(user: ReturnType<typeof userEvent.setup>) {
  await fillRegister(user)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  await user.click(await screen.findByRole('button', { name: 'Continue' }))
  return screen.findByLabelText('6-digit authentication code')
}

// authStore is a module singleton; don't let one test's session leak into the next.
afterEach(() => authStore.signOut())

describe('register + MFA flow', () => {
  it('happy path: register, see the key, enter the code, land signed in', async () => {
    const user = await renderApp()
    await fillRegister(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('img', { name: /qr code/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Setup key')).toHaveTextContent(SECRET.match(/.{4}/g)!.join(' '))

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.type(await screen.findByLabelText('6-digit authentication code'), VALID_CODE)

    expect(await screen.findByRole('heading', { name: /signed in as/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('expired challenge: shows a start-over message and lets the user restart', async () => {
    server.use(
      http.post(url(API_PATHS.auth.verifyMfa), () =>
        apiError('REGISTRATION_EXPIRED', 'Registration timed out. Please log in or create your account again.', 401),
      ),
    )
    const user = await renderApp()
    const codeInput = await registerAndReachCode(user)
    await user.type(codeInput, VALID_CODE)

    expect(await screen.findByRole('alert')).toHaveTextContent(/timed out.*create your account again/i)
    expect(codeInput).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(await screen.findByText('Create your account')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
  })

  it('wrong code: shows an error, keeps the input usable, and a retry succeeds', async () => {
    const user = await renderApp()
    const codeInput = await registerAndReachCode(user)
    await user.type(codeInput, '000000')

    expect(await screen.findByRole('alert')).toHaveTextContent('MFA is invalid or code expired.')
    await waitFor(() => expect(codeInput).toBeEnabled())
    expect(codeInput).toHaveValue('')

    await user.type(codeInput, VALID_CODE)
    expect(await screen.findByRole('heading', { name: /signed in as/i })).toBeInTheDocument()
  })

  it('double-submit: button disables while pending and only one request is sent', async () => {
    let calls = 0
    server.use(
      http.post(url(API_PATHS.auth.register), async () => {
        calls++
        await delay(200)
        return HttpResponse.json({ challengeId: 'challenge-123', secret: SECRET })
      }),
    )
    const user = await renderApp()
    await fillRegister(user)
    const submit = screen.getByRole('button', { name: 'Create account' })
    await user.click(submit)
    await user.click(submit)

    expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled()
    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(calls).toBe(1)
  })

  it('username taken: 409 error is tied to the username field and values are kept', async () => {
    server.use(
      http.post(url(API_PATHS.auth.register), () =>
        apiError('USERNAME_TAKEN', 'Username is taken. Try another one.', 409),
      ),
    )
    const user = await renderApp()
    await fillRegister(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const username = screen.getByLabelText('Username')
    await waitFor(() => expect(username).toHaveAccessibleDescription('Username is taken. Try another one.'))
    expect(username).toHaveAttribute('aria-invalid', 'true')
    expect(username).toHaveValue(USERNAME)
    expect(screen.getByLabelText('Password')).toHaveValue(PASSWORD)
  })

  it('network failure: shows a generic error without crashing', async () => {
    server.use(http.post(url(API_PATHS.auth.register), () => HttpResponse.error()))
    const user = await renderApp()
    await fillRegister(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t reach the server/i)
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
    expect(screen.getByLabelText('Username')).toHaveValue(USERNAME)
  })
})
