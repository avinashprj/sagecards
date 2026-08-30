import { All, Controller, Inject, Req, Res } from '@nestjs/common'
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { AUTH, type Auth } from './auth.factory.js'
import { toFetchHeaders } from './headers.js'

/**
 * Delegates everything under /api/auth/* to Better-Auth's own handler —
 * that's where its OAuth callback route (/api/auth/callback/google) lives.
 * Auth JSON endpoints live in AuthController instead; only the OAuth
 * round-trip flows through here. Requires rawBody (see main.ts) so POSTs
 * still have their body after Nest's body parser consumed the stream.
 */
@Controller('api/auth')
export class BetterAuthHandlerController {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  @All('*splat')
  async handle(@Req() req: ExpressRequest, @Res() res: ExpressResponse): Promise<void> {
    const host = req.headers['host'] ?? 'localhost'
    const url = `${req.protocol}://${host}${req.originalUrl}`
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
    const request = new Request(url, {
      method: req.method,
      headers: toFetchHeaders(req.headers),
      ...(hasBody ? { body: (req as ExpressRequest & { rawBody?: Buffer }).rawBody ?? '' } : {}),
    })
    const response = await this.auth.handler(request)

    response.headers.forEach((value, name) => {
      // set-cookie needs per-cookie appends; headers.forEach collapses them.
      if (name !== 'set-cookie') res.setHeader(name, value)
    })
    for (const cookie of response.headers.getSetCookie()) {
      res.append('Set-Cookie', cookie)
    }
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()))
  }
}
