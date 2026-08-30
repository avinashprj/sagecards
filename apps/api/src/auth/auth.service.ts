import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { isAPIError } from 'better-auth/api'
import type { LoginInput, SessionDto, SignupInput, UserDto } from '@sagecards/shared-types'
import { AUTH, type Auth } from './auth.factory.js'
import { toSessionDto, toUserDto } from './auth.mappers.js'
import { isSignUpEmailResult } from './auth.types.js'

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  async signUp(input: SignupInput): Promise<{ user: UserDto; setCookie: string[] }> {
    try {
      const { response, headers } = await this.auth.api.signUpEmail({
        body: input,
        returnHeaders: true,
      })
      // better-call's response type is too tangled for TS to resolve; verify
      // the documented runtime shape instead of casting it.
      if (!isSignUpEmailResult(response)) {
        throw new HttpException(
          'Unexpected Better-Auth sign-up payload',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      return { user: toUserDto(response.user), setCookie: headers.getSetCookie() }
    } catch (error) {
      this.rethrow(error)
    }
  }

  async signIn(input: LoginInput): Promise<{ session: SessionDto; setCookie: string[] }> {
    try {
      const { headers } = await this.auth.api.signInEmail({
        body: input,
        returnHeaders: true,
      })
      // signInEmail returns only the token; re-read the session for its real
      // expiry by presenting the just-issued cookie back as a request cookie.
      const session = await this.auth.api.getSession({
        headers: new Headers({ cookie: headers.getSetCookie().join('; ') }),
      })
      if (!session) {
        throw new HttpException('Session not found after sign-in', HttpStatus.INTERNAL_SERVER_ERROR)
      }
      return {
        session: toSessionDto(session.session, session.user),
        setCookie: headers.getSetCookie(),
      }
    } catch (error) {
      this.rethrow(error)
    }
  }

  async signOut(headers: Headers): Promise<{ setCookie: string[] }> {
    try {
      const { headers: resHeaders } = await this.auth.api.signOut({ headers, returnHeaders: true })
      return { setCookie: resHeaders.getSetCookie() }
    } catch (error) {
      this.rethrow(error)
    }
  }

  /** Null when no valid session cookie was presented. */
  async me(headers: Headers): Promise<SessionDto | null> {
    const result = await this.auth.api.getSession({ headers })
    if (!result) return null
    return toSessionDto(result.session, result.user)
  }

  async googleRedirectUrl(): Promise<{ url: string; setCookie: string[] }> {
    try {
      const { response, headers } = await this.auth.api.signInSocial({
        body: { provider: 'google' },
        returnHeaders: true,
      })
      // The state cookie lives in the response headers — it must reach the
      // browser or the callback's state check will fail.
      if ('user' in response || !response.url) {
        throw new HttpException(
          'Google sign-in did not produce a redirect URL',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      return { url: response.url, setCookie: headers.getSetCookie() }
    } catch (error) {
      this.rethrow(error)
    }
  }

  // Better-Auth errors carry HTTP statuses (as a code or a status name like
  // "UNAUTHORIZED"); surface them as-is so clients see 401 on bad credentials
  // and 422 on duplicate signup instead of a generic 500.
  private rethrow(error: unknown): never {
    if (isAPIError(error)) {
      const status =
        typeof error.status === 'number'
          ? error.status
          : (HttpStatus[error.status as keyof typeof HttpStatus] ??
            HttpStatus.INTERNAL_SERVER_ERROR)
      throw new HttpException({ message: error.message }, status)
    }
    throw error
  }
}
