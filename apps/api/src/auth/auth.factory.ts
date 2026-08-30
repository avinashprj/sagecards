import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import type { Connection } from 'mongoose'

/** Mongoose's raw mongodb-driver handle; Better-Auth stores user/session/account collections there. */
export type AuthDb = NonNullable<Connection['db']>

export interface AuthFactoryConfig {
  secret: string
  baseURL: string
  google: { clientId: string; clientSecret: string }
}

/**
 * Builds the Better-Auth server instance on top of the shared Mongoose
 * connection. Password hashing is Better-Auth's (scrypt); the password is
 * never returned by its API and never logged here.
 */
export function createAuth(db: AuthDb, config: AuthFactoryConfig) {
  return betterAuth({
    secret: config.secret,
    baseURL: config.baseURL,
    database: mongodbAdapter(db),
    emailAndPassword: { enabled: true },
    // Locked design (ADR-000-008): Google links to an existing password user
    // when the email matches, so Google doubles as the password-recovery path.
    // Password users are never email-verified (verification is deferred), so
    // the default local-verified check has to go.
    account: {
      accountLinking: {
        trustedProviders: ['google'],
        requireLocalEmailVerified: false,
        // ADR-000-008: Google imports name + photo onto the user on link.
        updateUserInfoOnLink: true,
      },
    },
    socialProviders: {
      google: { clientId: config.google.clientId, clientSecret: config.google.clientSecret },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>

/** DI token for the Better-Auth instance. */
export const AUTH = Symbol('AUTH')
