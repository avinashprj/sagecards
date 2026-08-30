import { getConnectionToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import type { Connection } from 'mongoose'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppModule } from './app.module.js'

describe('AppModule MongoDB wiring', () => {
  let mongo: MongoMemoryServer
  const originalDbUrl = process.env['DATABASE_URL']

  beforeEach(async () => {
    // mongodb-memory-server boots a real mongod; give it a generous budget so a
    // slow binary spawn under turbo's parallel build doesn't flake the timeout.
    mongo = await MongoMemoryServer.create()
    process.env['DATABASE_URL'] = mongo.getUri()
  }, 60_000)

  afterEach(async () => {
    if (originalDbUrl === undefined) delete process.env['DATABASE_URL']
    else process.env['DATABASE_URL'] = originalDbUrl
    await mongo.stop()
  })

  it('boots and connects to MongoDB', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    const app = moduleRef.createNestApplication()
    await app.init()

    const connection = app.get<Connection>(getConnectionToken())
    expect(connection.readyState).toBe(1)

    await app.close()
  })

  it('fails loudly at boot if DATABASE_URL is missing', async () => {
    delete process.env['DATABASE_URL']

    await expect(Test.createTestingModule({ imports: [AppModule] }).compile()).rejects.toThrow(
      /DATABASE_URL/,
    )
  })

  it('fails loudly at boot when the database is unreachable', async () => {
    // Unusable port => immediate ECONNREFUSED; with bounded retries the compile
    // should reject rather than hang. 127.0.0.1:1 is never a real mongo.
    process.env['DATABASE_URL'] = 'mongodb://127.0.0.1:1/sagecards'

    await expect(Test.createTestingModule({ imports: [AppModule] }).compile()).rejects.toThrow()
  }, 60_000)
})
