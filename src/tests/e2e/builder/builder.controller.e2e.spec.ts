import { Builder } from '@lordcrainer/adaptcv-shared-types'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '@src/config/server'

import { getAuthToken } from '../helpers/auth.context'

describe('Builder Controller E2E Tests', () => {
  let tokenSuperAdmin: string
  let tokenUser: string

  describe('CRUD Operations by superAdmin', () => {
    beforeAll(async () => {
      tokenSuperAdmin = await getAuthToken('superAdmin')
    })

    it('should create a builder successfully via controller (SuperAdmin)', async () => {
      const builderData = { name: 'Test Builder', description: 'E2E Test' }
      const response = await request(app)
        .post('/v1/builders')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send(builderData)
      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.name).toBe(builderData.name)
    })
  })

  describe('CRUD Operations by user', () => {
    beforeAll(async () => {
      tokenUser = await getAuthToken('user')
    })

    it('should fetch a builder by ID via controller (User)', async () => {
      const builderData = {
        name: 'Fetch Builder',
        description: 'E2E Test',
        status: 'draft'
      } as Builder
      const createResponse = await request(app)
        .post('/v1/builders')
        .send(builderData)
        .set('Authorization', `Bearer ${tokenUser}`)
      expect(createResponse.status).toBe(201)
      expect(createResponse.body.data).toHaveProperty('_id')
      expect(createResponse.body.data.name).toBe(builderData.name)

      const builderId = createResponse.body.data._id

      const fetchResponse = await request(app)
        .get(`/v1/builders/${builderId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
      expect(fetchResponse.status).toBe(200)
      expect(fetchResponse.body.data).toBeDefined()
      expect(fetchResponse.body.data.name).toBe(builderData.name)
    })
  })
})
