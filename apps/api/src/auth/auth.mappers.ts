import type { SessionDto, UserDto } from '@sagecards/shared-types'
import type { AuthSession, SessionUser } from './auth.types.js'

/** Maps Better-Auth's internal user/session shapes onto the shared contract. */

export function toSessionDto(session: AuthSession, user: SessionUser): SessionDto {
  return {
    sessionId: session.id,
    expiresAt: toIso(session.expiresAt),
    user: toUserDto(user),
  }
}

export function toUserDto(user: SessionUser): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  }
}

/** JSON has no Date type; everything crossing the wire is an ISO string. */
function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}
