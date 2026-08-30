import { z } from 'zod'

/**
 * Auth contract shared between the API (/auth/*) and clients.
 * Single source of truth — the API validates request bodies against the input
 * schemas; clients type against the inferred types. DTO shapes mirror what
 * Better-Auth returns, with dates serialized as ISO strings on the wire.
 */

export const SignupInputSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(50),
  // 8..72: bcrypt-compatible ceiling; Better-Auth hashes before storage.
  password: z.string().min(8).max(72),
})

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const UserDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const SessionDtoSchema = z.object({
  sessionId: z.string(),
  expiresAt: z.string().datetime(),
  user: UserDtoSchema,
})

export type SignupInput = z.infer<typeof SignupInputSchema>
export type LoginInput = z.infer<typeof LoginInputSchema>
export type UserDto = z.infer<typeof UserDtoSchema>
export type SessionDto = z.infer<typeof SessionDtoSchema>
