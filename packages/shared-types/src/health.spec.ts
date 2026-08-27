import type { HealthResponse } from './health'
import { describe, expect, it } from 'vitest'
import { HealthResponseSchema } from './health'

describe('HealthResponseSchema', () => {
  it('parses a valid health payload', () => {
    const input = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    } satisfies HealthResponse

    const parsed = HealthResponseSchema.parse(input)
    expect(parsed.status).toBe('ok')
  })

  it('rejects a non-ok status', () => {
    expect(() =>
      HealthResponseSchema.parse({ status: 'degraded', timestamp: '', version: '0.1.0' }),
    ).toThrow()
  })
})
