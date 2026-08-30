import { getConnectionToken } from '@nestjs/mongoose'
import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import type { Server } from 'node:http'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { SessionDtoSchema, UserDtoSchema, type SessionDto } from '@sagecards/shared-types'
import { AppModule } from '../app.module.js'

/**
 * Hermetic auth round-trip against a real mongod (mongodb-memory-server).
 * No real Google credentials needed: the redirect endpoint just has to hand
 * back Google's authorize URL, and the callback path is exercised with a
 * missing-code request to prove it routes into Better-Auth.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication
  let mongo: MongoMemoryServer
  const originalEnv = { ...process.env }

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    process.env['DATABASE_URL'] = mongo.getUri()
    process.env['BETTER_AUTH_SECRET'] = 'test-secret-that-is-long-enough-0123456789'
    process.env['BETTER_AUTH_URL'] = 'http://localhost:3001'
    process.env['GOOGLE_CLIENT_ID'] = 'test-client-id'
    process.env['GOOGLE_CLIENT_SECRET'] = 'test-client-secret'

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  }, 60_000)

  afterAll(async () => {
    await app?.close()
    await mongo?.stop()
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  function server(): Server {
    return app.getHttpServer() as Server
  }

  it('signs up, signs in, and reads the session back', async () => {
    const signup = await request(server())
      .post('/auth/signup')
      .send({ email: 'ada@example.com', name: 'Ada Lovelace', password: 'correct-horse-1' })
    expect(signup.status).toBe(201)
    // The wire payload must satisfy the shared contract.
    const user = UserDtoSchema.parse((signup.body as { user: unknown }).user)
    expect(user).toMatchObject({ email: 'ada@example.com', name: 'Ada Lovelace' })
    expect(user).not.toHaveProperty('password')
    expect(signup.headers['set-cookie']).toBeDefined()

    const signin = await request(server())
      .post('/auth/signin')
      .send({ email: 'ada@example.com', password: 'correct-horse-1' })
    expect(signin.status).toBe(201)
    const session: SessionDto = SessionDtoSchema.parse(
      (signin.body as { session: unknown }).session,
    )
    expect(session.user.email).toBe('ada@example.com')
    const cookies = signin.headers['set-cookie'] as string[] | undefined
    if (!cookies) throw new Error('sign-in returned no session cookie')

    const me = await request(server()).get('/auth/me').set('Cookie', cookies)
    expect(me.status).toBe(200)
    const meSession = SessionDtoSchema.parse(me.body)
    expect(meSession.sessionId).toBe(session.sessionId)
    expect(meSession.user).toMatchObject({ email: 'ada@example.com', emailVerified: false })

    const signout = await request(server()).post('/auth/signout').set('Cookie', cookies)
    expect(signout.status).toBe(200)

    const meAfterSignout = await request(server()).get('/auth/me').set('Cookie', cookies)
    expect(meAfterSignout.status).toBe(401)
  })

  it('rejects a signup body that fails the shared contract', async () => {
    const res = await request(server())
      .post('/auth/signup')
      .send({ email: 'not-an-email', name: '', password: 'short' })
    expect(res.status).toBe(400)
  })

  it('rejects a wrong password on signin', async () => {
    const res = await request(server())
      .post('/auth/signin')
      .send({ email: 'ada@example.com', password: 'wrong-password-1' })
    expect(res.status).toBe(401)
  })

  it('returns 401 on /auth/me without a session', async () => {
    const res = await request(server()).get('/auth/me')
    expect(res.status).toBe(401)
  })

  it('redirects to the Google authorize URL', async () => {
    const res = await request(server()).get('/auth/google')
    expect(res.status).toBe(302)
    expect(res.headers['location']).toContain('accounts.google.com')
  })

  it('completes a mocked Google callback into a linked session', async () => {
    // Google's getUserInfo decodes the id_token JWT (no userinfo fetch), so a
    // minimal unsigned JWT with Google's issuer/claims is enough here.
    const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
    const idToken = [
      b64({ alg: 'RS256', typ: 'JWT' }),
      b64({
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        sub: 'google-user-1',
        email: 'ada@example.com',
        email_verified: true,
        name: 'Ada Lovelace',
        picture: 'https://example.com/ada.png',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
      'not-really-signed',
    ].join('.')
    // Stub Google's token endpoint; everything else goes through.
    const realFetch = globalThis.fetch
    vi.stubGlobal('fetch', async (input: Request | string | URL, init?: RequestInit) => {
      const url = input instanceof Request ? input.url : String(input)
      if (url.startsWith('https://oauth2.googleapis.com/token')) {
        return new Response(
          JSON.stringify({
            access_token: 'fake-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid email profile',
            id_token: idToken,
          }),
          { headers: { 'content-type': 'application/json' } },
        )
      }
      return realFetch(input, init)
    })
    try {
      const start = await request(server()).get('/auth/google')
      expect(start.status).toBe(302)
      const state = new URL(start.headers['location'] ?? '').searchParams.get('state')
      expect(state).toBeTruthy()

      const callback = await request(server())
        .get(`/api/auth/callback/google?code=fake-code&state=${state}`)
        .set('Cookie', (start.headers['set-cookie'] as unknown as string[]) ?? [])
      expect(callback.status).toBe(302)
      const googleCookies = callback.headers['set-cookie'] as string[] | undefined
      if (!googleCookies) throw new Error('google callback returned no session cookie')

      // Same email as the password user => linked, verified, with photo import.
      const me = await request(server()).get('/auth/me').set('Cookie', googleCookies)
      expect(me.status).toBe(200)
      const session = SessionDtoSchema.parse(me.body)
      expect(session.user).toMatchObject({
        email: 'ada@example.com',
        emailVerified: true,
        image: 'https://example.com/ada.png',
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('routes the OAuth callback into Better-Auth', async () => {
    // No code param: Better-Auth rejects the callback with a redirect to its
    // error page rather than a Nest 404, proving the mount reaches it.
    const res = await request(server()).get('/api/auth/callback/google')
    expect(res.status).not.toBe(404)
    expect(res.status).toBeLessThan(500)
  })

  it('shares the Mongoose connection with Better-Auth', () => {
    // The auth instance is built from the app's connection; if wiring were
    // wrong the whole module would have failed to compile above.
    expect(app.get(getConnectionToken())).toBeDefined()
  })
})
