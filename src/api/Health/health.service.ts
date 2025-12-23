import mongoose from 'mongoose'

import { redisClient } from '@src/config/cache/redis'

export class HealthService {
  async checkHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        redis: 'unknown'
      }
    }

    try {
      // Check MongoDB
      if (mongoose.connection.readyState === 1) {
        health.services.database = 'ok'
      } else {
        health.services.database = 'error'
        health.status = 'error'
      }
    } catch (error) {
      health.services.database = 'error'
      health.status = 'error'
    }

    try {
      // Check Redis
      if (redisClient) {
        await redisClient.ping()
        health.services.redis = 'ok'
      } else {
        health.services.redis = 'error'
        health.status = 'error'
      }
    } catch (error) {
      health.services.redis = 'error'
      health.status = 'error'
    }

    return health
  }
}