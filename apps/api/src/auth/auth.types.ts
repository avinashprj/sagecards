/**
 * Minimal shapes of Better-Auth's API payloads as they arrive at runtime.
 * better-call (Better-Auth's HTTP layer) has generics TypeScript cannot
 * resolve, so these describe the actual wire shapes instead of inferring them.
 */

/** Better-Auth's user as returned by its API (dates as Date, image optional). */
export interface SessionUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null | undefined
  createdAt: Date | string
  updatedAt: Date | string
}

/** Better-Auth's session record (subset used for SessionDto). */
export interface AuthSession {
  id: string
  expiresAt: Date | string
}

/** Runtime payload of auth.api.signUpEmail (typed by us, not better-call). */
export interface SignUpEmailResult {
  user: SessionUser
}

/** Runtime guard instead of a cast: fails loudly if Better-Auth changes shape. */
export function isSignUpEmailResult(value: unknown): value is SignUpEmailResult {
  return typeof value === 'object' && value !== null && 'user' in value
}
