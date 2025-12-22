import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import app from '@src/config/server'
import { dbStrategy } from '@src/config/db/dbStrategy'
import { redisConnection, closeRedisConnection } from '@src/config/cache/redis'
import currentEnv from '@src/config/environments'

const selectedDb = dbStrategy.mongoMemory

describe('Health Endpoint E2E Tests', () => {
  beforeAll(async () => {
    await selectedDb.connect('acv-health-test')
    await redisConnection(currentEnv.dataBase.redis.uri)
  })

  afterAll(async () => {
    await closeRedisConnection()
    await selectedDb.disconnect()
  })

  describe('GET /health', () => {
    it('should return 200 and healthy status when all services are connected', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('services')
      
      // Check MongoDB status
      expect(response.body.services).toHaveProperty('mongodb')
      expect(response.body.services.mongodb).toHaveProperty('status', 'connected')
      expect(response.body.services.mongodb).toHaveProperty('readyState', 1)
      
      // Check Redis status
      expect(response.body.services).toHaveProperty('redis')
      expect(response.body.services.redis).toHaveProperty('status', 'connected')
    })

    it('should return a valid ISO timestamp', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.timestamp).toBeDefined()
      
      // Validate ISO timestamp format
      const timestamp = new Date(response.body.timestamp)
      expect(timestamp.toISOString()).toBe(response.body.timestamp)
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/application\/json/)
    })

    it('should be accessible without authentication', async () => {
      // No authentication headers provided
      const response = await request(app).get('/health')

      // Should still return 200, not 401 or 403
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
    })

    it('should include all required service information', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.services).toBeDefined()
      expect(Object.keys(response.body.services)).toContain('mongodb')
      expect(Object.keys(response.body.services)).toContain('redis')
    })
  })

  describe('GET /health - Unhealthy scenarios', () => {
    it('should return error status when mongodb is disconnected', async () => {
      // Disconnect MongoDB
      await selectedDb.disconnect()

      const response = await request(app).get('/health')

      // Should return 503 for unhealthy services
      expect(response.status).toBe(503)
      expect(response.body.status).toBe('error')
      expect(response.body.services.mongodb.status).toBe('disconnected')
      expect(response.body.services.mongodb.readyState).not.toBe(1)

      // Reconnect for other tests
      await selectedDb.connect('acv-health-test')
    })

    it('should return error status when redis is disconnected', async () => {
      // Disconnect Redis
      await closeRedisConnection()

      const response = await request(app).get('/health')

      // Should return 503 for unhealthy services
      expect(response.status).toBe(503)
      expect(response.body.status).toBe('error')
      expect(response.body.services.redis.status).toBe('disconnected')

      // Reconnect for other tests
      await redisConnection(currentEnv.dataBase.redis.uri)
    })
  })
})
