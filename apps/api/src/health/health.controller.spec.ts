import { describe, expect, it } from 'vitest'
import { HealthController } from './health.controller.js'

describe('HealthController', () => {
  it('reports ok with a parseable timestamp', () => {
    const controller = new HealthController()
    const res = controller.check()
    expect(res.status).toBe('ok')
    expect(res.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
