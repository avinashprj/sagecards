import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getConnectionToken } from '@nestjs/mongoose'
import type { Connection } from 'mongoose'
import { AUTH, createAuth } from './auth.factory.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { BetterAuthHandlerController } from './better-auth.handler.controller.js'

@Module({
  controllers: [AuthController, BetterAuthHandlerController],
  providers: [
    AuthService,
    {
      provide: AUTH,
      inject: [getConnectionToken(), ConfigService],
      useFactory: (connection: Connection, config: ConfigService) => {
        const db = connection.db
        if (!db) throw new Error('Mongoose connection has no database handle for Better-Auth')
        return createAuth(db, {
          secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),
          baseURL: config.getOrThrow<string>('BETTER_AUTH_URL'),
          google: {
            clientId: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
          },
        })
      },
    },
  ],
})
export class AuthModule {}
