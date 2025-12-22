import { HealthController } from './health.controller'
import { HealthService } from './health.service'

export const healthService = new HealthService()

export const healthController = new HealthController(healthService)