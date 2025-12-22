import ApiResponse from '@Shared/utils/apiResponse'

import { HealthService } from './health.service'

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  check: IController = async (req, res, next) => {
    try {
      const health = await this.healthService.checkHealth()
      new ApiResponse(res).setName('success').json({
        message: 'Health check completed',
        data: health
      })
    } catch (error) {
      next(error)
    }
  }
}