import { Controller, Get } from '@nestjs/common'

export interface HealthResponse {
  status: 'ok'
  timestamp: string
  version: string
}

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? 'dev',
    }
  }
}
