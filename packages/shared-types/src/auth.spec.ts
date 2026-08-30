import type { UserDto, SessionDto } from './auth.js'
import { SignupInputSchema, LoginInputSchema, UserDtoSchema, SessionDtoSchema } from './auth.js'
import { describe, expect, it } from 'vitest'

const user: UserDto = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  emailVerified: true,
  image: null,
  createdAt: '2026-08-30T00:00:00.000Z',
  updatedAt: '2026-08-30T00:00:00.000Z',
}

describe('auth contract', () => {
  it('SignupInputSchema accepts a valid signup body', () => {
    expect(
      SignupInputSchema.parse({ email: 'a@b.com', name: 'A B', password: 'longenough1' }),
    ).toBeDefined()
  })

  it('SignupInputSchema rejects short passwords and bad emails', () => {
    expect(() =>
      SignupInputSchema.parse({ email: 'a@b.com', name: 'A B', password: 'short' }),
    ).toThrow()
    expect(() =>
      SignupInputSchema.parse({ email: 'not-an-email', name: 'A B', password: 'longenough1' }),
    ).toThrow()
  })

  it('LoginInputSchema accepts a valid login body', () => {
    expect(LoginInputSchema.parse({ email: 'a@b.com', password: 'whatever' })).toBeDefined()
  })

  it('UserDtoSchema round-trips a user', () => {
    expect(UserDtoSchema.parse(user)).toEqual(user)
  })

  it('SessionDtoSchema rejects a session with invalid user', () => {
    const session: SessionDto = { sessionId: 's1', expiresAt: '2026-09-30T00:00:00.000Z', user }
    expect(SessionDtoSchema.parse(session)).toEqual(session)
    expect(() => SessionDtoSchema.parse({ ...session, user: { ...user, email: 'nope' } })).toThrow()
  })
})
