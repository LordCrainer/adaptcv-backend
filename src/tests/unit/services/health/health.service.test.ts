import mongoose from 'mongoose'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import { HealthService } from '@src/api/Health/health.service'
import { redisClient } from '@src/config/cache/redis'

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    connection: {
      readyState: 1
    }
  }
}))

// Mock redisClient
vi.mock('@src/config/cache/redis', () => ({
  redisClient: {
    ping: vi.fn()
  }
}))

describe('HealthService', () => {
  let healthService: HealthService

  beforeEach(() => {
    healthService = new HealthService()
    vi.clearAllMocks()
  })

  describe('checkHealth', () => {
    it('should return ok status when all services are healthy', async () => {
      // Mock Redis ping to resolve
      ;(redisClient.ping as Mock).mockResolvedValue('PONG')

      const result = await healthService.checkHealth()

      expect(result.status).toBe('ok')
      expect(result.services.database).toBe('ok')
      expect(result.services.redis).toBe('ok')
      expect(result.timestamp).toBeDefined()
    })

    it('should return error status when database is not connected', async () => {
      // Mock mongoose connection as disconnected
      ;(mongoose.connection.readyState as any) = 0
      ;(redisClient.ping as Mock).mockResolvedValue('PONG')

      const result = await healthService.checkHealth()

      expect(result.status).toBe('error')
      expect(result.services.database).toBe('error')
      expect(result.services.redis).toBe('ok')
    })

    it('should return error status when redis ping fails', async () => {
      ;(mongoose.connection.readyState as any) = 1
      ;(redisClient.ping as Mock).mockRejectedValue(new Error('Redis error'))

      const result = await healthService.checkHealth()

      expect(result.status).toBe('error')
      expect(result.services.database).toBe('ok')
      expect(result.services.redis).toBe('error')
    })

    it('should return error status when both services fail', async () => {
      ;(mongoose.connection.readyState as any) = 0
      ;(redisClient.ping as Mock).mockRejectedValue(new Error('Redis error'))

      const result = await healthService.checkHealth()

      expect(result.status).toBe('error')
      expect(result.services.database).toBe('error')
      expect(result.services.redis).toBe('error')
    })
  })
})
