import { z } from 'zod'

/**
 * Health check contract shared between the API (/health) and consumers.
 * Single source of truth — the API validates against it; clients type against `HealthResponse`.
 */
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
  version: z.string(),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>
