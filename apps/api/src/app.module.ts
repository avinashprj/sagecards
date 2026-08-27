import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthModule } from './health/health.module.js'

// ponytail: MongoDB wiring (MongooseModule.forRootAsync) intentionally lands in Phase 1 —
// it needs a live Atlas URI, and the Phase 0 health shell must boot without a database.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule],
})
export class AppModule {}
