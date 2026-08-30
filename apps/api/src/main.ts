import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module.js'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Raw bodies are needed so the Better-Auth handler route still sees POST
    // bodies after Nest's JSON parser consumed the stream.
    rawBody: true,
  })
  app.enableShutdownHooks()

  const port = Number(process.env['PORT'] ?? 3000)
  await app.listen(port)
}

void bootstrap()
