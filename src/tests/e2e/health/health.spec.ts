import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import app from '@src/config/server'
import { dbStrategy } from '@src/config/db/dbStrategy'
import currentEnv from '@src/config/environments'

const selectedDb = dbStrategy.mongoMemory

describe('Health E2E Tests', () => {
  beforeAll(async () => {
    await selectedDb.connect('acv-health-test')
  })

  afterAll(async () => {
    await selectedDb.disconnect()
  })

  describe('GET /v1/health', () => {
    it('should return health status with all services ok', async () => {
      const response = await request(app).get('/v1/health')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Health check completed')
      expect(response.body.data.status).toBe('ok')
      expect(response.body.data.services.database).toBe('ok')
      expect(response.body.data.services.redis).toBe('ok')
      expect(response.body.data.timestamp).toBeDefined()
    })

    // Note: To test error cases, we would need to mock the connections,
    // but for e2e tests, we assume the services are running.
    // Error cases are better covered in unit tests.
  })
})