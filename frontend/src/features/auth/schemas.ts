import { z } from 'zod'

// Keep these rules in sync with the backend's validation.
export const USERNAME_MIN = 3
export const USERNAME_MAX = 10
export const PASSWORD_MIN = 12

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().trim().min(1, 'Enter your password'),
})

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN, `Use at least ${USERNAME_MIN} characters`)
    .max(USERNAME_MAX, `Use at most ${USERNAME_MAX} characters`)
    .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscores only'),
  password: z.string().trim().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters (excluding surrounding whitespace)`),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
