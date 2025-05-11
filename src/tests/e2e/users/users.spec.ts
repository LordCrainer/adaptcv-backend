import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import type { UserCreationParams } from '@src/api/Users/interfaces/users.interface'

import app from '@src/config/server'

import { getAuthToken } from '../helpers/auth.context'

describe('Users End-to-End Tests', () => {
  let tokenSuperAdmin: string
  // let tokenAdmin: string

  beforeAll(async () => {
    tokenSuperAdmin = await getAuthToken('superAdmin')
    // tokenAdmin = await getAuthToken('admin')
  })

  describe('CRUD Operations by superAdmin', () => {
    it('Should the SuperAdmin be able to create a user', async () => {
      const user = {
        name: 'testuser',
        email: 'testuser@org1.com',
        password: 'password123',
        organizationId: 'orga1',
        role: 'admin'
      } as UserCreationParams['body']

      const response = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send(user)

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.email).toBe(user.email)
    })
  })
})
