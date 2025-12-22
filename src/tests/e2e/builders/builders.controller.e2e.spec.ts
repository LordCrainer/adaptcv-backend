import { IBuilder } from '@lordcrainer/adaptcv-shared-types'
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

    it('should duplicate a builder successfully via controller (SuperAdmin)', async () => {
      const originalData = {
        name: 'Duplicable Builder',
        description: 'E2E Duplicate Test',
        createdBy: 'test-user-id',
        status: 'draft'
      } as IBuilder
      const createRes = await request(app)
        .post('/v1/builders')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send(originalData)
      expect(createRes.status).toBe(201)
      const builderId = createRes.body.data._id

      const dupRes = await request(app)
        .post(`/v1/builders/${builderId}/duplicate`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
      expect(dupRes.status).toBe(201)
      expect(dupRes.body.data).toHaveProperty('_id')
      expect(dupRes.body.data._id).not.toBe(builderId)
      expect(dupRes.body.data.name).toBe(`${originalData.name} Copy`)
    })

    it('should update a builder successfully via controller (SuperAdmin)', async () => {
      const original = { name: 'Updatable Builder', description: 'E2E Update Test' } as IBuilder
      const createRes = await request(app)
        .post('/v1/builders')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send(original)
      const id = createRes.body.data._id
      const updated = { name: 'Updated Builder' }
      const updateRes = await request(app)
        .put(`/v1/builders/${id}`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send(updated)
      expect(updateRes.status).toBe(200)
      expect(updateRes.body.data).toBe(true)
      const fetchRes = await request(app)
        .get(`/v1/builders/${id}`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
      expect(fetchRes.body.data.name).toBe(updated.name)
    })

    it('should delete a builder successfully via controller (SuperAdmin)', async () => {
      const builder = { name: 'Deletable Builder', description: 'E2E Delete Test' } as IBuilder
      const createRes = await request(app)
        .post('/v1/builders')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send(builder)
      const id = createRes.body.data._id
      const deleteRes = await request(app)
        .delete(`/v1/builders/${id}`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
      expect(deleteRes.status).toBe(200)
      expect(deleteRes.body.data).toBe(true)
      const fetchRes = await request(app)
        .get(`/v1/builders/${id}`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
      expect(fetchRes.status).toBe(404)
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
      } as IBuilder
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
