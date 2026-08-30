import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Body,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import {
  LoginInputSchema,
  SignupInputSchema,
  type LoginInput,
  type SessionDto,
  type SignupInput,
  type UserDto,
} from '@sagecards/shared-types'
import { toFetchHeaders } from './headers.js'
import { AuthService } from './auth.service.js'
import { ZodValidationPipe } from './zod-validation.pipe.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(SignupInputSchema)) body: SignupInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: UserDto }> {
    const { user, setCookie } = await this.auth.signUp(body)
    applyCookies(res, setCookie)
    return { user }
  }

  @Post('signin')
  async signin(
    @Body(new ZodValidationPipe(LoginInputSchema)) body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ session: SessionDto }> {
    const { session, setCookie } = await this.auth.signIn(body)
    applyCookies(res, setCookie)
    return { session }
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const { setCookie } = await this.auth.signOut(toFetchHeaders(req.headers))
    applyCookies(res, setCookie)
    return { success: true }
  }

  @Get('me')
  async me(@Req() req: Request): Promise<SessionDto> {
    const session = await this.auth.me(toFetchHeaders(req.headers))
    if (!session) throw new UnauthorizedException()
    return session
  }

  @Get('google')
  async google(@Res() res: Response): Promise<void> {
    // The browser lands back on the API's Better-Auth OAuth callback (derived
    // from the configured baseURL), which issues the session cookie — the web
    // BFF relays it in a later phase.
    const { url, setCookie } = await this.auth.googleRedirectUrl()
    applyCookies(res, setCookie)
    res.redirect(HttpStatus.FOUND, url)
  }
}

function applyCookies(res: Response, cookies: string[]): void {
  for (const cookie of cookies) res.append('Set-Cookie', cookie)
}
