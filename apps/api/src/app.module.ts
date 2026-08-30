import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { HealthModule } from './health/health.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Phase 1-A: MongoDB wiring. URI from DATABASE_URL; missing config fails
    // loudly at boot (getOrThrow). The short server-selection timeout + bounded
    // retry loop make an unreachable DB fail loudly at boot (~15s) instead of
    // retrying silently for minutes. No process.exit on connection errors —
    // post-boot transient errors should let mongoose self-heal/reconnect.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DATABASE_URL'),
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),
    HealthModule,
  ],
})
export class AppModule {}
